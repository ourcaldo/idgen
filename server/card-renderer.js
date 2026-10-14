import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import path from 'path';
import { fileURLToPath } from 'url';
import bwipjs from 'bwip-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

GlobalFonts.registerFromPath(path.join(__dirname, 'fonts', 'Inter-Variable.ttf'), 'Inter');
GlobalFonts.registerFromPath(path.join(__dirname, 'fonts', 'DancingScript-Variable.ttf'), 'Dancing Script');

const CARD_W = 1400;
const S = 2;
const px = (v) => Math.round(v * S);

const C = {
  headerGradStart: '#2a5298',
  headerGradEnd: '#3e6ebd',
  cream: '#fdfcf5',
  dotColor: 'rgba(59,109,168,0.15)',
  cardBorder: '#3b6da8',
  blueBorder: '#2c4e7a',
  blueDark: '#1a3a6b',
  gold: '#c9a84c',
  goldDark: '#9e7e2e',
  greenBadge: '#2d6a3f',
  textDark: '#1a1a1a',
  textMuted: '#555',
  white: '#ffffff',
  photoBg: '#dddddd',
  subtitleYellow: '#fbbf24',
  addressWhite: 'rgba(255,255,255,0.85)',
  badgeBorder: '#999999',
  badgeBg: 'rgba(200,200,200,0.15)',
};

