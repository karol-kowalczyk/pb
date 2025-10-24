const path = require('path');
const fs = require('fs/promises');
const os = require('os');
const { randomUUID } = require('crypto');

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const defaultDataDir = process.env.HOME
  ? path.join(process.env.HOME, '.aluterr-lieferscheine')
  : path.join(os.tmpdir(), 'aluterr-lieferscheine');

const DATA_DIR = process.env.DATA_DIR || defaultDataDir;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

/**
 * Ensure the data directory exists before serving requests.
 */
async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function getRecordPath(id) {
  return path.join(DATA_DIR, `${id}.json`);
}

function isValidKey(id) {
  return /^[a-f0-9-]{8,}$/i.test(id);
}

app.post('/save', async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Ungültige Nutzlast' });
    }

    const key = randomUUID();
    const record = {
      key,
      createdAt: new Date().toISOString(),
      payload: req.body
    };

    await fs.writeFile(getRecordPath(key), JSON.stringify(record, null, 2), 'utf8');

    res.json({ key });
  } catch (error) {
    next(error);
  }
});

app.get('/load/:key', async (req, res, next) => {
  try {
    const { key } = req.params;

    if (!isValidKey(key)) {
      return res.status(400).json({ error: 'Ungültiger Schlüssel' });
    }

    const recordRaw = await fs.readFile(getRecordPath(key), 'utf8');
    const record = JSON.parse(recordRaw);

    res.json(record.payload ?? {});
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'Eintrag nicht gefunden' });
    }
    next(error);
  }
});

// Basic health check endpoint for uptime monitoring.
app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok' });
});

// Global error handler so the server responds with JSON errors.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Interner Serverfehler' });
});

ensureDataDir()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend läuft auf http://localhost:${PORT}`);
      console.log(`Daten werden gespeichert in: ${DATA_DIR}`);
    });
  })
  .catch((err) => {
    console.error('Konnte Datenverzeichnis nicht vorbereiten:', err);
    process.exit(1);
  });
