require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

const CRAFTY_TOKEN = process.env.CRAFTY_TOKEN;
const CRAFTY_API_URL = process.env.CRAFTY_API_URL;

// 1. Connexion ou création de la base de données SQLite
// (Elle va se créer toute seule dans le même dossier la première fois !)
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) console.error("❌ Erreur BDD:", err.message);
    else console.log("✅ Connecté à la base de données SQLite avec succès.");
});

// 2. Création de la table des joueurs si elle n'existe pas
db.serialize(() => {
    // 1. On attend que la table soit créée
    db.run(`CREATE TABLE IF NOT EXISTS players (
        uuid TEXT PRIMARY KEY,
        pseudo TEXT,
        solde INTEGER DEFAULT 500
    )`);

    // 2. SEULEMENT ENSUITE, on insère le joueur
    db.run(`INSERT OR IGNORE INTO players (uuid, pseudo, solde) VALUES ('12-abcd', 'TimTeam', 500)`);
});

// --- ROUTES API ---
app.get('/api/players', (req, res) => {
    db.all("SELECT * FROM players", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/shop/buy-sword', (req, res) => {
    const { uuid } = req.body;
    const price = 10; 

    db.get("SELECT * FROM players WHERE uuid = ?", [uuid], async (err, player) => {
        if (err || !player) return res.status(404).json({ error: "Joueur non trouvé." });
        if (player.solde < price) return res.status(400).json({ error: "Solde insuffisant !" });

        const nouveauSolde = player.solde - price;
        
        db.run("UPDATE players SET solde = ? WHERE uuid = ?", [nouveauSolde, uuid], async (err) => {
            if (err) return res.status(500).json({ error: "Erreur lors du débit." });

            // --- 🚀 LA MAGIE POUR MINECRAFT COMMENCE ICI ---
            try {
                // ⚠️ REMPLACE ICI par l'IP de ton vieux PC (ex: 192.168.1.30) ou ton lien Cloudflare
                const CRAFTY_API_URL = "https://192.168.1.107:8443/api/v2/servers/084f6fb1-108b-4d2a-b39f-d920fe35b725/stdin";
                
                // ⚠️ REMPLACE ICI par le vrai token que tu as généré tout à l'heure
                const CRAFTY_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE3Nzk1NDkyODEsInRva2VuX2lkIjoxfQ.tSNrskl3AGuuSIPUnHmxFoGS5pwxDgVWfrMSwa8yHiU";
                
                const command = `give ${player.pseudo} diamond_sword 1`;

                // Astuce de pro : C'est l'équivalent du "-k" dans ton curl. 
                // Ça dit à Node.js de ne pas bloquer la requête à cause du certificat SSL auto-signé de Crafty.
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; 

                const response = await fetch(CRAFTY_API_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${CRAFTY_TOKEN}`,
                        'Content-Type': 'text/plain'
                    },
                    body: command
                });

                if (!response.ok) throw new Error("Crafty a refusé la connexion");

                console.log(`⚔️ ACHAT RÉUSSI : Épée envoyée à ${player.pseudo} en jeu !`);
                res.json({ success: true, pseudo: player.pseudo, newSolde: nouveauSolde });

            } catch (craftyError) {
                console.error("❌ Erreur de communication Crafty :", craftyError);
                
                // Sécurité absolue : Si le serveur Minecraft est éteint, on recrédite le joueur !
                db.run("UPDATE players SET solde = ? WHERE uuid = ?", [player.solde, uuid]);
                res.status(500).json({ error: "Le serveur Minecraft est injoignable. Achat annulé et remboursé." });
            }
        });
    });
});

app.listen(5000, () => {
    console.log("🚀 Back-end démarré sur http://localhost:5000");
});