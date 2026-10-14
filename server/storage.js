import path from 'path';
import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CARDS_DIR = path.join(__dirname, '..', 'generated-cards');

const STORAGE = process.env.STORAGE || 'local';
const BUNNY_USERNAME = process.env.BUNNY_USERNAME || '';
const BUNNY_HOSTNAME = process.env.BUNNY_HOSTNAME || '';
const BUNNY_PASSWORD = process.env.BUNNY_PASSWORD || '';

if (STORAGE === 'local' && !existsSync(CARDS_DIR)) {
  mkdirSync(CARDS_DIR, { recursive: true });
}

function bunnyBaseUrl() {
  return `https://${BUNNY_HOSTNAME}/${BUNNY_USERNAME}`;
}

async function saveCard(id, nisn, imageBuffer) {
  const fileName = `ID_Card_${nisn}.jpg`;

  if (STORAGE === 'bunny') {
    const url = `${bunnyBaseUrl()}/cards/${fileName}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'AccessKey': BUNNY_PASSWORD,
        'Content-Type': 'application/octet-stream',
      },
      body: imageBuffer,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`BunnyCDN upload failed: ${res.status} ${text}`);
    }

    const metaUrl = `${bunnyBaseUrl()}/cards/${id}.meta`;
    await fetch(metaUrl, {
      method: 'PUT',
      headers: {
        'AccessKey': BUNNY_PASSWORD,
        'Content-Type': 'text/plain',
      },
      body: `${nisn}\n${fileName}`,
    });

    return { storage: 'bunny', fileName };
  }

  const filePath = path.join(CARDS_DIR, `${id}.jpg`);
  await fs.writeFile(filePath, imageBuffer);
  const metaPath = path.join(CARDS_DIR, `${id}.meta`);
  await fs.writeFile(metaPath, nisn);
  return { storage: 'local', fileName };
}

async function getCard(id) {
  if (STORAGE === 'bunny') {
    const metaUrl = `${bunnyBaseUrl()}/cards/${id}.meta`;
    const metaRes = await fetch(metaUrl, {
      headers: { 'AccessKey': BUNNY_PASSWORD },
    });
    if (!metaRes.ok) return null;

    const metaText = await metaRes.text();
    const [nisn, fileName] = metaText.trim().split('\n');

    const fileUrl = `${bunnyBaseUrl()}/cards/${fileName}`;
    const fileRes = await fetch(fileUrl, {
      headers: { 'AccessKey': BUNNY_PASSWORD },
    });
    if (!fileRes.ok) return null;

    const buffer = Buffer.from(await fileRes.arrayBuffer());
    return { nisn, fileName, buffer };
  }

  const filePath = path.join(CARDS_DIR, `${id}.jpg`);
  try {
    await fs.access(filePath);
  } catch {
    return null;
  }

  const buffer = await fs.readFile(filePath);
  let nisn = id;
  try {
    const metaPath = path.join(CARDS_DIR, `${id}.meta`);
    nisn = await fs.readFile(metaPath, 'utf8');
  } catch {}

  return { nisn, fileName: `ID_Card_${nisn}.jpg`, buffer };
}

export { saveCard, getCard, STORAGE };
