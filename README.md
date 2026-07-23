```python
markdown_content = """<div align="center">
  <h1>Undrift</h1>
  <p>
    A high-performance, local-first Chrome extension that intercepts real-time social media feeds, runs lightweight machine learning inference, and dynamically mitigates outrage-driven algorithmic content.
  </p>

<!-- Badges -->
<p>
  <a href="">
    <img src="https://img.shields.io/github/last-commit/your-username/undrift-extension" alt="last update" />
  </a>
  <a href="https://github.com/your-username/undrift-extension/stargazers">
    <img src="https://img.shields.io/github/stars/your-username/undrift-extension" alt="stars" />
  </a>
  <a href="https://github.com/your-username/undrift-extension/issues/">
    <img src="https://img.shields.io/github/issues/your-username/undrift-extension" alt="open issues" />
  </a>
  <a href="https://github.com/your-username/undrift-extension/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/your-username/undrift-extension.svg" alt="license" />
  </a>
</p>
</div>

<br />

<!-- Table of Contents -->
# Table of Contents

- [About the Project](#about-the-project)
  * [Tech Stack](#tech-stack)
  * [Features](#features)
- [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
  * [Run Locally](#run-locally)
- [Usage](#usage)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgements](#acknowledgements)

<!-- About the Project -->
## About the Project

Undrift is an AI Digital Twin designed to mitigate algorithmic ragebait. Rather than using backend automation frameworks hosted on remote servers, this extension executes natively within the user's browser session. This eliminates multi-second delays, protects privacy by riding on existing authenticated sessions locally, and requires zero infrastructure overhead.

### Tech Stack

<details>
  <summary>Client / Extension</summary>
  <ul>
    <li><a href="https://www.typescriptlang.org/">Typescript</a></li>
    <li><a href="https://reactjs.org/">React.js</a></li>
    <li><a href="https://wxt.dev/">WXT Framework</a></li>
  </ul>
</details>

<details>
  <summary>Data Pipeline & ML</summary>
  <ul>
    <li>MutationObserver API</li>
    <li>Chrome Storage API</li>
    <li>Local Classifier / Lightweight ML Model</li>
  </ul>
</details>

<!-- Features -->
### Features

- Real-Time DOM Interception: Monitors infinite scrolling feeds and extracts content using debounced MutationObserver routines.
- Shadow DOM Piercing: Navigates custom Web Component architectures to extract metadata.
- Collision-Safe Tagging: Employs namespaced state tracking and Set caching to prevent infinite loops.
- Anti-Doomscroll Interventions: Blurs or dims high-stress, outrage-heavy content dynamically.

<!-- Getting Started -->
## Getting Started

<!-- Prerequisites -->
### Prerequisites

This project uses npm as a package manager.

```bash
npm install npm@latest -g