function drawDotPattern(ctx, x, y, w, h) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const dotSize = px(1.5);
  const spacing = px(12);
  ctx.fillStyle = C.dotColor;
  for (let dy = y; dy < y + h; dy += spacing) {
    for (let dx = x; dx < x + w; dx += spacing) {
      ctx.beginPath();
      ctx.arc(dx, dy, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0] || '';
  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + ' ' + words[i];
    if (ctx.measureText(testLine).width <= maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }
  lines.push(currentLine);
  return lines;
}

export async function renderCard(data) {
  const isTeacher = data.type === 'teacher';

  const padX = px(20);
  const hdrH = px(104);
  const bodyPadTop = px(14);
  const bodyPadBot = px(8);
  const footerH = px(4);
  const validityH = px(26);

  const phW = px(185);
  const phH_student = px(195);
  const bcGap = px(6);
  const bcH = px(40);
  const gap = px(18);

  const photoSectionH = phH_student + bcGap + bcH;
  const infoH_student = photoSectionH;
  const bodyH_student = bodyPadTop + infoH_student + bodyPadBot;

  const lineH = px(24);
  const gridGap = px(6);

  const bodyH = bodyH_student;
  const phH = phH_student;

  const cardH = hdrH + bodyH + footerH + validityH;
  const canvas = createCanvas(CARD_W, cardH);
  const ctx = canvas.getContext('2d');

  const radius = px(12);
  const borderW = px(3);

  ctx.save();
  drawRoundedRect(ctx, 0, 0, CARD_W, cardH, radius);
  ctx.clip();

  ctx.fillStyle = C.cream;
  ctx.fillRect(0, 0, CARD_W, cardH);
  drawDotPattern(ctx, 0, hdrH, CARD_W, cardH - hdrH);

  const hdrGrad = ctx.createLinearGradient(0, 0, CARD_W, hdrH);
  hdrGrad.addColorStop(0, C.headerGradStart);
  hdrGrad.addColorStop(0.5, C.headerGradEnd);
  hdrGrad.addColorStop(1, C.headerGradStart);
  ctx.fillStyle = hdrGrad;
  ctx.fillRect(0, 0, CARD_W, hdrH);

  try {
    const logoPath = path.join(PUBLIC_DIR, data.schoolLogo || 'school-logo.png');
    const logoImg = await loadImage(logoPath);
    const logoW = px(64);
    const logoH = px(72);
    const logoX = px(22);
    const logoY = px(16);
    ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
  } catch (e) {
    console.warn('Logo load error:', e.message);
  }

  const textX = px(22 + 64 + 16);

  ctx.font = `900 ${px(28)}px Inter`;
  ctx.fillStyle = C.white;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const schoolNameLines = wrapText(ctx, data.schoolName || 'SMKN 1 NGAWI', CARD_W - textX - padX);
  let nameY = px(18);
  for (const line of schoolNameLines) {
    ctx.fillText(line, textX, nameY);
    nameY += px(32);
  }

  ctx.font = `700 ${px(14)}px Inter`;
  ctx.fillStyle = C.subtitleYellow;
  ctx.letterSpacing = `${px(1.7)}px`;
  ctx.fillText(data.cardTitle || 'KARTU TANDA PELAJAR', textX, nameY + px(2));
  ctx.letterSpacing = '0px';

  ctx.font = `400 ${px(12.5)}px Inter`;
  ctx.fillStyle = C.addressWhite;
  ctx.fillText(data.schoolAddress || '', textX, nameY + px(22));

  const bodyTop = hdrH + bodyPadTop;
  const phX = padX;
  const phY = bodyTop;

  ctx.strokeStyle = C.blueBorder;
  ctx.lineWidth = px(3);
  ctx.strokeRect(phX, phY, phW, phH);
  ctx.fillStyle = C.photoBg;
  ctx.fillRect(phX + px(1.5), phY + px(1.5), phW - px(3), phH - px(3));

  if (data.photoUrl) {
    try {
      const photoRes = await fetch(data.photoUrl);
      if (photoRes.ok) {
        const photoBuf = Buffer.from(await photoRes.arrayBuffer());
        const photoImg = await loadImage(photoBuf);
        const innerX = phX + px(1.5);
        const innerY = phY + px(1.5);
        const innerW = phW - px(3);
        const innerH = phH - px(3);
        const scale = Math.max(innerW / photoImg.width, innerH / photoImg.height);
        const drawW = photoImg.width * scale;
        const drawH = photoImg.height * scale;
        const drawX = innerX + (innerW - drawW) / 2;
        const drawY = innerY;
        ctx.save();
        ctx.beginPath();
        ctx.rect(innerX, innerY, innerW, innerH);
        ctx.clip();
        ctx.drawImage(photoImg, drawX, drawY, drawW, drawH);
        ctx.restore();
      }
    } catch (e) {
      console.warn('Photo load error:', e.message);
    }
  }

  if (!data.photoUrl) {
    ctx.font = `400 ${px(14)}px Inter`;
    ctx.fillStyle = '#999999';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Foto', phX + phW / 2, phY + phH / 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }

  const infoX = phX + phW + gap;
  const infoMaxW = CARD_W - infoX - padX;
  let curY = bodyTop + px(4);

  const labelW = px(210);
  const colonW = px(14);
  const fontSize = px(14);

  function boldText(text, x, y, color, strokeW) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeW;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
  }

  function drawInfoRow(label, value, opts = {}) {
    const lw = opts.labelWidth || labelW;
    ctx.font = `800 ${fontSize}px Inter`;
    ctx.textBaseline = 'top';
    boldText(label, infoX, curY, opts.labelColor || C.blueDark, px(0.6));

    ctx.font = `700 ${fontSize}px Inter`;
    ctx.fillStyle = C.textDark;
    ctx.fillText(':', infoX + lw, curY);

    ctx.font = `700 ${fontSize}px Inter`;
    ctx.fillStyle = C.textDark;
    const valX = infoX + lw + colonW;
    const valMaxW = CARD_W - valX - padX;
    const lines = wrapText(ctx, value || '—', valMaxW);
    for (const line of lines) {
      ctx.fillText(line, valX, curY);
      curY += lineH;
    }
    if (lines.length === 1) curY += px(0);
  }

  ctx.font = `900 ${px(26)}px Inter`;
  ctx.textBaseline = 'top';
  boldText(data.name || '—', infoX, curY, C.textDark, px(0.8));
  curY += px(30);

  ctx.fillStyle = C.textDark;
  ctx.fillRect(infoX, curY, infoMaxW, px(3.5));
  curY += px(3.5) + px(10);

  if (isTeacher) {
    drawInfoRow('NIS', data.nisn);
    curY += gridGap;
    drawInfoRow('JABATAN', data.jabatan || 'Dosen');
    curY += gridGap;
    drawInfoRow('ID DOSEN', data.teacherId);
    curY += gridGap;
    drawInfoRow('TEMPAT, TANGGAL LAHIR', data.ttl);
    curY += gridGap;
    drawInfoRow('DITERBITKAN / STATUS', data.issuedStatus);
  } else {
    drawInfoRow('NISN', data.nisn);
    curY += gridGap;
    drawInfoRow('KELAS', data.kelas);
    curY += gridGap;
    drawInfoRow('JURUSAN', data.jurusan);
    curY += gridGap;
    drawInfoRow('TEMPAT, TANGGAL LAHIR', data.ttl);
    curY += gridGap;
    drawInfoRow('TAHUN MASUK / STATUS', `${data.tahun || '—'} / ${data.status || 'Aktif'}`);
  }

  try {
    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: 'code128',
      text: data.nisn || '0000000000',
      scale: 3,
      height: 10,
      includetext: true,
      textsize: 9,
      textxalign: 'center',
    });
    const barcodeImg = await loadImage(barcodeBuffer);
    const bcX = phX;
    const bcY = phY + phH + bcGap;
    const bcW = phW;
    ctx.drawImage(barcodeImg, bcX, bcY, bcW, bcH);
  } catch (e) {
    console.warn('Barcode error:', e.message);
  }

  const valTop = hdrH + bodyH + footerH;
  ctx.fillStyle = C.gold;
  ctx.fillRect(padX, valTop, CARD_W - padX * 2, px(2));

  ctx.font = `800 ${px(12.5)}px Inter`;
  ctx.textBaseline = 'top';
  const validText = `BERLAKU HINGGA: ${data.validUntil || '31 DESEMBER 2028'}`;
  ctx.fillStyle = C.goldDark;
  ctx.fillText(validText, padX, valTop + px(8));

  ctx.restore();

  ctx.save();
  drawRoundedRect(ctx, 0, 0, CARD_W, cardH, radius);
  ctx.strokeStyle = C.cardBorder;
  ctx.lineWidth = borderW;
  ctx.stroke();
  ctx.restore();

  return canvas.toBuffer('image/jpeg', { quality: 0.92 });
}
