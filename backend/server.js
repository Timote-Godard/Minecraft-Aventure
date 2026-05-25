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

// 🔌 Connexion à la base de données MySQL
const pool = mysql.createPool({
    host: '127.0.0.1', 
    user: 'timote',
    password: process.env.MDP_MYSQL, 
    database: 'minecraft_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 📡 FONCTION MAGIQUE : Envoie la commande en direct à l'API de Crafty
async function sendCraftyCommand(pseudo, targetItem, modelData) {
    try {
        // Ex: skin-update TimTeam minecraft:wooden_sword 1
        const command = `skin-update ${pseudo} ${targetItem} ${modelData}`;
        
        const response = await fetch(CRAFTY_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CRAFTY_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ command: command })
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

// 🗄️ Initialisation des tables
async function initDB() {
    try {
        // Table des joueurs
        await pool.query(`CREATE TABLE IF NOT EXISTS players (
            uuid VARCHAR(255) PRIMARY KEY,
            pseudo VARCHAR(255),
            solde INT DEFAULT 500
        )`);
        
        // Catalogue de la boutique (avec target_item inclus pour les nouvelles installations)
        await pool.query(`CREATE TABLE IF NOT EXISTS shop_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nom VARCHAR(255),
            description TEXT,
            prix INT,
            categorie VARCHAR(50), 
            custom_model_data INT,
            target_item VARCHAR(100) DEFAULT 'minecraft:wooden_sword'
        )`);

        // ✨ SÉCURITÉ MIGRATION : Si la table existait déjà hier, on lui ajoute la colonne target_item
        try {
            await pool.query(`ALTER TABLE shop_items ADD COLUMN target_item VARCHAR(100) DEFAULT 'minecraft:wooden_sword'`);
            console.log("🔹 Colonne 'target_item' synchronisée avec succès !");
        } catch (e) {
            // La colonne existe déjà, on ignore l'erreur sans bloquer le serveur
        }

        // Sac à dos des joueurs
        await pool.query(`CREATE TABLE IF NOT EXISTS player_inventory (
            uuid VARCHAR(255),
            item_id INT,
            is_equipped BOOLEAN DEFAULT FALSE,
            PRIMARY KEY(uuid, item_id),
            FOREIGN KEY(item_id) REFERENCES shop_items(id)
        )`);
        
        // Insertion de test
        await pool.query(`INSERT IGNORE INTO players (uuid, pseudo, solde) VALUES ('12-abcd', 'TimTeam', 500)`);
        
        // Mise à jour de ton premier skin pour qu'il cible explicitement l'épée en bois !
        await pool.query(`INSERT INTO shop_items (id, nom, description, prix, categorie, custom_model_data, target_item) 
            VALUES (1, 'Épée de Feu', 'Une lame incandescente forgée dans le Nether.', 150, 'skin_sword', 1, 'minecraft:wooden_sword')
            ON DUPLICATE KEY UPDATE target_item = 'minecraft:wooden_sword', custom_model_data = 1`);
            
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
    if (!token) return res.status(401).json({ error: "Accès refusé." });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const [rows] = await pool.query(`
            SELECT shop_items.id, shop_items.nom, shop_items.description, shop_items.categorie, shop_items.custom_model_data, shop_items.target_item, player_inventory.is_equipped 
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

// --- ROUTE POUR DÉSÉQUIPER UN SKIN (Mise à jour directe sur Minecraft) ---
app.post('/api/inventory/unequip', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Accès refusé." });

    const { itemId } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const uuid = decoded.uuid;

        // On récupère la cible pour savoir ce qu'on déséquipe
        const [itemRows] = await pool.query("SELECT target_item FROM shop_items WHERE id = ?", [itemId]);
        if (itemRows.length === 0) return res.status(404).json({ error: "Objet inconnu." });

        await pool.query(`UPDATE player_inventory SET is_equipped = FALSE WHERE uuid = ? AND item_id = ?`, [uuid, itemId]);

        // 🚀 SYNC EN JEU : On envoie 0 à Crafty pour retirer l'illusion sur cet item précis
        await sendCraftyCommand(decoded.pseudo, itemRows[0].target_item, 0);

        res.json({ success: true, message: "Skin retiré avec succès !" });
    } catch (error) {
        console.error("❌ Erreur déséquipement :", error.message);
        res.status(500).json({ error: "Erreur interne." });
    }
});

// --- ROUTE POUR ÉQUIPER UN SKIN (Mise à jour directe sur Minecraft) ---
app.post('/api/inventory/equip', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Accès refusé." });

    const { itemId } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const uuid = decoded.uuid;

        // On récupère les infos du skin (modèle et cible Minecraft)
        const [itemRows] = await pool.query("SELECT categorie, custom_model_data, target_item FROM shop_items WHERE id = ?", [itemId]);
        if (itemRows.length === 0) return res.status(404).json({ error: "Objet inconnu." });
        
        const { categorie, custom_model_data, target_item } = itemRows[0];

        // On déséquipe les autres skins de la même catégorie
        await pool.query(`
            UPDATE player_inventory 
            JOIN shop_items ON player_inventory.item_id = shop_items.id 
            SET player_inventory.is_equipped = FALSE 
            WHERE player_inventory.uuid = ? AND shop_items.categorie = ?
        `, [uuid, categorie]);

        // On équipe le nouveau
        await pool.query(`UPDATE player_inventory SET is_equipped = TRUE WHERE uuid = ? AND item_id = ?`, [uuid, itemId]);

        // 🚀 SYNC EN JEU : On envoie l'ordre en temps réel à Crafty !
        await sendCraftyCommand(decoded.pseudo, target_item, custom_model_data);

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

app.post('/api/shop/buy/item', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Accès refusé." });

    const { itemId } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const uuid = decoded.uuid;

        const [itemRows] = await pool.query("SELECT * FROM shop_items WHERE id = ?", [itemId]);
        if (itemRows.length === 0) return res.status(404).json({ error: "Article introuvable." });
        const item = itemRows[0];

        const [playerRows] = await pool.query("SELECT * FROM players WHERE uuid = ?", [uuid]);
        if (playerRows.length === 0) return res.status(404).json({ error: "Joueur introuvable." });
        const player = playerRows[0];

        if (player.solde < item.prix) return res.status(400).json({ error: "Solde insuffisant !" });

        const nouveauSolde = player.solde - item.prix;
        await pool.query("UPDATE players SET solde = ? WHERE uuid = ?", [nouveauSolde, uuid]);

        if (item.categorie === 'skin_sword') {
            await pool.query("INSERT IGNORE INTO player_inventory (uuid, item_id, is_equipped) VALUES (?, ?, FALSE)", [uuid, item.id]);
            console.log(`🛒 ${player.pseudo} a débloqué le skin : ${item.nom}`);
        } 

        res.json({ success: true, itemName: item.nom, newSolde: nouveauSolde });
    } catch (error) {
        console.error("❌ Erreur achat :", error.message);
        res.status(500).json({ error: "Erreur interne." });
    }
});

app.listen(5000, () => {
    console.log("🚀 Back-end démarré sur http://localhost:5000");
});