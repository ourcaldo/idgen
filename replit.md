# ID Card Generator - Multi-Institusi

## Project Overview

A web-based ID Card Generator supporting multiple Indonesian schools and universities. Users can create, preview, and export digital ID cards for students (Pelajar) and lecturers (Dosen). Includes a REST API for programmatic card generation with server-side canvas rendering.

## Features

- **Multi-institution support**: SMKN 1 Ngawi, Universitas Bina Sarana Informatika (Jakarta Selatan), Institut Agama Islam Negeri Kediri
- Card types: Pelajar (student) and Dosen (lecturer)
- Live card preview as user fills in the form
- Random data generation via external APIs (Namefake + Freepik)
- CODE128 barcode below the photo (matching photo width)
- Export card as PNG image using html2canvas
- **REST API** with server-side canvas rendering producing downloadable JPEG images
- **Storage**: Local disk or BunnyCDN (configurable via STORAGE env var)

## REST API

### Endpoints

- `GET /api/card/generate?type=student&institution=smkn1ngawi` — Generate random card with image
- `GET /api/card/download/:id` — Download a generated card image
- `GET /api/health` — Health check

### Parameters
- `type`: `student` (default) or `teacher`
- `institution`: `smkn1ngawi` (default), `ubsi`, or `iainkediri`

### Response
JSON with all card fields (name, nisn, kelas, jurusan, etc.), `imageBase64` (base64 JPEG), and `downloadUrl`.

### Download filename format
`ID_Card_{nisn}.jpg` — matches frontend export naming.

## Card Behavior by Type

### Pelajar (Student)
- Shows: NISN, Kelas, Jurusan (abbreviated: TKJ, RPL, AKL, DKV), TTL, Tahun Masuk / Status
- Barcode below photo

### Dosen (Lecturer)
- Shows: NIS, Jabatan, ID Dosen, TTL, Diterbitkan / Status
- Card title: KARTU TANDA DOSEN
- Barcode below photo

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES Modules)
- **Backend**: Express.js (API server on port 3001 dev, port 5000 production)
- **Build Tool**: Vite v5
- **Canvas Rendering**: @napi-rs/canvas (server-side card image generation)
- **Libraries**: html2canvas, bwip-js, jsbarcode, uuid
- **Styling**: Plain CSS with Inter font (Google Fonts frontend, Inter-Variable.ttf server)
- **Storage**: Local disk or BunnyCDN HTTP Storage API

## Project Structure

```
├── index.html          # Main entry point and card UI structure
├── style.css           # Global styles
├── vite.config.js      # Vite config with proxy
├── vercel.json         # Vercel deployment config
├── package.json        # Dependencies and scripts
├── .env.example        # Environment variable reference
├── public/             # Static assets (logos)
├── src/
│   └── main.js         # Frontend app logic
├── server/
│   ├── index.js        # Express API server (exports app for Vercel)
│   ├── card-renderer.js # Server-side canvas card renderer
│   ├── random-data.js  # Random card data generator
│   ├── storage.js      # Storage abstraction (local/bunny)
│   └── fonts/          # Inter-Variable.ttf, DancingScript-Variable.ttf
├── api/
│   └── index.js        # Vercel serverless function entry point
└── generated-cards/    # Local card storage (when STORAGE=local)
```

## Environment Variables

```
STORAGE=local           # "local" or "bunny"
BUNNY_USERNAME=gh-auto  # BunnyCDN storage zone name
BUNNY_HOSTNAME=sg.storage.bunnycdn.com
BUNNY_PORT=21
BUNNY_PASSWORD=...      # BunnyCDN storage password (secret)
```

## Development

```bash
npm install
npm run dev       # Starts Vite dev server on port 5000
npm run server    # Starts API server on port 3001
```

## Deployment

### Replit
- Build: `npm run build`
- Run: `NODE_ENV=production node server/index.js`
- Express serves both the built frontend (dist/) and the API on port 5000

### Vercel
- `vercel.json` configured with rewrites for API → serverless function
- Frontend built by Vite, served as static files from `dist/`
- API runs as serverless function via `api/index.js`
- Set `STORAGE=bunny` in Vercel env vars (no persistent disk)
- Set `BUNNY_PASSWORD`, `BUNNY_USERNAME`, `BUNNY_HOSTNAME` in Vercel env vars
- `maxDuration: 30` for card generation (Pro plan recommended)
- Server files and fonts bundled via `includeFiles`

## API Proxies

Express handles proxy routes for external APIs in all environments (dev, production, Vercel):
- `/api/namefake/{*rest}` → `https://api.namefake.com/...`
- `/api/freepik/{*rest}` → `https://api.freepik.com/...`

Vite also proxies in development for hot-reload convenience:
- `/api/card/*` → `http://localhost:3001`
- `/api/health` → `http://localhost:3001`
