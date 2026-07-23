// extract the post title and subreddit for context to be fed into classifiers
// extract ID for deduplication via the seenIds Set and targeting the exact DOM element for blurring interventions later
// body/context paragraph extraction attempted but deferred due to highly dynamic Shadow DOM structures that vary drastically between text, link, and media posts
// image posts store captions differently than text posts made it too fragile for now.

// future consideration: add network interceptor method to not be sensitive to the CSS class names

// https://dataflirt.com/glossary/dynamic-class-name-obfuscation/
// https://instantproxies.com/blog/scraping-websites-with-randomized-class-names/
// https://deepwiki.com/joeseesun/opencli-skill/7.4-dom-scraping-best-practices
// https://medium.com/@pentester720/i-stopped-fixing-broken-parsers-at-3-am-heres-how-we-outsourced-our-dom-extraction-cd677bad471a


export interface ExtractedPost {
  id: string;
  title: string;
  subreddit: string;
  // body: string; // deferred — see notes above
  element: Element;
}

// keep track of seen IDs to handle duplicates later
const seenIds = new Set<string>();

export function extractPosts(): ExtractedPost[] {
  const posts = document.querySelectorAll(
    "shreddit-post, article, div[data-ks-id], div[data-testid='post-container']"
  );

  const extractedPosts: ExtractedPost[] = [];

  posts.forEach((post) => {
    // Skip if already processed
    if (post.hasAttribute("data-undrift-processed")) return;

    // 0. EXTRACT PERMALINK (gives us id + subreddit in one shot)
    // Reddit's permalink format: /r/<subreddit>/comments/<id36>/<title_slug>/
    let permalinkHref = "";
    const permalinkEl = post.querySelector('a[slot="full-post-link"], a[href*="/comments/"]');
    if (permalinkEl) {
      permalinkHref = permalinkEl.getAttribute("href") || "";
    }

    const permalinkMatch = permalinkHref.match(/\/r\/([^/]+)\/comments\/([a-zA-Z0-9]+)\/([^/]*)/);
    const hrefSubreddit = permalinkMatch?.[1] ?? "";
    const hrefId36 = permalinkMatch?.[2] ?? "";
    // Note: title-slug from permalink intentionally unused —
    // post-title attribute is the reliable primary source.

    // --- A. EXTRACT DATABASE ID (attribute-based, preferred over href when available) ---
    let postId =
      post.getAttribute("data-ks-id") ||
      post.getAttribute("post-id") ||
      post.getAttribute("id") ||
      (hrefId36 ? `t3_${hrefId36}` : null);

    // Speculative fallback (shadow DOM)
    // data-ks-id currently lives in the light DOM (confirmed via DevTools). 
    // Kept in case Reddit moves this attribute into the shadow root in a future markup change.
    if (!postId && post.shadowRoot) {
      const link = post.shadowRoot.querySelector('a[data-ks-id], shreddit-post-flair[post-id]');
      if (link) {
        postId = link.getAttribute("data-ks-id") || link.getAttribute("post-id");
      }
    }

    // Require a valid Reddit post ID (t3_)
    if (!postId || !postId.startsWith("t3_")) return;
    if (seenIds.has(postId)) return;
    seenIds.add(postId);

    // --- B. EXTRACT SUBREDDIT ---
    // Primary: confirmed homepage structure — span[data-testid="subreddit-name"] > a
    let subreddit = "";
    const subredditSpan = post.querySelector('span[data-testid="subreddit-name"] a');
    if (subredditSpan) {
      subreddit = subredditSpan.textContent?.trim() || "";
    }

    // Fallback 1: direct attributes (some component variants expose it this way)
    if (!subreddit) {
      subreddit =
        post.getAttribute("subreddit-prefixed-name") ||
        post.getAttribute("subreddit-name") ||
        "";
    }

    // Fallback 2: generic testid, in case markup varies by page type
    if (!subreddit) {
      const subLink = post.querySelector('a[data-testid="subreddit-name"]');
      if (subLink) {
        subreddit = subLink.textContent?.trim() || "";
      }
    }

    // Fallback 3: from the permalink href itself
    if (!subreddit && hrefSubreddit) {
      subreddit = hrefSubreddit;
    }

    // --- C. EXTRACT TITLE (Light DOM / Attributes) ---
    let title = post.getAttribute("post-title") || "";

    if (!title) {
      const titleEl = post.querySelector('a[slot="full-post-link"], a[slot="title"], h3');
      if (titleEl) {
        title = titleEl.textContent?.trim() || "";

        if (!title && titleEl.hasAttribute("href")) {
          const href = titleEl.getAttribute("href") || "";
          const match = href.match(/\/comments\/[a-zA-Z0-9]+\/([^\/]+)\/?/);
          if (match && match[1]) {
            title = match[1].replace(/_/g, " ");
          }
        }
      }
    }

    /*
    // --- D. EXTRACT BODY PARAGRAPH (deferred — see file header notes) ---
    // Does NOT work for post-type="image"/gallery posts, whose captions live in a different,
    // not-yet-identified component. Revisit via DevTools inspection of an
    // image post's caption container before re-enabling, or source body/caption
    // text from the background-script JSON fetch instead (Reddit's .json
    // response may expose it more reliably than the DOM does).

    let body = "";
    const textBodyContainer = post.querySelector("shreddit-post-text-body");
    const hasTextBody = !!textBodyContainer;

    const bodySelector = 'div[property="schema:articleBody"] p, div[id*="post-rtjson-content"] p, p';

    if (textBodyContainer) {
      let paragraphs = textBodyContainer.querySelectorAll(bodySelector);

      if (paragraphs.length === 0 && textBodyContainer.shadowRoot) {
        paragraphs = textBodyContainer.shadowRoot.querySelectorAll(bodySelector);
      }

      const pTexts: string[] = [];
      paragraphs.forEach((p) => {
        const txt = p.textContent?.trim();
        if (txt) pTexts.push(txt);
      });

      body = pTexts.join("\n");
    }

    if (hasTextBody && !body) {
      console.warn(`[extractor] Found text-body container but extracted no text for post ${postId} — check selectors`);
    }
    */

    // --- E. VALIDATE AND TAG ---
    post.setAttribute("data-undrift-processed", "true");
    post.setAttribute("data-undrift-id", postId);

    extractedPosts.push({
      id: postId,
      title: title.trim(),
      subreddit: subreddit.trim(),
      // body: body.trim(), // deferred — see notes above
      element: post,
    });
  });

  return extractedPosts;
}