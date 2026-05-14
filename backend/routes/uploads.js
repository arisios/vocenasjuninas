const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDb, CATEGORIES } = require('../database/db');

const router = express.Router();

const UPLOADS_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Tipo não permitido'));
  },
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Listar categorias
router.get('/categories', (req, res) => res.json({ categories: CATEGORIES }));

// Upload público (sem login obrigatório)
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Arquivo não enviado' });

  const { instagram, name, category, event_name, auth_repost, auth_mention, auth_promo } = req.body;

  if (!instagram?.trim()) return res.status(400).json({ error: 'Informe seu @Instagram' });

  const validCategories = CATEGORIES.map(c => c.id);
  if (!category || !validCategories.includes(category)) {
    return res.status(400).json({ error: 'Categoria inválida' });
  }

  const fileType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
  const handle = instagram.trim().replace(/^@/, '').toLowerCase();

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO uploads (instagram, name, category, file_type, file_path, file_size, event_name, auth_repost, auth_mention, auth_promo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    handle,
    name?.trim() || null,
    category,
    fileType,
    req.file.filename,
    req.file.size,
    event_name || 'Juninas 2026',
    auth_repost ? 1 : 0,
    auth_mention ? 1 : 0,
    auth_promo ? 1 : 0
  );

  res.status(201).json({
    upload: { id: result.lastInsertRowid, instagram: handle, category, file_type: fileType },
    message: 'Momento enviado com sucesso!'
  });
});

module.exports = router;
