# Publish Source URL Link

## Summary

- Ensured `publish.html` generated drafts keep an official Kangnam notice source URL before moderation is saved.
- Replaced imported school notice sample source URLs with official notice-detail URL shapes instead of `/mock/` paths.
- Added a save-time guard so published or declined notices are not stored when the original source URL is not an official Kangnam notice URL.
- Added preview coverage that opens the published detail page and verifies the full notice source link points to the saved original source URL.

## Validation

- `npm run lint` in `01_WEB_FIREBASE`
- `npm run test:preview` in `02_TAURI_DEVELOPMENT_SOURCE`
