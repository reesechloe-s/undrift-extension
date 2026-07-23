export default defineBackground(() => {
  console.log("🧠 Undrift: Background Brain Initialized!");

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "FETCH_AND_SCORE") {
      const postIds = message.payload;

      (async () => {
        try {
          const cleanData = await fetchPostsByIds(postIds);
          console.log("[Brain] Successfully fetched clean data:", cleanData);
        } catch (error) {
          console.error("[Brain] Error processing posts:", error);
        }
      })();

      return true;
    }
  });
});

// The Bypasser Function
async function fetchPostsByIds(postIds: string[]) {
  const idString = postIds.join(',');
  
  const res = await fetch(`https://www.reddit.com/api/info.json?id=${idString}`, {
    method: 'GET',
    // 1. The Headers Bypass: Give Reddit the descriptive name it demands
    headers: {
      'User-Agent': 'chrome-extension:digital-twin-ragebait-blocker:v1.0 (by /u/yourusername)'
    },
    // 2. The Cookie Bypass: Send your active Reddit login session
    credentials: 'include' 
  });

  if (!res.ok) {
    throw new Error(`API Blocked. Status: ${res.status}`);
  }
  
  const data = await res.json();
  
  // Map Reddit's messy JSON into a clean, simple array
  const cleanPosts = data.data.children.map((child: any) => ({
    id: child.data.name,       
    title: child.data.title,   
    subreddit: child.data.subreddit
  }));

  return cleanPosts;
}