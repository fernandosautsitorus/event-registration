const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Pastikan direktori data ada
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Data awal bawaan
const DEFAULT_DATA = {
  event: {
    name: "Turnamen Esports & Kompetisi Nasional 2026",
    location: "Grand Arena Convention Center",
    date: "2026-09-15"
  },
  players: [
    {
      id: "PLY-1001",
      barcode: "EVT-2026-1001",
      name: "Rizky Pratama",
      team: "Garuda Esports",
      category: "Mobile Legends",
      phone: "081234567890",
      email: "rizky@garuda.id",
      status: "registered",
      checkin_time: null,
      registered_at: new Date().toISOString()
    },
    {
      id: "PLY-1002",
      barcode: "EVT-2026-1002",
      name: "Ahmad Maulana",
      team: "Viper Squad",
      category: "PUBG Mobile",
      phone: "082198765432",
      email: "ahmad@vipersquad.com",
      status: "registered",
      checkin_time: null,
      registered_at: new Date().toISOString()
    },
    {
      id: "PLY-1003",
      barcode: "EVT-2026-1003",
      name: "Siti Nurhaliza",
      team: "Indo Smash Club",
      category: "Badminton Tunggal Putra/Putri",
      phone: "085712345678",
      email: "siti.smash@gmail.com",
      status: "registered",
      checkin_time: null,
      registered_at: new Date().toISOString()
    },
    {
      id: "PLY-1004",
      barcode: "EVT-2026-1004",
      name: "Kevin Sanjaya Putra",
      team: "Cyber Tigers",
      category: "Valorant",
      phone: "081377889900",
      email: "kevin@cybertigers.gg",
      status: "registered",
      checkin_time: null,
      registered_at: new Date().toISOString()
    },
    {
      id: "PLY-1005",
      barcode: "EVT-2026-1005",
      name: "Dian Permata",
      team: "Robotics ITB",
      category: "Robotika & AI Lomba",
      phone: "087811223344",
      email: "dian@itb.ac.id",
      status: "registered",
      checkin_time: null,
      registered_at: new Date().toISOString()
    }
  ],
  logs: []
};

// Inisialisasi DB jika belum ada
function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    saveDB(DEFAULT_DATA);
  }
}

function loadDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      initDB();
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database:", error);
    return DEFAULT_DATA;
  }
}

function saveDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error("Error saving database:", error);
  }
}

function getEvent() {
  const db = loadDB();
  return db.event || DEFAULT_DATA.event;
}

function updateEvent(eventData) {
  const db = loadDB();
  db.event = { ...db.event, ...eventData };
  saveDB(db);
  return db.event;
}

function getPlayers(filter = {}) {
  const db = loadDB();
  let result = db.players;

  if (filter.status) {
    result = result.filter(p => p.status.toLowerCase() === filter.status.toLowerCase());
  }
  if (filter.category) {
    result = result.filter(p => p.category.toLowerCase() === filter.category.toLowerCase());
  }
  if (filter.search) {
    const q = filter.search.toLowerCase();
    result = result.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.barcode.toLowerCase().includes(q) ||
      (p.team && p.team.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  }
  return result;
}

function getPlayerByBarcode(barcode) {
  if (!barcode) return null;
  const db = loadDB();
  const cleaned = barcode.trim();
  return db.players.find(p => p.barcode.toLowerCase() === cleaned.toLowerCase()) || null;
}

function getPlayerById(id) {
  const db = loadDB();
  return db.players.find(p => p.id === id) || null;
}

function generateBarcode() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  return `EVT-${year}-${randomNum}`;
}

function addPlayer(playerData) {
  const db = loadDB();
  const id = `PLY-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`;
  const barcode = playerData.barcode && playerData.barcode.trim() 
    ? playerData.barcode.trim() 
    : generateBarcode();

  const newPlayer = {
    id,
    barcode,
    name: playerData.name.trim(),
    team: playerData.team ? playerData.team.trim() : "Independen",
    category: playerData.category || "Umum",
    phone: playerData.phone || "-",
    email: playerData.email || "-",
    notes: playerData.notes || "",
    status: "registered",
    checkin_time: null,
    registered_at: new Date().toISOString()
  };

  db.players.unshift(newPlayer);
  saveDB(db);
  return newPlayer;
}

