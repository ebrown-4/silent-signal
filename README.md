# Silent Signal

Silent Signal is my PWA project for INF 654. It is for people who want to share
concerns about injustice, discrimination, safety, or other problems in their
community without having to give their name. There is also an option to use a
display name.

## Pages

- Feed with sample posts and category filters
- Submit Report
- Post Details with comments and a report button
- About and Guidelines
- Offline page

The site uses HTML, Materialize CSS, and JavaScript. I kept the design from my
original prototype and added the PWA features for the midterm.

## PWA Features

- A manifest with the app name, icons, colors, and other app settings.
- A service worker that saves the main pages and files in a cache.
- Cached files load first, with the network used when a file is not saved.
- An offline page appears when a page cannot load.
- A versioned cache that removes older versions when the worker activates.
- Async/await and error handling for registration and caching.
- An online/offline indicator and text drafts saved in the browser.

## Still in Progress

Posts, comments, boosts, and reports are demos and are not sent to a server yet.
Offline reports stay saved in the browser until you delete them. Drafts are not
encrypted, so use test information rather than sensitive details.

There are privacy reminders and a basic word filter, but real moderation,
encrypted drafts, location filtering, and Settings are still planned.

## How to Run

Open the project folder in VS Code. Right-click `index.html` and choose
**Open with Live Server** after installing the Live Server extension.

Let the page load online, then refresh once. In browser DevTools, check
Application for the service worker and cache. Set Network to Offline and reload
to test the cached pages. Try an uncached page address to see the offline page,
and check the Console for errors.

## AI Use

I used Perplexity AI to help develop and debug the code and to assist in areas of
uncertainty. The app idea, design choices, and site content are my own.
