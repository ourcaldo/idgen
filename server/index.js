import express from 'express';
import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { generateCardData } from './random-data.js';
import { renderCard } from './card-renderer.js';
import { saveCard, getCard, STORAGE } from './storage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, '..', 'dist');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const app = express();
app.set('trust proxy', true);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = isProduction ? 5000 : (process.env.API_PORT || 3001);

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/card/generate', async (req, res) => {
  try {
    const type = req.query.type === 'teacher' ? 'teacher' : 'student';
    const institution = req.query.institution || 'smkn1ngawi';

    const cardData = await generateCardData(type, institution);
    const imageBuffer = await renderCard(cardData);

    const id = uuidv4();
    const nisn = cardData.nisn || id;

    await saveCard(id, nisn, imageBuffer);

    const imageBase64 = imageBuffer.toString('base64');

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const downloadUrl = `${baseUrl}/api/card/download/${id}`;

    res.json({
      id,
      type: cardData.type,
      institution: cardData.institution,
      schoolName: cardData.schoolName,
      schoolAddress: cardData.schoolAddress,
      schoolCity: cardData.schoolCity,
      schoolLatitude: cardData.schoolLatitude,
      schoolLongitude: cardData.schoolLongitude,
      cardTitle: cardData.cardTitle,
      name: cardData.name,
      nisn: cardData.nisn,
      kelas: cardData.kelas || null,
      jurusan: cardData.jurusan || null,
      jabatan: cardData.jabatan || null,
      teacherId: cardData.teacherId || null,
      issuedStatus: cardData.issuedStatus || null,
      ttl: cardData.ttl,
      tahun: cardData.tahun,
      status: cardData.status,
      validUntil: cardData.validUntil,
      photoUrl: cardData.photoUrl || null,
      downloadUrl,
      imageBase64,
    });
  } catch (error) {
    console.error('Error generating card:', error);
    res.status(500).json({ error: 'Failed to generate card', details: error.message });
  }
});

const NAMEFAKE_NAME_RE = /<a id="bc-name"[^>]*title="([^"]+)"/;
const NAMEFAKE_USERNAME_RE = /<div class="nk_line_k">Username<\/div><div class="nk_line_v[^"]*"[^>]*>([^<]*)<\/div>/;

app.get('/api/namefake/{*rest}', async (req, res) => {
  try {
    // api.namefake.com JSON API is dead (404 upstream); scrape the HTML site instead
    const response = await fetch('https://namefake.com/en_US', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });
    if (!response.ok) {
      return res.status(502).json({ error: 'namefake upstream error', status: response.status });
    }
    const html = await response.text();
    const name = html.match(NAMEFAKE_NAME_RE)?.[1] || '';
    const username = html.match(NAMEFAKE_USERNAME_RE)?.[1] || '';
    if (!name) {
      return res.status(502).json({ error: 'namefake parse error' });
    }
    res.json({ name, username });
  } catch (error) {
    res.status(500).json({ error: 'Proxy error', details: error.message });
  }
});

app.get('/api/unsplash/{*rest}', async (req, res) => {
  try {
    const restParam = req.params.rest;
    const targetPath = Array.isArray(restParam) ? restParam.join('/') : (restParam || '');
    const targetUrl = `https://api.unsplash.com/${targetPath.replace(/^\//, '')}`;
    const headers = {
      'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY || ''}`,
    };
    if (req.headers['accept-language']) {
      headers['Accept-Language'] = req.headers['accept-language'];
    }
    const response = await fetch(`${targetUrl}?${new URLSearchParams(req.query).toString()}`, { headers });
    if (!response.ok) {
      return res.status(response.status).send(await response.text());
    }
    const contentType = response.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);
    const body = await response.text();
    res.send(body);
  } catch (error) {
    res.status(500).json({ error: 'Proxy error', details: error.message });
  }
});

app.get('/api/card/download/:id', async (req, res) => {
  const { id } = req.params;
  if (!UUID_REGEX.test(id)) {
    return res.status(400).json({ error: 'Invalid card ID' });
  }

  const card = await getCard(id);
  if (!card) {
    return res.status(404).json({ error: 'Card not found' });
  }

  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Content-Disposition', `attachment; filename="${card.fileName}"`);
  res.send(card.buffer);
});

if (existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(DIST_DIR, 'index.html'));
    } else {
      next();
    }
  });
}

if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API Server running on port ${PORT}`);
    console.log(`Storage mode: ${STORAGE}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Generate card: http://localhost:${PORT}/api/card/generate?type=student`);
  });
}

export default app;
