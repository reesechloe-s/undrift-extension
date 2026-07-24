<!-- My Notes On What I Learned From Doing This Project -->

# Hoisting
- In C, C++, or even Python, the compiler reads from top to bottom. If I try to call a function before it is defined, the program throws an error. 
- JavaScript and TypeScript operate under a different set of rules due to a feature called Hoisting

## How Hoisting Works
When the JavaScript engine runs your code, it does not execute it line-by-line immediately. It makes a quick first pass over the entire file and pulls all function declarations into memory.

Because of this, you can safely call findFeedContainer() on line 10, even though the actual function is not written until line 30. The engine already knows it exists.

## Clean Code Standard: High-level execution details should be presented first, with specific implementation details following later.

References
 Robert C. Martin's Clean Code
 https://devcom.com/tech-blog/clean-code-principles-best-practices/

This means the main function should be at the top because it defines how the system works. The specific details on how it works include the helper functions.

Lower-level code should show how one part works, while top-level code should describe what the bigger system is doing. This helps a software developer understand the sequence of actions first. Then, if needed, they can go deeper into the supporting methods that handle each step.

Keep that separation accurate and succinct. A top-level method could name the business processes, such as “validate invoice,” “calculate totals,” “save invoice,” and “notify finance team.” Meanwhile, query logic, formatting, retries, and transport details could sit below in separate methods.