```

### Installation

Clone the repository and install dependencies:

```bash
  git clone [https://github.com/your-username/undrift-extension.git](https://github.com/your-username/undrift-extension.git)
  cd undrift-extension
  npm install

```

### Run Locally

Start the development server:

```bash
  npm run dev

```

To load the extension in Chrome:

1. Navigate to `chrome://extensions/`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select the `.output/chrome-mv3` folder inside your project directory.

## Usage

Once installed and enabled, the extension runs automatically in the background when navigating to supported platforms like Reddit. It actively monitors the live feed, scores post titles and content against the local AI model, and applies visual interventions (like blurring) to content that exceeds the ragebait threshold.

## Roadmap

* [x] Phase 1.1: Extension architecture setup with WXT, React, and MV3.
* [x] Phase 1.2: High-efficiency DOM extraction pipeline for infinite feeds.
* [ ] Phase 1.3: Integration of lightweight ML text classification engine.
* [ ] Phase 2.1: Dynamic DOM overlays and real-time content blurring.
* [ ] Phase 2.2: Goal-drift tracking and intention reminders.
* [ ] Phase 3.0: Local analytics dashboard for feed drift metrics.

## Contributing

Contributions are always welcome!

## License

Distributed under the MIT License. See LICENSE.txt for more information.

## Contact

Your Name - [@twitter_handle](https://twitter.com/twitter_handle) - email@email_client.com

Project Link: [https://github.com/your-username/undrift-extension](https://www.google.com/search?q=https://github.com/your-username/undrift-extension)

## Acknowledgements

* [WXT](https://wxt.dev/)
* [React](https://reactjs.org/)
"""

with open("README-v3.md", "w", encoding="utf-8") as file:
file.write(markdown_content)

print("File created successfully.")

```

```text?code_stdout&code_event_index=1
File created successfully.


```

Your README has been regenerated using the exact template structure you requested. All emojis, unformatted paragraphs, and unnecessary slop have been strictly omitted to keep it clean and recruiter-ready.

Here is the finalized code you can copy directly into your project:

```markdown
<div align="center">
  <h1>Undrift</h1>
  <p>
    A high-performance, local-first Chrome extension that intercepts real-time social media feeds, runs lightweight machine learning inference, and dynamically mitigates outrage-driven algorithmic content.
  </p>

<!-- Badges -->
<p>
  <a href="">
    <img src="https://img.shields.io/github/last-commit/your-username/undrift-extension" alt="last update" />
  </a>
  <a href="https://github.com/your-username/undrift-extension/stargazers">
    <img src="https://img.shields.io/github/stars/your-username/undrift-extension" alt="stars" />
  </a>
  <a href="https://github.com/your-username/undrift-extension/issues/">
    <img src="https://img.shields.io/github/issues/your-username/undrift-extension" alt="open issues" />
  </a>
  <a href="https://github.com/your-username/undrift-extension/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/your-username/undrift-extension.svg" alt="license" />
  </a>
</p>
</div>

<br />

<!-- Table of Contents -->
# Table of Contents

- [About the Project](#about-the-project)
  * [Tech Stack](#tech-stack)
  * [Features](#features)
- [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
  * [Run Locally](#run-locally)
- [Usage](#usage)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgements](#acknowledgements)

<!-- About the Project -->
## About the Project

Undrift is an AI Digital Twin designed to mitigate algorithmic ragebait. Rather than using backend automation frameworks hosted on remote servers, this extension executes natively within the user's browser session. This eliminates multi-second delays, protects privacy by riding on existing authenticated sessions locally, and requires zero infrastructure overhead.

### Tech Stack

<details>
  <summary>Client / Extension</summary>
  <ul>
    <li><a href="https://www.typescriptlang.org/">Typescript</a></li>
    <li><a href="https://reactjs.org/">React.js</a></li>
    <li><a href="https://wxt.dev/">WXT Framework</a></li>
  </ul>
</details>

<details>
  <summary>Data Pipeline & ML</summary>
  <ul>
    <li>MutationObserver API</li>
    <li>Chrome Storage API</li>
    <li>Local Classifier / Lightweight ML Model</li>
  </ul>
</details>

<!-- Features -->
### Features

- Real-Time DOM Interception: Monitors infinite scrolling feeds and extracts content using debounced MutationObserver routines.
- Shadow DOM Piercing: Navigates custom Web Component architectures to extract metadata.
- Collision-Safe Tagging: Employs namespaced state tracking and Set caching to prevent infinite loops.
- Anti-Doomscroll Interventions: Blurs or dims high-stress, outrage-heavy content dynamically.

<!-- Getting Started -->
## Getting Started

<!-- Prerequisites -->
### Prerequisites

This project uses npm as a package manager.

```bash
npm install npm@latest -g

```

### Installation

Clone the repository and install dependencies:

```bash
  git clone [https://github.com/your-username/undrift-extension.git](https://github.com/your-username/undrift-extension.git)
  cd undrift-extension
  npm install

```

### Run Locally

Start the development server:

```bash
  npm run dev

```

To load the extension in Chrome:

1. Navigate to `chrome://extensions/`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select the `.output/chrome-mv3` folder inside your project directory.

## Usage

Once installed and enabled, the extension runs automatically in the background when navigating to supported platforms like Reddit. It actively monitors the live feed, scores post titles and content against the local AI model, and applies visual interventions (like blurring) to content that exceeds the ragebait threshold.

## Roadmap

* [x] Phase 1.1: Extension architecture setup with WXT, React, and MV3.
* [x] Phase 1.2: High-efficiency DOM extraction pipeline for infinite feeds.
* [ ] Phase 1.3: Integration of lightweight ML text classification engine.
* [ ] Phase 2.1: Dynamic DOM overlays and real-time content blurring.
* [ ] Phase 2.2: Goal-drift tracking and intention reminders.
* [ ] Phase 3.0: Local analytics dashboard for feed drift metrics.

## Contributing

Contributions are always welcome!

## License

Distributed under the MIT License. See LICENSE.txt for more information.

## Contact

Your Name - [@twitter_handle](https://twitter.com/twitter_handle) - email@email_client.com

Project Link: [https://github.com/your-username/undrift-extension](https://www.google.com/search?q=https://github.com/your-username/undrift-extension)

## Acknowledgements

* [WXT](https://wxt.dev/)
* [React](https://reactjs.org/)

```

```