// apply blurs
import { extractPosts } from '../lib/dom/reddit-extractor';

export default defineContentScript({
  matches: ['*://*.reddit.com/*'],
  main() {
    console.log('%c[reddit.ts] CONTENT SCRIPT LOADED', 'background: red; color: white; font-size: 20px;');
    
    // Initial pass — scrape posts already on the page when the script loads
    runExtraction();

    // 1. THE TARGET: 
    // You are telling the observer to watch the specific HTML box that holds the feed.
    const feedContainer = findFeedContainer();

    // 2. THE CALLBACK:
    // When a change happens, this triggers. Claude ignored the 'mutationsList' 
    // array because your debouncer simply says, "If ANYTHING changes, wait 500ms and scrape."
    const observer = new MutationObserver(() => {
      debouncedExtraction();
    });

    // 3. THE TRIGGER & CONFIGURATION:
    // You attach the observer to the feedContainer.
    // You tell it: "Watch for ANY new HTML tags being added (childList) 
    // anywhere deep inside this feed (subtree)."
    
    observer.observe(feedContainer, {
      childList: true,
      subtree: true,
    });
  },
});


// --- HELPER FUNCTIONS ---

function findFeedContainer(): Node {
  // Reddit's modern UI encapsulates the feed inside <shreddit-feed>.
  // Older/alternate UIs use <shreddit-app>. 
  // Targeting these instead of document.body saves massive CPU power.
  const feed = document.querySelector('shreddit-feed, shreddit-app');
  if (feed) {
    console.log("🎯 [Undrift] Found precise feed container:", feed.tagName);
    return feed;
  }
  
  // Ultimate fallback if Reddit changes their layout
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
  // 1. extractPosts() now returns the array of ExtractedPost objects
  const newPosts = extractPosts();

  // 2. We silently return if 0. (Do NOT throw a console.warn here).
  // The observer fires hundreds of times when images/ads load.
  // Because our Set deduplicates old posts, it is completely normal to return 0.
  if (newPosts.length === 0) {
    return;
  }

  console.log(`📡 [Undrift] Intercepted ${newPosts.length} new posts.`);

  // 3. Map the data into a clean spreadsheet for the console table.
  // We strip out the heavy HTML 'element' so the table is easy to read.
  const cleanLogs = newPosts.map(post => ({
    ID: post.id,
    Subreddit: post.subreddit,
    Title: post.title.length > 50 ? post.title.substring(0, 50) + '...' : post.title,
    // Body: post.body.length > 50 ? post.body.substring(0, 50) + '...' : post.body
  }));

  // Render the beautiful spreadsheet in your DevTools
  console.table(cleanLogs);

  // FUTURE STEP: Send newPosts to background.ts to pass to your AI model
  // chrome.runtime.sendMessage({ action: "SCORE_POSTS", payload: newPosts });

}