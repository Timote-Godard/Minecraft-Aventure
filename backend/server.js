require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise'); // On utilise la version 'promise' pour un code plus moderne
const bcrypt = require('bcrypt');

const app = express();
app.use(cors({ origin: 'https://minecraft.timote.ovh' }));
app.use(express.json());

// Tes identifiants Crafty
const CRAFTY_TOKEN = process.env.CRAFTY_TOKEN;
const CRAFTY_API_URL = process.env.CRAFTY_API_URL;

// 1. Connexion à la base de données MySQL (via ton conteneur Docker)
const pool = mysql.createPool({
    host: '127.0.0.1', // Le nom de ton service Docker. (Mets 'localhost' si tu lances Node hors de Docker pour tester)
    user: 'timote',
    password: process.env.MDP_MYSQL, // L'idéal sera de le passer dans ton fichier .env !
    database: 'minecraft_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 2. Initialisation de la table (équivalent du db.serialize de SQLite)
async function initDB() {
    try {
        // Création de la table avec la syntaxe MySQL (VARCHAR au lieu de TEXT pour les clés)
        await pool.query(`CREATE TABLE IF NOT EXISTS players (
            uuid VARCHAR(255) PRIMARY KEY,
            pseudo VARCHAR(255),
            solde INT DEFAULT 500
        )`);
        
        // Insertion de test (IGNORE évite les erreurs si le joueur existe déjà)
        await pool.query(`INSERT IGNORE INTO players (uuid, pseudo, solde) VALUES ('12-abcd', 'TimTeam', 500)`);
        console.log("✅ Connecté à MySQL et table prête.");
    } catch (err) {
        console.error("❌ Erreur d'initialisation BDD:", err.message);
    }
}
initDB();

// --- ROUTES API ---

// Récupérer tous les joueurs
app.get('/api/players', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM players");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ROUTE DE CONNEXION ---
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. On cherche le joueur via la colonne optimisée 'username_lower'
        // On récupère la colonne 'data' (qui contient le JSON) ET l'UUID du joueur !
        const [rows] = await pool.query(
            'SELECT data, uuid FROM easyauth WHERE username_lower = LOWER(?)', 
            [username]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Ce pseudo n'est pas inscrit sur le serveur Minecraft." });
        }

        // 2. Extraction du mot de passe depuis l'objet JSON
        const userData = rows[0].data;
        const hashedPassword = userData.password; // C'est ici que le hash était caché !
        const playerUuid = rows[0].uuid; // C'est parfait, on a son vrai UUID Minecraft

        if (!hashedPassword) {
            return res.status(500).json({ error: "Aucun mot de passe enregistré pour ce compte." });
        }

        // 3. On compare le mot de passe tapé avec le hash de la DB
        const match = await bcrypt.compare(password, hashedPassword);

        if (match) {
            // 1. On inscrit le joueur s'il est nouveau
            await pool.query(
                `INSERT IGNORE INTO players (uuid, pseudo, solde) VALUES (?, ?, 500)`, 
                [playerUuid, username]
            );

            // 2. On récupère ses informations complètes (dont son solde actuel)
            const [playerData] = await pool.query(
                `SELECT pseudo, solde FROM players WHERE uuid = ?`, 
                [playerUuid]
            );
            
            // 3. On envoie tout ça à React !
            res.json({ 
                success: true, 
                uuid: playerUuid,
                pseudo: playerData[0].pseudo,
                solde: playerData[0].solde
            });
        } else {
            res.status(401).json({ error: 'Mot de passe incorrect.' });
        }
    } catch (error) {
        console.error("❌ Erreur de connexion :", error.message);
        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
});
// Acheter une épée
app.post('/api/shop/buy-sword', async (req, res) => {
    const { uuid } = req.body;
    const price = 150; // Aligné avec ton interface React !

    try {
        // 1. On cherche le joueur
        const [rows] = await pool.query("SELECT * FROM players WHERE uuid = ?", [uuid]);
        
        if (rows.length === 0) return res.status(404).json({ error: "Joueur non trouvé." });
        
        const player = rows[0];
        
        if (player.solde < price) return res.status(400).json({ error: "Solde insuffisant !" });

        const nouveauSolde = player.solde - price;
        
        // 2. On débite le joueur
        await pool.query("UPDATE players SET solde = ? WHERE uuid = ?", [nouveauSolde, uuid]);

        // --- 🚀 LA MAGIE POUR MINECRAFT COMMENCE ICI ---
        const command = `give ${player.pseudo} diamond_sword 1`;

        // Astuce pour contourner le SSL auto-signé de Crafty
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; 

        const response = await fetch(CRAFTY_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CRAFTY_TOKEN}`,
                'Content-Type': 'text/plain'
            },
            body: command
        });

        if (!response.ok) {
            throw new Error("Crafty a refusé la connexion");
        }

        console.log(`⚔️ ACHAT RÉUSSI : Épée envoyée à ${player.pseudo} en jeu !`);
        res.json({ success: true, pseudo: player.pseudo, newSolde: nouveauSolde });

    } catch (error) {
        console.error("❌ Erreur lors de l'achat :", error.message);
        
        // Sécurité absolue : On recrédite le joueur si la connexion Crafty a échoué
        if (error.message === "Crafty a refusé la connexion" || error.cause) {
            await pool.query("UPDATE players SET solde = solde + ? WHERE uuid = ?", [price, uuid]);
            return res.status(500).json({ error: "Le serveur Minecraft est injoignable. Achat annulé et remboursé." });
        }
        
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
});

app.listen(5000, () => {
    console.log("🚀 Back-end démarré sur http://localhost:5000");
});