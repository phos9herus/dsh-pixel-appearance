# Contributing

Thanks for considering a contribution.

## Requirements

- Node.js 20 or newer.
- A DSH installation for manual visual testing.

## Development layout

`client.js` is generated; do not edit it directly. Edit the source fragments in
`src/` and rebuild:

```powershell
node src/build.mjs
node --check client.js
node --check index.js
```

`src/INTERFACE.md` documents the fragment contract, the shared factory scope,
the Host-backed Config fields, and the pixel engine API.

## Pull requests

1. Keep the change focused and explain the visual or functional result.
2. Run the build and syntax checks above.
3. Include `client.js` in the same commit as the source change that generated
   it.
4. If you add a Host Config field, update `index.js`, `src/00-head.js`,
   `src/20-store.js`, `src/30-settings.js`, and `src/INTERFACE.md`.
5. If you change a theme, test Native, Pixel, Response, Retrospective, and
   Static with the default palette and at least one light and one dark palette.

## Compatibility

The client half reads a small number of stable DSH DOM attributes
(`[data-composer-card]`, `[data-chat-flow]`, `[data-chat-anchor-key]`,
`[data-chat-flow-kind]`). The Retrospective theme also reads
`[data-conversation-content]` rows and uses the session list plus a read-only
`sessions.retain(...)` tail read. If a DSH update changes these selectors or
APIs, update `src/45-response.js` / `src/47-review.js` and note the supported DSH
version in the pull request.

## Reporting issues

Please include:

- DSH version and OS.
- The theme, palette, and material settings in use.
- Browser console errors, if any.
- Whether the page was refreshed or DSH was fully restarted after the change.
