import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// ADMIN PASSWORD
const ADMIN_PASSWORD = "yakhltvwwyak111";

// Utility to load JSON
function load(file) {
    const filepath = path.join("data", file);
    if (!fs.existsSync(filepath)) return [];
    return JSON.parse(fs.readFileSync(filepath));
}

// Utility to save JSON
function save(file, data) {
    fs.writeFileSync(path.join("data", file), JSON.stringify(data, null, 2));
}

// ----------------------------
// PUBLIC ENDPOINTS
// ----------------------------

// All matches
app.get("/api/matches", (req, res) => {
    const matches = load("matches.json");
    res.json(matches);
});

// Get single match
app.get("/api/match/:id", (req, res) => {
    const matches = load("matches.json");
    const match = matches.find(m => m.id == req.params.id);
    res.json(match || {});
});

// ----------------------------
// ADMIN ENDPOINTS
// ----------------------------

// Verify admin
app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ ok: true });
    } else {
        res.status(403).json({ ok: false, message: "Invalid password" });
    }
});

// Add new match
app.post("/api/admin/match/add", (req, res) => {
    if (req.body.password !== ADMIN_PASSWORD) return res.status(403).json({ message: "Forbidden" });

    const matches = load("matches.json");
    const newMatch = req.body.match;

    newMatch.id = Date.now();
    matches.push(newMatch);

    save("matches.json", matches);

    res.json({ ok: true, id: newMatch.id });
});

// Remove match
app.post("/api/admin/match/delete", (req, res) => {
    if (req.body.password !== ADMIN_PASSWORD) return res.status(403).json({ message: "Forbidden" });

    const matches = load("matches.json");
    const filtered = matches.filter(m => m.id != req.body.id);

    save("matches.json", filtered);

    res.json({ ok: true });
});

// --- Teams ---
app.get("/api/teams", (req, res) => {
    const teams = load("teams.json");
    res.json(teams);
});

app.post("/api/admin/team/add", (req, res) => {
    if (req.body.password !== ADMIN_PASSWORD) return res.status(403).json({ message: "Forbidden" });
    const teams = load("teams.json");
    const team = req.body.team;

    team.id = Date.now();
    teams.push(team);

    save("teams.json", teams);

    res.json({ ok: true });
});

// --- Players ---
app.get("/api/players", (req, res) => {
    res.json(load("players.json"));
});

app.post("/api/admin/player/add", (req, res) => {
    if (req.body.password !== ADMIN_PASSWORD) return res.status(403).json({ message: "Forbidden" });

    const players = load("players.json");
    const player = req.body.player;

    player.id = Date.now();
    players.push(player);

    save("players.json", players);

    res.json({ ok: true });
});

// --- Tournaments ---
app.get("/api/tournaments", (req, res) => {
    res.json(load("tournaments.json"));
});

app.post("/api/admin/tournament/add", (req, res) => {
    if (req.body.password !== ADMIN_PASSWORD) return res.status(403).json({ message: "Forbidden" });

    const tournaments = load("tournaments.json");
    const t = req.body.tournament;

    t.id = Date.now();
    tournaments.push(t);

    save("tournaments.json", tournaments);

    res.json({ ok: true });
});

// ----------------------------
// START SERVER
// ----------------------------

app.listen(PORT, () => {
    console.log("API started on port " + PORT);
});