function updatePlayer(id, updates) {
  const db = loadDB();
  const index = db.players.findIndex(p => p.id === id);
  if (index === -1) return null;

  db.players[index] = { ...db.players[index], ...updates };
  saveDB(db);
  return db.players[index];
}

function deletePlayer(id) {
  const db = loadDB();
  const initialLength = db.players.length;
  db.players = db.players.filter(p => p.id !== id);
  const deleted = db.players.length < initialLength;
  if (deleted) saveDB(db);
  return deleted;
}

function checkinPlayer(barcode, scannedBy = "Gate Scanner") {
  const db = loadDB();
  const cleaned = (barcode || "").trim();
  const playerIndex = db.players.findIndex(p => p.barcode.toLowerCase() === cleaned.toLowerCase());

  const timestamp = new Date().toISOString();

  if (playerIndex === -1) {
    const log = {
      id: `LOG-${Date.now()}`,
      barcode: cleaned,
      status: "not_found",
      message: "Barcode tidak terdaftar dalam sistem!",
      timestamp,
      scanned_by: scannedBy
    };
    db.logs.unshift(log);
    if (db.logs.length > 200) db.logs.pop();
    saveDB(db);
    return { status: "not_found", barcode: cleaned, message: "Barcode tidak terdaftar!", log };
  }

  const player = db.players[playerIndex];

  if (player.status === "checked-in") {
    const log = {
      id: `LOG-${Date.now()}`,
      playerId: player.id,
      playerName: player.name,
      barcode: player.barcode,
      status: "already_checked_in",
      message: `Pemain ${player.name} sudah check-in pada ${new Date(player.checkin_time).toLocaleTimeString('id-ID')}`,
      timestamp,
      scanned_by: scannedBy
    };
    db.logs.unshift(log);
    if (db.logs.length > 200) db.logs.pop();
    saveDB(db);
    return { status: "already_checked_in", player, message: "Pemain sudah check-in sebelumnya!", log };
  }

  // Check-in berhasil
  player.status = "checked-in";
  player.checkin_time = timestamp;
  db.players[playerIndex] = player;

  const log = {
    id: `LOG-${Date.now()}`,
    playerId: player.id,
    playerName: player.name,
    team: player.team,
    category: player.category,
    barcode: player.barcode,
    status: "success",
    message: `Check-in berhasil untuk ${player.name}`,
    timestamp,
    scanned_by: scannedBy
  };
  db.logs.unshift(log);
  if (db.logs.length > 200) db.logs.pop();
  saveDB(db);

  return { status: "success", player, message: "Check-in berhasil!", log };
}

function resetCheckin(id) {
  const db = loadDB();
  const player = db.players.find(p => p.id === id);
  if (!player) return null;
  player.status = "registered";
  player.checkin_time = null;
  saveDB(db);
  return player;
}

function getStats() {
  const db = loadDB();
  const total = db.players.length;
  const checkedIn = db.players.filter(p => p.status === "checked-in").length;
  const registered = total - checkedIn;
  const percentage = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

  // Breakdown per kategori
  const categories = {};
  db.players.forEach(p => {
    const cat = p.category || "Lainnya";
    if (!categories[cat]) {
      categories[cat] = { total: 0, checkedIn: 0 };
    }
    categories[cat].total++;
    if (p.status === "checked-in") {
      categories[cat].checkedIn++;
    }
  });

  return {
    total,
    checkedIn,
    registered,
    percentage,
    categories
  };
}

function getLogs(limit = 50) {
  const db = loadDB();
  return (db.logs || []).slice(0, limit);
}

function seedData() {
  saveDB(DEFAULT_DATA);
  return DEFAULT_DATA;
}

module.exports = {
  getEvent,
  updateEvent,
  getPlayers,
  getPlayerByBarcode,
  getPlayerById,
  addPlayer,
  updatePlayer,
  deletePlayer,
  checkinPlayer,
  resetCheckin,
  getStats,
  getLogs,
  seedData
};
