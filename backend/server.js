require('dotenv').config({ override: true }); // On force l'écrasement du cache d'environnement
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ✨ Sécurité : Permet à Node de parler à Crafty (HTTPS local / Certificat auto-signé)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
app.use(cors({ origin: 'https://minecraft.timote.ovh' }));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;
const CRAFTY_TOKEN = process.env.CRAFTY_TOKEN;
const CRAFTY_API_URL = process.env.CRAFTY_API_URL;
const CRAFTY_STATS_URL = process.env.CRAFTY_STATS_URL;

// 🔌 Connexion à la base de données MySQL
const pool = mysql.createPool({
    host: '127.0.0.1', 
    user: 'timote',
    password: process.env.MDP_MYSQL, 
    database: 'minecraft_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
});

const dicoEvents = {
    "stopPluie" : "weather clear",
    "thunder" : "weather thunder",

}

// 📡 FONCTION MAGIQUE : Envoie la commande en direct à l'API de Crafty
async function sendCraftyCommand(pseudo, targetItem, categorie, customModelData = 0, targets = []) {
    try {
        let command = "";

        if (categorie === 'evenementPositif' || categorie === 'evenementNegatif') {
            // 1. Remplacer TOUTES les mentions de l'acheteur
            command = targetItem.replaceAll('{player}', pseudo);
            
            // 2. Remplacer les cibles si l'événement en nécessite
            if (targets && targets.length > 0) {
                
                // Pour les événements multi-cibles : {target1}, {target2}, etc.
                targets.forEach((target, index) => {
                    command = command.replaceAll(`{target${index + 1}}`, target);
                });
                
                // Pour les événements à cible unique : {target}
                command = command.replaceAll('{target}', targets[0]);
            }
        } else {
            // Commande pour les cosmétiques/équipements
            command = `skin-update ${pseudo} ${targetItem} ${customModelData}`;
        }
        
        const response = await fetch(CRAFTY_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CRAFTY_TOKEN}`,
                'Content-Type': 'application/json'
            },
            // Formatage en objet JSON valide attendu par les API standards de serveurs
            body: command
        });
        
        if (!response.ok) {
            const errText = await response.text();
            console.error(`❌ Crafty a refusé la commande (${response.status}):`, errText);
        } else {
            console.log(`📡 Commande exécutée sur Minecraft via Crafty -> ${command}`);
        }
    } catch (err) {
        console.error("❌ Erreur de communication avec Crafty :", err.message);
    }
}

const fs = require('fs').promises;
const path = require('path');

async function initDB() {
    try {
        // Table des joueurs
        await pool.query(`CREATE TABLE IF NOT EXISTS players (
            uuid VARCHAR(255) PRIMARY KEY,
            pseudo VARCHAR(255),
            solde INT DEFAULT 500
        )`);
        
        // Catalogue de la boutique
        await pool.query(`CREATE TABLE IF NOT EXISTS shop_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nom VARCHAR(255) NOT NULL,
            description TEXT,
            prix INT NOT NULL,
            custom_model_data INT NOT NULL,
            target_item VARCHAR(100) NOT NULL,
            categorie ENUM('chapeau', 'evenementPositif', 'evenementNegatif', 'cosmetique', 'epee', 'pioche', 'houe', 'pelle', 'hache', 'bouclier', 'arc', 'arbalete', 'bottes', 'pantalon', 'plastron','casque','elytre') NOT NULL
        )`);

        // Sac à dos des joueurs
        await pool.query(`CREATE TABLE IF NOT EXISTS player_inventory (
            uuid VARCHAR(255),
            item_id INT,
            is_equipped BOOLEAN DEFAULT FALSE,
            PRIMARY KEY(uuid, item_id),
            FOREIGN KEY(item_id) REFERENCES shop_items(id),
            FOREIGN KEY(uuid) REFERENCES players(uuid) ON DELETE CASCADE
        )`);
        
        // Lecture et exécution du fichier d'initialisation de données
        const cheminFichier = path.join(__dirname, 'requetes_insert.sql');
        const sqlString = await fs.readFile(cheminFichier, 'utf-8');
        
        if (sqlString.trim().length > 0) {
            await pool.query(sqlString);
            console.log("✅ Données du fichier SQL insérées avec succès !");
        }
            
        console.log("✅ Connecté à MySQL et toutes les tables sont prêtes !");
    } catch (err) {
        console.error("❌ Erreur d'initialisation BDD:", err.message);
    }
}

initDB();

// --- ROUTE DE CONNEXION ---
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT data, uuid FROM easyauth WHERE username_lower = LOWER(?)', [username]);
        if (rows.length === 0) return res.status(404).json({ error: "Ce pseudo n'est pas inscrit." });

        const userData = rows[0].data;
        const hashedPassword = userData.password; 
        const playerUuid = rows[0].uuid; 

        if (!hashedPassword) return res.status(500).json({ error: "Aucun mot de passe enregistré." });
        const match = await bcrypt.compare(password, hashedPassword);

        if (match) {
            await pool.query(`INSERT IGNORE INTO players (uuid, pseudo, solde) VALUES (?, ?, 500)`, [playerUuid, username]);
            const [playerData] = await pool.query(`SELECT pseudo, solde FROM players WHERE uuid = ?`, [playerUuid]);

            const token = jwt.sign(
                { uuid: playerUuid, pseudo: playerData[0].pseudo },
                JWT_SECRET,
                { expiresIn: '6h' }
            );
            
            res.json({ success: true, token: token, pseudo: playerData[0].pseudo, solde: playerData[0].solde });
        } else {
            res.status(401).json({ error: 'Mot de passe incorrect.' });
        }
    } catch (error) {
        console.error("❌ Erreur de connexion :", error.message);
        res.status(500).json({ error: 'Erreur interne.' });
    }
});

// --- ROUTE POUR VOIR SON SAC À DOS ---
app.get('/api/inventory', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "déconnecté" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const [rows] = await pool.query(`
            SELECT shop_items.id, shop_items.nom, shop_items.description, shop_items.custom_model_data, shop_items.target_item, player_inventory.is_equipped 
            FROM player_inventory 
            JOIN shop_items ON player_inventory.item_id = shop_items.id 
            WHERE player_inventory.uuid = ?
        `, [decoded.uuid]);
        res.json(rows);
    } catch (error) {
        console.error("❌ Erreur inventaire :", error.message);
        res.status(500).json({ error: "Erreur interne." });
    }
});

// --- ROUTE POUR DÉSÉQUIPER UN SKIN ---
app.post('/api/inventory/unequip', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "déconnecté" });

    const { itemId } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const uuid = decoded.uuid;

        const [itemRows] = await pool.query("SELECT target_item FROM shop_items WHERE id = ?", [itemId]);
        if (itemRows.length === 0) return res.status(404).json({ error: "Objet inconnu." });
        const target_item = itemRows[0].target_item;

        // 1. Mise à jour pour le site web
        await pool.query(`UPDATE player_inventory SET is_equipped = FALSE WHERE uuid = ? AND item_id = ?`, [uuid, itemId]);

        // 2. Mise à jour pour le mod Minecraft (Synchronisation hors-ligne)
        await pool.query(`DELETE FROM aventure_cosmetics WHERE uuid = ? AND target_item = ?`, [uuid, target_item]);

        // 3. Application en temps réel si le joueur est connecté
        await sendCraftyCommand(decoded.pseudo, target_item, 'cosmetique', 0);

        res.json({ success: true, message: "Skin retiré avec succès !" });
    } catch (error) {
        console.error("❌ Erreur déséquipement :", error.message);
        res.status(500).json({ error: "Erreur interne." });
    }
});

// --- ROUTE POUR ÉQUIPER UN SKIN ---
app.post('/api/inventory/equip', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "déconnecté" });

    const { itemId } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const uuid = decoded.uuid;

        const [itemRows] = await pool.query("SELECT custom_model_data, target_item FROM shop_items WHERE id = ?", [itemId]);
        if (itemRows.length === 0) return res.status(404).json({ error: "Objet inconnu." });
        
        const { custom_model_data, target_item } = itemRows[0];

        // 1. Déséquipe sur le site web les anciens objets de la même famille
        await pool.query(`
            UPDATE player_inventory 
            JOIN shop_items ON player_inventory.item_id = shop_items.id 
            SET player_inventory.is_equipped = FALSE 
            WHERE player_inventory.uuid = ? AND shop_items.target_item = ?
        `, [uuid, target_item]);

        // 2. Équipe le nouvel objet sur le site web
        await pool.query(`UPDATE player_inventory SET is_equipped = TRUE WHERE uuid = ? AND item_id = ?`, [uuid, itemId]);

        // 3. Mise à jour de la table du mod Minecraft (Synchronisation hors-ligne)
        await pool.query(`
            INSERT INTO aventure_cosmetics (uuid, target_item, model_data) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE model_data = ?
        `, [uuid, target_item, custom_model_data, custom_model_data]);

        // 4. Application en temps réel si le joueur est connecté
        await sendCraftyCommand(decoded.pseudo, target_item, 'cosmetique', custom_model_data);

        res.json({ success: true, message: "Skin équipé avec succès !" });
    } catch (error) {
        console.error("❌ Erreur équipement :", error.message);
        res.status(500).json({ error: "Erreur interne." });
    }
});

app.get('/api/shop/items', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM shop_items");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ROUTE POUR VOIR LES DEALS ---
app.get('/api/shop/deals', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM shop_items WHERE categorie IN ('evenementPositif', 'evenementNegatif')");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ROUTE POUR ACHETER UN OBJET ---
app.post('/api/shop/buy', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "déconnecté" });

    const { itemId, targets } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const uuid = decoded.uuid;

        const [itemRows] = await pool.query("SELECT * FROM shop_items WHERE id = ?", [itemId]);
        if (itemRows.length === 0) return res.status(404).json({ error: "Article introuvable." });
        const item = itemRows[0];

        const [playerRows] = await pool.query("SELECT pseudo, solde FROM players WHERE uuid = ?", [uuid]);
        if (playerRows.length === 0) return res.status(404).json({ error: "Joueur introuvable." });
        const player = playerRows[0];

        if (player.solde < item.prix) return res.status(400).json({ error: "Solde insuffisant !" });

        const nouveauSolde = player.solde - item.prix;
        
        // 1. On débite le joueur
        await pool.query("UPDATE players SET solde = ? WHERE uuid = ?", [nouveauSolde, uuid]);

        // 2. Traitement selon la catégorie
        if (item.categorie === 'evenementPositif' || item.categorie === 'evenementNegatif') {
            
            // On envoie la commande SQL brute (item.target_item) et le tableau des cibles (targets)
            // L'argument '0' correspond au customModelData (inutile pour un event)
            await sendCraftyCommand(player.pseudo, item.target_item, item.categorie, 0, targets);
            console.log(`⚡ ÉVÉNEMENT (${item.categorie}) ACHETÉ par ${player.pseudo} : ${item.nom}`);
            
        } else {
            // C'est un équipement ou cosmétique : on le range dans son inventaire virtuel
            await pool.query("INSERT IGNORE INTO player_inventory (uuid, item_id, is_equipped) VALUES (?, ?, FALSE)", [uuid, item.id]);
            console.log(`🛒 ${player.pseudo} a débloqué un(e) [${item.categorie}] : ${item.nom}`);
        }

        res.json({ success: true, itemName: item.nom, newSolde: nouveauSolde });
    } catch (error) {
        console.error("❌ Erreur achat :", error.message);
        res.status(500).json({ error: "Erreur interne." });
    }
});

app.get('/api/players/online', async (req, res) => {
    try {
        const response = await fetch(CRAFTY_STATS_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${CRAFTY_TOKEN}`
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP Crafty: ${response.status}`);
        }

        const json = await response.json();
        
        let rawPlayers = json.data?.players;

        if (typeof rawPlayers === 'string') {
            try {
                rawPlayers = JSON.parse(rawPlayers.replace(/'/g, '"'));
            } catch (e) {
                console.error("⚠️ Impossible de parser les joueurs reçus :", rawPlayers);
                rawPlayers = [];
            }
        }

        if (!Array.isArray(rawPlayers)) {
            rawPlayers = [];
        }

        const players = rawPlayers
            .map(p => typeof p === 'string' ? p : (p?.name || p?.username))
            .filter(Boolean);

        res.json({ success: true, players: players });
    } catch (error) {
        console.error("❌ Erreur de récupération des joueurs via Crafty :", error.message);
        res.status(500).json({ error: "Impossible de récupérer les joueurs." });
    }
});

app.listen(5000, () => {
    console.log("🚀 Back-end démarré sur http://localhost:5000");
});