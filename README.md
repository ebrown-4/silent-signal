# Silent Signal

Silent Signal is a Progressive Web App for INF 654. It is a safe, anonymous space
where people can share what's happening in their world or their community —
workplace issues, public safety concerns, or community problems — without a name
or an account.

The app is designed for anyone who wants to report or read local community
concerns privately: residents, workers, and students who need a judgment-free
place to speak up.

## Pages

- **Feed** (`index.html`) — recent anonymous posts with category filters and boosts
- **Submit** (`submit.html`) — share a report anonymously
- **Post Details** (`post.html`) — read a full post with anonymous comments
- **Guidelines** (`about.html`) — community rules and how the app works

Built with HTML, Materialize CSS, and JavaScript. Fully responsive with a mobile
sidenav navigation.

## PWA Features

This midterm update turns the earlier prototype into a functional Progressive Web App:

- **Web App Manifest** (`manifest.json`) — app name, short name, ID, start URL,
  scope, standalone display mode, theme color, background color, and app icons
  (including maskable icons), linked from every page.
- **Service Worker** (`sw.js`) — registered from `js/app.js` with browser support
  detection, `async/await`, `try...catch` error handling, and console logging.
- **Application Shell Cache** — the HTML pages, CSS, JavaScript, icons, and
  fonts needed to load the main interface are cached in Cache Storage during the
  `install` event (with `event.waitUntil()` so installation waits for caching).
- **Fetch Handling** — for GET requests, Cache Storage is checked first and the
  network is used as a fallback. Same-origin files visited online are cached at
  runtime for the next offline visit.
- **Offline Support** (`offline.html`) — if a page navigation fails while offline,
  a friendly "You're offline" page is served instead of a browser error.
- **Cache Versioning** — the cache is named `silent-signal-v3`; the `activate`
  event deletes older `silent-signal-*` caches so only the current version remains.
- **Local Assets** — Materialize, Material Icons, and fonts are vendored locally
  so the app shell is fully functional with no network connection.

## Prototype Limitations

Posting, boosting, comments, and draft saving are simulated front-end
interactions from the original proposal — no data is sent or stored yet, and
they are not available offline. The midterm focuses on the PWA features listed
above.

## Running the App

Service workers require a secure context, so run the app from a local server
(not by double-clicking the HTML file):

```
python3 -m http.server 8080
```

Then open http://localhost:8080 in your browser. To test offline mode, open
Chrome DevTools, go to the Application tab, and check "Offline" (or use the
Network tab's offline throttle). Reload the page — the app should still load,
and uncached page requests should show the offline page.

## AI Use

I used Perplexity AI to help develop and debug the code and to assist in areas of
uncertainty. The app idea, design choices, and site content are my own.
