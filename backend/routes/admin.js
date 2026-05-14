const express = require('express');
const path = require('path');
const fs = require('fs');
const { getDb, CATEGORIES } = require('../database/db');
const { adminMiddleware } = require('../middleware/auth');

const router = express.Router();
const UPLOADS_DIR = path.join(__dirname, '../uploads');

router.get('/uploads', adminMiddleware, (req, res) => {
  const { category, event_name, featured } = req.query;
  const db = getDb();

  let q = 'SELECT * FROM uploads WHERE 1=1';
  const params = [];

  if (category)   { q += ' AND category = ?';    params.push(category); }
  if (event_name) { q += ' AND event_name = ?';  params.push(event_name); }
  if (featured)   { q += ' AND featured = 1'; }

  q += ' ORDER BY created_at DESC';

  res.json({ uploads: db.prepare(q).all(...params), categories: CATEGORIES });
});

router.delete('/uploads/:id', adminMiddleware, (req, res) => {
  const db = getDb();
  const u = db.prepare('SELECT * FROM uploads WHERE id = ?').get(parseInt(req.params.id));
  if (!u) return res.status(404).json({ error: 'Upload não encontrado' });

  const p = path.join(UPLOADS_DIR, u.file_path);
  if (fs.existsSync(p)) fs.unlinkSync(p);
  db.prepare('DELETE FROM uploads WHERE id = ?').run(u.id);

  res.json({ success: true });
});

router.patch('/uploads/:id/featured', adminMiddleware, (req, res) => {
  const db = getDb();
  const u = db.prepare('SELECT * FROM uploads WHERE id = ?').get(parseInt(req.params.id));
  if (!u) return res.status(404).json({ error: 'Upload não encontrado' });

  db.prepare('UPDATE uploads SET featured = ? WHERE id = ?').run(u.featured ? 0 : 1, u.id);
  res.json({ upload: db.prepare('SELECT * FROM uploads WHERE id = ?').get(u.id) });
});

router.get('/stats', adminMiddleware, (req, res) => {
  const db = getDb();
  const total = db.prepare('SELECT COUNT(*) as c FROM uploads').get().c;
  const featured = db.prepare('SELECT COUNT(*) as c FROM uploads WHERE featured = 1').get().c;
  const byCategory = db.prepare('SELECT category, COUNT(*) as count FROM uploads GROUP BY category ORDER BY count DESC').all();
  const byType = db.prepare('SELECT file_type, COUNT(*) as count FROM uploads GROUP BY file_type').all();
  const byEvent = db.prepare('SELECT event_name, COUNT(*) as count FROM uploads GROUP BY event_name ORDER BY count DESC').all();

  res.json({ stats: { total, featured, byCategory, byType, byEvent } });
});

module.exports = router;
