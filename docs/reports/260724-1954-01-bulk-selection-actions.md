# Bulk Selection Actions

## Summary

- Added checkbox-based multi-selection to `manage.html` and `publish.html`.
- `manage.html` supports selecting visible managed notices and deleting them in one confirmed bulk action.
- `publish.html` supports checkbox selection for imported school notices while keeping Codex draft generation limited to one notice at a time.
- `publish.html` also supports bulk status changes for the reviewed notice list: selected notices can be published or declined together.

## Validation

- `npm run lint` in `01_WEB_FIREBASE`
- `npm test` in `01_WEB_FIREBASE`
- `npm run test:preview` in `02_TAURI_DEVELOPMENT_SOURCE`

## Notes

- No new UI library was added.
- New checkbox controls use native labeled inputs for keyboard and screen-reader access.
- Existing single-notice edit and Codex draft generation flows remain unchanged.
