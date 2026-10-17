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
- **Submit** (`submit.html`) — share a report anonymously or under a display name
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
- **Cache Versioning** — the cache is named `silent-signal-v5`; the `activate`
  event deletes older `silent-signal-*` caches so only the current version remains.
- **Local Assets** — Materialize, Material Icons, and fonts are vendored locally
  so the app shell is fully functional with no network connection.

## Prototype Limitations

There is no backend yet: posting, boosting, and comments are simulated
front-end interactions, and submitted reports are not sent to a server. Drafts
and offline-queued reports are stored only on the user's own device. The midterm
focuses on the PWA features listed above.

## Privacy, Safety & Offline Improvements

Because people share sensitive things on Silent Signal, I put extra focus on
privacy, safety, and making the app behave well on a bad connection:

- **Privacy reminder** - the Submit page shows a notice asking users not to include
  names, addresses, or other identifying details.
- **Clear moderation process** - the Report Post modal and the Guidelines page now
  explain exactly what happens after a post is flagged (anonymous review within 24
  hours, rule-breaking posts removed).
- **Online/offline indicator** - a small status pill on every page shows whether the
  app is currently connected.
- **Local drafts with offline submit** - the report form auto-saves to localStorage as
  you type, restores when you come back, and if you submit while offline the report
  is queued and posted when the connection returns.
- **Anonymous by default** - posts are anonymous unless the user chooses "Show my
  name" and types a display name; the name is never linked to an account or device.

Comments, boosts, and other advanced features will stay simulated until the
core application has a real backend.

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
