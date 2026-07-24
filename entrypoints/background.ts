// Two Paths to Data

// Path A: API fetch
// bg takes the IDs from the scraped data and hit Reddit's backend API
// Reddit's API responds with perfectly formatted JSON object containing the title, subreddit, and body for those exact IDs.
// The ML model uses this API for context, not the data you scraped from the screen.
// Reason why this is primary path: 
  // It is resilient agains CSS name changes/

// Path B: Direct DOM passing
// skips API request entirely to save bandwith, improve speed, and avoid any risk of Reddit rate-limiting the extension

export default defineBackground(() => {
  console.log("[Undrift] Background Initialized!");

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "SCORE_POSTS") {
      // We are receiving an array of objects: { id, title, subreddit }
      const scrapedPosts = message.payload; 
      
      // Extract just the IDs for Path A
      const postIds = scrapedPosts.map((post: any) => post.id);

      (async () => {
        let finalDataToScore;

        try {
          // --- PRIMARY: Path A (Reddit API) ---
          finalDataToScore = await fetchPostsByIds(postIds);
          console.log("[Brain] API Fetch Success (Path A). Proceeding with API data.");
        } catch (error) {
          // --- FALLBACK: Path B (DOM Scraped Data) ---
          console.warn(`[Brain] API Fetch Failed (${error}). Falling back to DOM Scraped Data (Path B).`);
          finalDataToScore = scrapedPosts;
        }

        try {
          // TODO: Pass finalDataToScore to lightweight local ML model for scoring
          // const scoredData = await scoreWithML(finalDataToScore);

          // Send the data (eventually the scored data) back to the content script
          sendResponse({ success: true, data: finalDataToScore }); 
        } catch (scoreError) {
          console.error("[Brain] Error during ML scoring:", scoreError);
          sendResponse({ success: false, error: String(scoreError) });
        }
      })();

      return true;
    }
  });
});

// The Bypasser Function (Path A)
async function fetchPostsByIds(postIds: string[]) {
  const idString = postIds.join(',');
  
  const res = await fetch(`https://www.reddit.com/api/info.json?id=${idString}`, {
    method: 'GET',
    headers: {
      'User-Agent': 'chrome-extension:undrift:v1.0 (by /u/reesechloe_s)'
    },
    credentials: 'include' 
  });

  if (!res.ok) {
    throw new Error(`Status ${res.status}`);
  }
  
  const data = await res.json();
  
  const cleanPosts = data.data.children.map((child: any) => ({
    id: child.data.name,       
    title: child.data.title,   
    subreddit: child.data.subreddit
    // body text is not to be processed as this will take too much tokens for the ML to run
  }));

  return cleanPosts;
}