// apply blurs
import { extractPosts } from '../lib/dom/reddit-extractor';

export default defineContentScript({
  matches: ['*://*.reddit.com/*'],
  main() {
    console.log(`%c[Undrift] CONTENT SCRIPT INJECTED on ${location.href}`, 'background: #3E6B63; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;');
    runExtraction();

    const feedContainer = findFeedContainer();
    const observer = new MutationObserver(() => {
      debouncedExtraction();
    });

    observer.observe(feedContainer, {
      childList: true,
      subtree: true,
    });
    console.log('[Undrift] Watching feed container:', feedContainer);
  },
});


// --- HELPER FUNCTIONS ---

function findFeedContainer(): Node {
  const feed = document.querySelector('shreddit-feed, shreddit-app');
  if (feed) {
    console.log("🎯 [Undrift] Found precise feed container:", feed.tagName);
    return feed;
  }
  
  // fallback if Reddit changes their layout
  console.warn("⚠️ [Undrift] Specific feed container not found, falling back to document.body");
  return document.body;
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function debouncedExtraction(delay = 500) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    runExtraction();
  }, delay);
}

function runExtraction() {
  const newPosts = extractPosts();

  if (newPosts.length === 0) {
    return; // normal - most mutations are already seen posts
  }

  console.log(`[Undrift] Intercepted ${newPosts.length} new posts.`);

  const cleanLogs = newPosts.map(post => ({
    ID: post.id,
    Subreddit: post.subreddit,
    Title: post.title.length > 50 ? post.title.substring(0, 50) + '...' : post.title,
    // Body: post.body.length > 50 ? post.body.substring(0, 50) + '...' : post.body
  }));

  console.table(cleanLogs);

  // chrome.runtime.sendMessage({ action: "SCORE_POSTS", payload: newPosts });

}