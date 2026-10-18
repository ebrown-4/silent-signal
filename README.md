# Silent Signal

Silent Signal is my INF 654 Progressive Web App for sharing experiences of
injustice, harmful behavior, discrimination, and other troubling events in local
or state communities. The goal is to help people bring attention to concerns
without having to reveal their identities.

The intended users include community members, people who have experienced harm
or fear retaliation, whistleblowers, activists, and advocates. This course
prototype is not ready for sensitive reports or public use.

## Pages

- **Home Feed** (`index.html`): sample community posts with category filtering.
- **Submit Report** (`submit.html`): anonymous by default, with an optional display
  name, local text drafts, and offline saved reports.
- **Post Details** (`post.html`): a sample story, comment preview, and flag form.
- **About/Guidelines** (`about.html`): purpose, community rules, privacy limitations,
  and the planned review process.
- **Offline** (`offline.html`): a fallback when a page is unavailable.

The original responsive design, Materialize CSS, navigation, and branding are
still used. Categories are part of the Feed rather than a separate page.

## PWA Features

- **Manifest** (`manifest.json`): application name, short name, ID, start URL, scope,
  standalone display mode, colors, and normal and maskable icons.
- **Registration** (`js/app.js`): service worker support check, async/await,
  try/catch, and useful console messages.
- **Application shell** (`sw.js`): local HTML, styles, scripts, fonts, manifest,
  and icons cached during install with `event.waitUntil()`.
- **GET requests**: cache first, then network. Failed page requests receive the
  cached offline page.
- **Cache versions**: `silent-signal-v8`; activation removes older
  `silent-signal-*` versions without deleting unrelated applications' caches.
- **Offline writing**: text drafts can be restored after reload, and offline
  reports can be saved, opened, or deleted in the same browser.
- **Connection indicator**: the browser's reported online/offline state is visible
  on each page. It does not guarantee the reporting server is reachable.

## Original Proposal and Current Progress

I am keeping the anonymous community-reporting purpose from my proposal. The
midterm focuses on the PWA foundation, not completing every proposed feature.

| Proposed feature or screen | Current progress |
| --- | --- |
| Anonymous story submission | Anonymous is the default. Submission is a preview; no server receives reports yet. |
| Community feed | Sample stories, not real user reports. |
| Categories/tags | Political, Workplace, Public Safety, Corruption, Discrimination, Abuse, Community Concerns, and Other. Feed filters the sample stories. |
| City, county, or state filtering | City and state form fields are present; location filtering and county support are still planned. |
| Signal Boost | A demo counter for the current page visit, not a saved vote. |
| Anonymous comments | Comment preview and basic word screening; no comments are published. |
| Report/flag system | A form demonstrates flag reasons. Moderator delivery, review, and removal still need a backend. |
| Optional encrypted local drafts | Local text drafts work, but are not encrypted. Encryption remains planned. |
| Settings | User preferences, dark mode, and optional anonymity tools remain planned. |
| Installability and app shell | Manifest, icons, service worker, and versioned shell caching are implemented. |
| Write offline and submit later | Reports stay saved locally after reconnect. Real submission and delivery confirmation remain planned. |

## Privacy and Safety

No account is required in the prototype. The optional display-name choice was
added after the proposal; it does not replace anonymous posting and does not
verify anyone's identity. Only use a name if you intend to make it visible.

Drafts, including a display name if entered, are stored in this browser using
localStorage without encryption. They are not protected from other people using
the same browser profile. Use Delete Draft or the saved report's Delete button
to remove local text. Images are not saved in drafts or uploaded.

A privacy reminder asks users not to expose other people's identifying details.
A basic, client-side word filter blocks listed slurs and warns about some
name-calling in reports and comments. It does not understand context, can miss
abuse, and is not a replacement for server-side checks and human review.

The flag form describes a planned review workflow, not a staffed moderation
service. No review time or guarantee of anonymity is promised. Stronger privacy
protections, encrypted drafts, server-side enforcement, and a real moderation
process are needed before a public launch.

## Prototype Limitations

There is no backend. Posts, comments, flags, and votes are not sent to a server.
Offline reports stay saved on the device after the connection returns; they are
not automatically published or deleted. Opening a saved report lets you review
its text while the live submission system is still being built.

The next steps are to connect and test the core reporting service, then add
location browsing and Settings. Advanced interactions and privacy tools will
follow without changing the original purpose.

## Running and Testing

Service workers need HTTPS or localhost, not a double-clicked HTML file.
From this repository's folder run:

```sh
python3 -m http.server 8080
```

On Windows, `python -m http.server 8080` may be the command. Open
http://localhost:8080 and let the service worker install, then reload.

- Check DevTools > Application for the manifest, service worker, and shell cache.
- Try each category, including one with no sample stories.
- Save a draft and reload; test anonymous and optional-name choices.
- Switch DevTools Network to Offline; open cached pages and an uncached page.
- Save a report offline, reconnect, and confirm it stays in Saved offline reports.
- Open or delete a saved report and check the browser console for errors.

## AI Use

I used Perplexity AI to help develop and debug the code and to assist in areas of
uncertainty. The app idea, design choices, and site content are my own.
