const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const os = require('os');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Fungsi mencari IP lokal mesin (LAN Wi-Fi)
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// ---------------- REST API ROUTES ----------------

// Info Event
app.get('/api/event', (req, res) => {
  res.json(db.getEvent());
});

app.put('/api/event', (req, res) => {
  const updated = db.updateEvent(req.body);
  io.emit('event_updated', updated);
  res.json(updated);
});

// Statistik Kehadiran
app.get('/api/stats', (req, res) => {
  res.json(db.getStats());
});

// Riwayat Log Scan
app.get('/api/logs', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  res.json(db.getLogs(limit));
});

// Ambil Daftar Peserta
app.get('/api/players', (req, res) => {
  const { status, category, search } = req.query;
  const players = db.getPlayers({ status, category, search });
  res.json(players);
});

// Ambil 1 Peserta
app.get('/api/players/:id', (req, res) => {
  const player = db.getPlayerById(req.params.id);
  if (!player) return res.status(404).json({ error: "Peserta tidak ditemukan" });
  res.json(player);
});

// Tambah / Registrasi Peserta Baru
app.post('/api/players', (req, res) => {
  const { name, team, category, phone, email, notes, barcode } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Nama peserta wajib diisi" });
  }

  // Cek duplikasi barcode jika manual
  if (barcode && db.getPlayerByBarcode(barcode)) {
    return res.status(400).json({ error: "Kode Barcode sudah digunakan oleh peserta lain" });
  }

  const newPlayer = db.addPlayer({ name, team, category, phone, email, notes, barcode });
  
  // Beritahu admin ada pendaftar baru
  io.emit('player_registered', newPlayer);
  io.emit('stats_updated', db.getStats());

  res.status(201).json(newPlayer);
});

// Edit Peserta
app.put('/api/players/:id', (req, res) => {
  const updated = db.updatePlayer(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Peserta tidak ditemukan" });

  io.emit('player_updated', updated);
  io.emit('stats_updated', db.getStats());
  res.json(updated);
});

// Hapus Peserta
app.delete('/api/players/:id', (req, res) => {
  const deleted = db.deletePlayer(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Peserta tidak ditemukan" });

  io.emit('player_deleted', { id: req.params.id });
  io.emit('stats_updated', db.getStats());
  res.json({ message: "Peserta berhasil dihapus" });
});

// API Check-in (Digunakan oleh Scanner atau Webhook)
app.post('/api/checkin', (req, res) => {
  const { barcode, scannedBy } = req.body;
  if (!barcode) {
    return res.status(400).json({ error: "Barcode tidak boleh kosong" });
  }

  const result = db.checkinPlayer(barcode, scannedBy || "Station Scanner");

  // Broadcast realtime ke seluruh Admin Dashboard yang sedang membuka web
  io.emit('scan_event', result);
  io.emit('stats_updated', db.getStats());

  if (result.status === 'success') {
    res.json(result);
  } else if (result.status === 'already_checked_in') {
    res.status(409).json(result);
  } else {
    res.status(404).json(result);
  }
});

// Reset Status Check-in Peserta
app.post('/api/players/:id/reset', (req, res) => {
  const player = db.resetCheckin(req.params.id);
  if (!player) return res.status(404).json({ error: "Peserta tidak ditemukan" });

  io.emit('player_updated', player);
  io.emit('stats_updated', db.getStats());
  res.json({ message: "Status kehadiran berhasil direset", player });
});

// Reset Demo Data
app.post('/api/seed', (req, res) => {
  const data = db.seedData();
  io.emit('data_reset', data);
  io.emit('stats_updated', db.getStats());
  res.json({ message: "Data sample berhasil dimuat ulang", data });
});

// Export Data Kehadiran ke CSV
app.get('/api/export', (req, res) => {
  const players = db.getPlayers();
  const headers = ["ID", "Barcode", "Nama Peserta", "Tim / Instansi", "Kategori Lomba", "No Telepon", "Email", "Status Kehadiran", "Waktu Check-in", "Waktu Pendaftaran"];
  
  const csvRows = [
    headers.join(','),
    ...players.map(p => [
      `"${p.id}"`,
      `"${p.barcode}"`,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.team || '').replace(/"/g, '""')}"`,
      `"${(p.category || '').replace(/"/g, '""')}"`,
      `"${p.phone || '-'}"`,
      `"${p.email || '-'}"`,
      `"${p.status === 'checked-in' ? 'HADIR' : 'BELUM HADIR'}"`,
      `"${p.checkin_time ? new Date(p.checkin_time).toLocaleString('id-ID') : '-'}"`,
      `"${p.registered_at ? new Date(p.registered_at).toLocaleString('id-ID') : '-'}"`
    ].join(','))
  ];

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=rekap-kehadiran-lomba-${Date.now()}.csv`);
  res.send('\uFEFF' + csvRows.join('\n'));
});

// ---------------- WEBSOCKET REALTIME ----------------

io.on('connection', (socket) => {
  console.log(`[Socket] Klien terhubung: ${socket.id}`);

  socket.emit('init_data', {
    event: db.getEvent(),
    stats: db.getStats()
  });

  socket.on('scan_barcode', (payload) => {
    const { barcode, scannedBy } = typeof payload === 'string' ? { barcode: payload } : payload;
    const result = db.checkinPlayer(barcode, scannedBy || "Scanner Device");

    socket.emit('scan_feedback', result);
    io.emit('scan_event', result);
    io.emit('stats_updated', db.getStats());
  });

  socket.on('manual_toggle_checkin', ({ playerId }) => {
    const player = db.getPlayerById(playerId);
    if (!player) return;

    if (player.status === 'checked-in') {
      db.resetCheckin(playerId);
    } else {
      db.checkinPlayer(player.barcode, "Admin Manual");
    }

    io.emit('players_refresh');
    io.emit('stats_updated', db.getStats());
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Klien terputus: ${socket.id}`);
  });
});

// Start Server
server.listen(PORT, () => {
  const localIP = getLocalIP();
  console.log('========================================================');
  console.log('🏁 PORTAL REGISTRASI & CHECK-IN EVENT LOMBA SIAP DIGUNAKAN');
  console.log('========================================================');
  console.log(`💻 Akses Admin Laptop : http://localhost:${PORT}/admin.html`);
  console.log(`📱 Akses Scanner HP   : http://${localIP}:${PORT}/scanner.html`);
  console.log(`📝 Form Pendaftaran  : http://localhost:${PORT}/register.html`);
  console.log(`🌐 Portal Utama       : http://localhost:${PORT}/`);
  console.log('========================================================');
});
