// apply blurs
import { extractPosts } from '../lib/dom/reddit-extractor';

export default defineContentScript({
  matches: ['*://*.reddit.com/*'],
  
  main() {
    console.log(`%c[Undrift] CONTENT SCRIPT INJECTED on ${location.href}`, 'background: #3E6B63; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;');
    
    // Run immediate extraction for posts already on the screen upon load
    runExtraction();

    // Find the specific DOM element that holds the feed
    const feedContainer = findFeedContainer();
    console.log('[Undrift] Watching feed container:', feedContainer);
    
    // Observer to watch for new posts as the user scrolls
    const observer = new MutationObserver(() => {
      debouncedExtraction();
    });

    // Start watching the feed container for any added HTML nodes
    observer.observe(feedContainer, {
      childList: true, // if new HTML nodes are added or removed
      subtree: true, // if nodes deep inside this container change
    });
  },
});


// --- HELPER FUNCTIONS ---

// Find where the posts live in the DOM
function findFeedContainer(): Node {
  const feed = document.querySelector('shreddit-feed, shreddit-app');

  if (feed) {
    console.log("🎯 [Undrift] Found precise feed container:", feed.tagName);
    return feed;
  }
  
  // fallback if Reddit changes their component names
  console.warn("⚠️ [Undrift] Specific feed container not found, falling back to document.body");
  return document.body;
}

// Prevent the browser from crashing during fast, infinite scrolling
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

// Reddit loads UI elements in rapid chunks
// This 500ms delay groups those hundreds of tiny DOM mutations into a single execution, preventing overloading CPU and crashing the browser
function debouncedExtraction(delay = 500) {
  if (debounceTimer) clearTimeout(debounceTimer);

  // Start a new countdown
  debounceTimer = setTimeout(() => {
    runExtraction();
  }, delay);
}


// Extract, clean, and log the data once the DOM settles (full, uninterrupted 500ms)
function runExtraction() {
  const newPosts = extractPosts();

  // If no new posts were found, stop here to save CPU cycles and memory
  if (newPosts.length === 0) {
    return; // normal - most mutations are already seen posts
  }

  console.log(`[Undrift] Intercepted ${newPosts.length} new posts.`);

  // Format the data to a clean table console log
  const cleanLogs = newPosts.map(post => ({
    ID: post.id,
    Subreddit: post.subreddit,
    Title: post.title.length > 50 ? post.title.substring(0, 50) + '...' : post.title,
    // Body: post.body.length > 50 ? post.body.substring(0, 50) + '...' : post.body
  }));

  console.table(cleanLogs);

  // TODO: Send extracted data to background for ML scoring
  // chrome.runtime.sendMessage({ action: "SCORE_POSTS", payload: newPosts });

}