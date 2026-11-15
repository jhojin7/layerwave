# Use the saved mixer offline

The installed service worker can reopen the app shell and saved mix offline. YouTube media still requires internet.

## Sub-features

- `offline-reload`: the controlled page reloads without a network.
- `offline-saved`: saved layers and settings remain available with a connection message.
- `offline-cache`: cached requests belong to the app origin rather than YouTube media.
- `pwa-install`: a supported browser offers installation with Layerwave's name and icons.
- `pwa-update`: an existing installation offers `Update app` when a newer worker is waiting.

## How to get to it (user POV)

- Open Layerwave online once, then reopen or reload offline.
- Use the browser's install command on a supported browser.
- Leave an older app version open while a newer build becomes available, then choose `Update app`.

## Driving it with Playwright

Preconditions: doctor passes against the production preview. The development server does not install this production service worker.

- Run `npm run verify:ui -- --grep 'offline shell:'`.
- Add `abcdefghijk` and `lmnopqrstuv` through the form. Wait for `navigator.serviceWorker.ready`, reload, and require a controller. Set the isolated browser context offline and reload again.
- Require the mixer heading, two layers, and `You’re offline. Connect to play YouTube videos.`. Read the saved mix and compare it to the online state.
- Read Cache Storage requests, require a nonempty cache, and require every cached request's origin to match the preview. No media requests are mocked or downloaded for this proof.
- For installation, use a physical device or supported desktop browser; inspect the installed name, icon, and standalone opening. Record OS and browser. For updates, use two builds in an isolated profile and observe the old page show `Update app`, then load the new build. These two paths are manual and excluded from the smoke suite.

## Gotchas

- Offline UI and same-origin cache inspection do not prove online playback or physical PWA installation.
- A fresh offline visit cannot install the app shell. The first online visit and service-worker control are required.
- Cleanup restores network access and closes only the owned context. Evidence survives.
