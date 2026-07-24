<!-- What I learned Building the Undrift Extension -->


# 1. Core Architecture & Software Engineering Principles
## 1.1 Hoisting & JavaScript Runtime Execution
Language Compilers vs. JS Engine: In languages like C, C++, or Python, code is evaluated strictly top-to-bottom. Calling a function before defining it results in a compilation or runtime error.

The Two-Pass System: JavaScript and TypeScript engines execute code in two passes. During the creation phase (Pass 1), the engine scans the file and moves all function declarations into memory before executing any code.

Practical Benefit: You can safely invoke a function like findFeedContainer() on line 10 even if its full logic is declared on line 100.

## 1.2 Clean Code Standards (Step-Down Rule)
References
 Robert C. Martin's Clean Code
 https://devcom.com/tech-blog/clean-code-principles-best-practices/

The Newspaper Metaphor: Inspired by Robert C. Martin’s Clean Code, high-level execution details should always be presented at the top of a file, with lower-level implementation details following below.

Top-Level Orchestration (main()): Functions like main() should sit at the very top of the file to act as a readable "table of contents" (e.g., 1. Extract current posts -> 2. Find feed container -> 3. Observe dynamic updates).

Low-Level Helpers at the Bottom: Complex DOM query logic, setTimeout wrappers, and attribute formatters sit at the bottom. This allows another developer to understand the core business process in 15 seconds without getting bogged down in implementation noise.

## 1.3 Manifest V3 Architecture: Content Scripts vs. Background Workers
Strict Separation of Concerns: Manifest V3 enforces isolated contexts to maintain security, memory safety, and cross-origin compliance.

Content Scripts (reddit.content.ts): Injected directly into the web page context. They have complete access to the live DOM (HTML tree) but limited access to Chrome extension APIs and cross-origin fetch requests. They exist only while the tab is active.

Background Scripts / Service Workers (background.ts): Run invisibly in an isolated extension background process. They cannot touch or modify the DOM, but they hold full access to Chrome APIs, persist state across tabs, and bypass CORS (Cross-Origin Resource Sharing) restrictions when making external network requests.

The Message Bridge: Because neither script can do both jobs alone, chrome.runtime.sendMessage() serves as the bridge—letting the Content Script scrape and modify the DOM while the Background Worker handles heavy computing, networking, and state management.

## 1.4 DOM Serialization Limits
JSON Serialization Barrier: Message passing between Content Scripts and Background Workers uses JSON stringification under the hood (JSON.stringify()).

DOM Node Crash Risk: Live DOM elements (like an HTMLDivElement or Element) contain complex circular references and internal browser bindings that cannot be converted to JSON strings.

Rule: Attempting to pass raw DOM elements inside a message payload causes quiet drops or TypeError: Converting circular structure to JSON crashes. Raw elements must remain in the Content Script, while only plain data primitives (strings, numbers, simple objects) are sent over the wire.

- In my reddit.content.ts, function returns an array of ExtractedPost objects. Crucially, this object contains element: Element (the actual DOM node).

- When a message is sent via hrome.runtime.sendMessage(), Chrome attempts to serialize the payload into JSON. DOM elements cannot be serialized into JSON. If you pass the entire newPosts array, the message will fail, often silently or with a circular structure error.

## 1.5 Local-First AI vs. Cloud API Infrastructure
The Latency Trap: Sending user scroll data to remote servers (e.g., OpenAI or AWS) introduces 300ms–1500ms network round-trip delays—far too slow for real-time feed interception.

Scaling & Cost Liabilities: High-volume scroll feeds generate thousands of events per user daily. Relying on pay-per-token Cloud APIs creates exponential hosting costs.

Privacy Assurance: Transmitting user browsing feeds to external cloud servers creates privacy liabilities and requires complex user consent pipelines.

The Local-First Solution: Running lightweight ML models natively inside the browser session costs $0 to scale, maintains complete user data privacy, and runs fast enough to blur toxic content before the user's eyes can track it.

# DOM Manipulation, Scraping & Performance Optimization
## 2.1 DOM Extraction Strategy & The "Attribute Jackpot"
The Fragility of CSS Selectors: Scraping websites based on class names (e.g., <div class="_2sd4f...">) is brittle because modern SPAs scramble or auto-generate CSS classes during builds.

The "Attribute Jackpot": Reddit’s modern Web Components (<shreddit-post>) expose structured data directly as HTML attributes on the root node:

HTML
<shreddit-post 
  id="t3_1uxzgja" 
  post-title="Example Post Title" 
  subreddit-prefixed-name="r/technology" 
  score="1200">

