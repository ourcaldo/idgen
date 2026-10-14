# Change Log

## 2026-10-14
- Short description: Fix "Failed to get random name" — old api.namefake.com JSON API is dead (404 upstream).
- What you do:
  - Rewrote `/api/namefake` server handler: scrape `https://namefake.com/en_US` HTML, extract name (breadcrumb title) + username (nk_line value), return as JSON.
  - Vite dev proxy for `/api/namefake` now routes to local express server instead of the dead API host.
  - Verified locally: 5/5 requests 200, all names pass frontend `isNormalStudentName` filter.
- File path that changes:
  - server/index.js
  - vite.config.js
  - docs/log/log-changes.md

## 2026-10-14
- Short description: Switch random photo source from Freepik API to Unsplash API.
- What you do:
  - Replaced `/api/freepik` server proxy with `/api/unsplash` (Authorization: Client-ID from `UNSPLASH_ACCESS_KEY` env var, per https://unsplash.com/documentation#search-photos).
  - Rewrote `fetchRandomPhoto()` in `server/random-data.js` to call `GET /search/photos` with `query`, `page`, `per_page`, `orientation`, `content_filter`; use `results[].urls.small`.
  - Rewrote frontend `fetchFreepikPhoto()` as `fetchUnsplashPhoto()` in `src/main.js` to call the proxy without any API key.
  - Replaced `/api/freepik` Vite dev proxy with `/api/unsplash` -> `https://api.unsplash.com`.
  - Deleted `test_freepik.js`, added `test_unsplash.js`; updated `.env.example` and local `.env`.
  - Verified: build passes, `/api/health` 200, `/api/unsplash/search/photos` proxy 200 with 2 results, `/api/card/generate` returns Unsplash photoUrl.
- File path that changes:
  - server/index.js
  - server/random-data.js
  - src/main.js
  - vite.config.js
  - test_unsplash.js (new), test_freepik.js (deleted)
  - .env.example, .env (local only)
  - docs/log/log-changes.md

## 2026-10-14
- Short description: Remove hardcoded Freepik API key from source before public GitHub deployment.
- What you do:
  - Moved Freepik API key from hardcoded string to `FREEPIK_API_KEY` env variable in `server/random-data.js` and `test_freepik.js`.
  - Removed API key from frontend `src/main.js`; `/api/freepik` server proxy now injects env key server-side.
  - Added `FREEPIK_API_KEY` to `.env.example`; created local `.env`.
  - Verified build passes.
- File path that changes:
  - server/random-data.js
  - server/index.js
  - src/main.js
  - test_freepik.js
  - .env.example
  - docs/log/log-changes.md

## 2026-04-01
- Short description: Align teacher/student card fields and refine student birth label text.
- What you do:
  - Increased info label width to keep `:` alignment consistent across NIS, Position, Faculty ID, Employment Doc, and Status rows.
  - Updated student birth label from compact all-caps style to `Tempat, Tanggal Lahir`.
  - Removed underline/capped visual style from the birth label row by using standard label styling.
  - Rebuilt production bundle to verify layout update.
- File path that changes:
  - index.html
  - style.css
  - docs/log/log-changes.md

## 2026-04-01
- Short description: Convert remaining teacher card row labels from Indonesian to English.
- What you do:
  - Added switchable label IDs for card rows (Kelas/Jurusan/Jabatan/ID Pendidik/SK-Kontrak).
  - Updated teacher mode logic so those labels render in English (`CLASS`, `MAJOR`, `POSITION`, `FACULTY ID`, `EMPLOYMENT DOC`).
  - Kept student mode labels in Indonesian.
  - Rebuilt production bundle to verify the update.
- File path that changes:
  - index.html
  - src/main.js
  - docs/log/log-changes.md

## 2026-04-01
- Short description: Add extra gap between teacher STATUS row and time blocks.
- What you do:
  - Added dedicated bottom margin to teacher status details row.
  - Kept previous field/block spacing while improving STATUS-to-ISSUED separation.
  - Rebuilt production bundle to verify CSS change.
- File path that changes:
  - style.css
  - docs/log/log-changes.md

## 2026-04-01
- Short description: Add more spacing between info field rows and lower card blocks.
- What you do:
  - Increased vertical gap below the final info field row.
  - Added extra top spacing before the badge block area.
  - Rebuilt production bundle to verify style-only change is safe.
- File path that changes:
  - style.css
  - docs/log/log-changes.md

## 2026-03-31
- Short description: Fix teacher status row alignment and remove underline style.
- What you do:
  - Changed teacher `STATUS` row label class to use standard info-label styling.
  - Removed ttl-style underline/min-width behavior that caused visual misalignment.
  - Verified layout consistency by rebuilding production bundle.
- File path that changes:
  - index.html
  - docs/log/log-changes.md

## 2026-03-31
- Short description: Refine teacher card output with English labels, random issued date, and current verification date.
- What you do:
  - Changed teacher-card language to English for labels/titles in card mode switching.
  - Replaced teacher birth-info row with `Status: ACTIVE` and hid the teacher active badge block.
  - Added `Last Verified` block with current date while keeping `Issued` as a random historical date.
  - Ensured teacher random data always generates non-empty Faculty ID and SK/Contract values.
  - Updated reset/apply flows so teacher mode no longer shows `-` for generated verification IDs.
- File path that changes:
  - index.html
  - src/main.js
  - docs/log/log-changes.md

## 2026-03-31
- Short description: Add teacher verification proof fields and auto-issued current date.
- What you do:
  - Added teacher-only fields: Nomor ID Pendidik and Nomor SK/Kontrak in sidebar and card preview.
  - Added teacher verification note block on card output for easier document review.
  - Set teacher mode Issued value to current date and updated random generation defaults for proof fields.
  - Updated reset flow to clear and reinitialize teacher verification fields correctly.
- File path that changes:
  - index.html
  - src/main.js
  - style.css
  - docs/log/log-changes.md

## 2026-03-31
- Short description: Add Student/Teacher card mode and sync instruction files.
- What you do:
  - Added card type selector to switch between Pelajar and Pendidik output.
  - Updated card preview labels and conditional fields (NIS/NISN, Kelas/Jurusan/Jabatan, Tahun Masuk/Issued).
  - Updated random data generation and reset behavior to respect selected card type.
  - Added workspace instruction file and copied it to Claude config.
- File path that changes:
  - index.html
  - src/main.js
  - style.css
  - .github/copilot-instructions.md
  - .claude/CLAUDE.md