Performance Gain: Reading direct properties (post.getAttribute('post-title')) bypasses deep DOM tree traversal entirely, executing in sub-milliseconds.

## 2.2 Light DOM vs. Shadow DOM Traversal
Shadow DOM Isolation: Web Components utilize Shadow Roots (#shadow-root) to isolate internal styles and markup, hiding them from standard document.querySelectorAll() calls.

The Slotted Element Discovery: Through DevTools inspection, elements like <a> tags containing post links and data-ks-id were found to be slotted elements residing in the Light DOM alongside the Shadow Root, rather than trapped inside it.

Resilient Traversal Hierarchy:

Primary: Scan direct parent node attributes in the Light DOM.

Secondary: Scan accessible slotted elements in the Light DOM.

Last Resort Fallback: Explicitly target the component node and access .shadowRoot.querySelector() only when surface attributes are missing.

## 2.3 Handling Dynamic SPAs: MutationObserver
Single Page App Dynamics: Modern feeds do not perform full page reloads; they dynamically append new HTML nodes as the user scrolls.

Observer Scope Precision: Attaching a MutationObserver to document.body triggers every time any element on the page changes (ads, sidebars, counters). Finding the precise feed container (<shreddit-feed>) drastically cuts unnecessary event triggers.

Avoiding Observer Noise: Disabling attributes: true on the observer config prevents the observer from firing when unrelated element properties change, keeping performance clean.

## 2.4 The Debounce Pattern (Throttling Infinite Scroll)
The Problem: Scrolling down a Reddit feed injects hundreds of tiny HTML nodes in milliseconds. Running a complex scraping function on every single mutation will max out the CPU, freeze the browser, and crash the extension.

The Solution (Debouncing): I wrap my execution logic in a setTimeout (e.g., 500ms). Every time the observer fires, it clears the previous timer and start a new one. The scraping logic only actually runs once the DOM has "settled" and stopped mutating for a full half-second, drastically saving CPU cycles.

## 2.5 Preventing Observer Infinite Loops
The Loop Threat: When the extension modifies a post element (e.g., injecting a blur wrapper or changing a class), that modification is detected by the MutationObserver as a new DOM change, re-triggering the observer in an infinite loop.

Deduplication via Caching (seenIds): Maintain a module-level JavaScript Set<string> containing processed post IDs.

Dataset Namespace Isolation: Inject a custom dataset attribute into processed nodes (element.dataset.twinProcessed = "true").

Collision Safety: Using custom namespaces like data-twin-processed avoids colliding with Reddit's native attributes like data-processed.

## 2.6 Defensive Programming & Graceful Degradation
Platform Risk: Frontend architectures change frequently. If code strictly relies on <shreddit-feed> and Reddit renames it to <reddit-feed-container>, hard assertions will throw uncaught errors and break the extension.

Graceful Degradation Pattern:
TYPESCRIPT: 
function findFeedContainer(): Node {
  const feed = document.querySelector('shreddit-feed, shreddit-app');
  if (feed) return feed;

  console.warn("⚠️ Feed container not found, falling back to document.body");
  return document.body; // Keeps the app functional even if sub-optimal
}

# 3. Data Diet & Machine Learning Strategy
## 3.1 Token Economics in Browser-Based ML
Token Costs: Machine Learning models process text as "tokens" (chunks of characters). Model compute complexity scales relative to input length.

Context vs. Overhead: A post Title + Subreddit requires ~50 to 200 tokens. A full post body plus comments can exceed 10,000 tokens.

User Intent Realism: Clickbait and ragebait rely on emotional hooks embedded directly in the post Title and Subreddit context. The title creates the information gap; therefore, processing the title alone provides high classification accuracy at a fraction of the compute cost.

## 3.2 Why Comments Were Excluded (The 3 Critical Bottlenecks)
1. The Network Death Trap (HTTP 429 & Anti-Bot Bans)
The aggregated batch endpoint /api/info.json returns post metadata but excludes comment trees.

Fetching comments requires firing individual API requests for every single post on screen (/comments/t3_1uxzgja.json).

Scrolling past 20 posts would trigger 20 simultaneous network calls, instantly hitting Reddit's anti-bot rate limits and returning HTTP 429 Too Many Requests.

2. Token Limits & Model Memory Overload
A post title is ~50–200 tokens, whereas active comment sections easily reach 5,000–10,000 tokens per post.

Passing 10,000 tokens per post into a local browser LLM (e.g., WebLLM) overwhelms available GPU/RAM, freezing the browser tab.

3. Latency (The Doomscrolling Window)
The goal is real-time intervention—blurring ragebait before the user reads it.

Processing Title + Subreddit takes milliseconds. Processing a multi-level comment thread takes seconds. By the time the AI finishes analyzing comments, the user has already read the content and scrolled past.

## 3.3 Post Body & Image Caption Extraction Deferral
Image Post Asymmetry: Standard text posts expose <shreddit-post-text-body>, but image posts (post-type="image") store captions in entirely different structures or omit them altogether.

Engineering Decision: To maintain high reliability and prevent runtime type crashes (Cannot read properties of undefined), post body paragraph extraction was deferred in favor of a strict Title + Subreddit payload.

# 4. Tooling, Framework Friction & Debugging Log
## 4.1 Framework Architecture (WXT, Vite & Manifests)
WXT Abstraction: WXT uses Vite under the hood to compile extension scripts and dynamically auto-generate the manifest.json file inside the .output/ build directory.

Dev Server Auto-Launcher Issues: In environment setups missing standalone Chrome binaries, WXT's default runner crashes with No Chrome installations found.

Fix: Disable auto-launch in wxt.config.ts:

export default defineConfig({
  runner: { disabled: true }
});

## 4.2 Resolving the WXT Sandbox Export Bug
The Bug: During build time, Vite threw a blocking compilation error: Cannot find module 'wxt/sandbox' / "./sandbox" is not exported.

Root Cause Analysis: Older WXT tutorials instructed developers to import background definitions directly via import { defineBackground } from 'wxt/sandbox'. Newer versions of WXT deprecated this path and moved utilities to ambient global injections or wxt/utils/*.

Resolution: Removed the manual import entirely. Modern WXT automatically injects defineBackground as a global ambient variable, clearing the Vite build error.

## 4.3 Content Script Injection & Build Environment Troubleshooting
Empty Sidepanel Prerender Crash: linkedom threw prerender errors when sidepanel/index.html lacked base HTML structure. Fixed by adding valid boilerplate (<!DOCTYPE html><html>...</html>).

Uninjected Content Scripts: Traced un-injected scripts back to chrome.runtime.getManifest().content_scripts returning undefined, caused by running npm run dev in an mismatched project directory.

Console Mapping Fix: Fixed a runtime crash (Cannot read properties of undefined (reading 'length')) in console.table() by ensuring cleanLogs matched the actual extracted properties on ExtractedPost.

# 5. Core Technical Skills Summary
                       ┌────────────────────────┐
                       │   Undrift Architecture │
                       └───────────┬────────────┘
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      ▼                            ▼                            ▼
┌──────────────┐          ┌─────────────────┐          ┌─────────────────┐
│ Data Eng.    │          │ Automation      │          │ ML Infrastructure│
├──────────────┤          ├─────────────────┤          ├─────────────────┤
│ • Custom ETL │          │ • MutationObs.  │          │ • Local-first   │
│ • Dedupe Sets│          │ • Debounce sync │          │ • Low-latency   │
│ • Schema Map │          │ • Loop Safety   │          │ • Token-diet    │
└──────────────┘          └─────────────────┘          └─────────────────┘
Data Engineering (ETL Pipeline): Designed a custom Extract-Transform-Load pipeline that reads unstructured Web Components, cleans missing/null states, deduplicates via Set caches, and formats payloads into structured schemas.

Automation Engineering: Built a background system using MutationObserver that monitors DOM state, handles asynchronous scroll events, and manages memory boundaries without impacting host site performance.

Machine Learning Infrastructure: Implemented real-time data plumbing for browser-side AI classification, handling data ingestion, context isolation, and performance guardrails around local models.

Data Analytics Readiness: Established data structures and ID schemas designed to feed directly into Phase 3 analytics pipelines for calculating user drift metrics and behavioral trends.

# 6. Open Source Licensing & Legal Protection
The MIT License Standard
Permissive Open Source: Allows third parties to view, clone, modify, and distribute the repository (for personal or commercial use) as long as copyright notices remain intact.

Liability Protection (The "As-Is" Clause): Crucial for developer safety, the license includes an explicit disclaimer stating the software is provided "AS IS", completely shielding the author from legal liability or damages if the extension fails or impacts an enterprise environment.

# 7. Comprehensive Project Development Journal
## Day 1 (Tuesday, July 21, 2026)
Local-First Architecture Decision: Rejected paid cloud APIs (e.g., Serper/OpenAI) to preserve user privacy and avoid high hosting fees.

DOM Mastery over CSS Classes: Identified the fragility of dynamic CSS selectors and built an Adapter Pattern around stable <shreddit-post> elements.

Performance Protection: Implemented a debounced MutationObserver to prevent infinite scroll from overloading browser CPU threads.

Code Understanding: Prioritized understanding foundational runtime mechanics over blindly copying black-box scripts.

## Day 2 (Wednesday, July 22, 2026)
Morning: DOM Discovery & Shadow DOM Navigation
Goal: Extract unique post IDs (t3_...) from the live feed.

Struggle: Navigating deeply nested Web Components and #shadow-root boundaries.

Breakthrough (~10:29 AM): Confirmed that target <a> elements carrying data-ks-id were slotted into the Light DOM, meaning direct element queries worked without needing to manually break into the Shadow Root.

Revision: Refactored extractor.ts to check Light DOM parent containers first, using shadow root traversal only as a fallback.

Midday: Network Policies & Data Scope
Goal: Acquire post payload data for AI evaluation.

Struggle: Encountered Reddit's anti-bot warning page ("whoa there, pardner!") when testing direct API calls from the front-end.

Solution: Standardized the payload on Title + Subreddit. Ruled out comment scraping to prevent rate-limiting (HTTP 429) and memory bottlenecks. Scheduled API requests to route through background.ts with explicit User-Agent headers and session handling.

Afternoon: The Attribute Jackpot & Optimization
Goal: Fast, reliable field extraction.

Breakthrough: Located direct HTML attributes (post-title, subreddit-prefixed-name, id, score) on <shreddit-post> elements.

Revision:

Updated extractor.ts to prioritize direct attribute reads for millisecond extraction.

Added custom state tracking (data-twin-processed) to avoid collisions with Reddit's native properties.

Created a global seenIds set to eliminate duplicate processing across scroll cycles.

Late Afternoon: Framework Friction & Build Resolution
Goal: Connect extraction functions to the reddit.content.ts observer loop.

Struggle (~3:34 PM): Encountered WXT build errors: Cannot find module 'wxt/sandbox' and Vite compilation errors stating "./sandbox" is not exported.

Solution: Identified that background.ts contained an obsolete import path (import { defineBackground } from 'wxt/sandbox'). Removed the manual import, relying on WXT's ambient global injection to resolve the build error.

Status: Build system stabilized, outputting clean, deduplicated post data ({id, title, subreddit, element}) across homepage feeds with fallback chains intact.

## Day 3 (Thursday, July 23, 2026)
- Pushed it on GitHub to track my progress + practice commit messages
- To also showcase my contributions
- Did not do any much coding this day due to wrist pain.

## Day 4 (Friday, July 24, 2026)
- Understood the code in reddit-extractor.ts and reddit.content.ts completely and very well
- Got curious why it was okay to write the functions at the bottom in TypeScript but when I used to code in C, C++, and Python, we were instructed to declare the functions on top. This led me to know about Hoisting and Robert C. Martin's Clean Code principle
- Found out a critical flaw in my reddit.content.ts: DOM elements cannot be serialized into JSON.
- Fixed the serialization bug in reddit.content.ts by mapping the scraped array to only extract the raw data (like string IDs, titles, and subreddits), leaving the actual DOM element behind before sending the message.
- Got overwhelmed with all the new learnings, so I created this LearningNotes.md and with the help of my AI assistant who tracks my progress daily, I let it generate all the learnings while integrating my notes in Obsidian.
- Wrapped my head around the strict architecture of Manifest V3: Content Scripts act as the "eyes and hands" (injected into the page to read/modify the DOM), while Background Scripts act as the "brain" (running invisibly, bypassing CORS, and handling APIs). They talk to each other using browser.runtime.sendMessage.
- Built a bulletproof, dual-path data pipeline to make the extension resilient. Path A (Primary) takes the scraped IDs and hits Reddit's hidden backend API (info.json) for perfectly structured data that never breaks when CSS changes. Path B (Fallback) kicks in automatically to use the raw scraped DOM data if Reddit ever rate-limits the API.
- Figured out how to tame the MutationObserver without nuking the CPU. Infinite scrolling injects hundreds of tiny HTML nodes in milliseconds. By wrapping the scraper in a 500ms debounce timer, the script waits until the DOM settles before running, preventing the browser from freezing.
- Made a huge architectural decision regarding Machine Learning constraints: I am intentionally dropping the post body text from the MVP. The psychological hook of ragebait/clickbait lives entirely in the title. By feeding the local ML model strictly the Title + Subreddit, I save thousands of tokens, which keeps the extension blazing fast and saves the user's laptop battery.
