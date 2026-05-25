require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise'); // On utilise la version 'promise' pour un code plus moderne
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors({ origin: 'https://minecraft.timote.ovh' }));
app.use(express.json());

// Clé de chiffrage
const JWT_SECRET = process.env.JWT_SECRET

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

// 2. Initialisation des tables
async function initDB() {
    try {
        // Table des joueurs (celle que tu avais déjà)
        await pool.query(`CREATE TABLE IF NOT EXISTS players (
            uuid VARCHAR(255) PRIMARY KEY,
            pseudo VARCHAR(255),
            solde INT DEFAULT 500
        )`);
        
        // NOUVEAU : Le catalogue de la boutique
        await pool.query(`CREATE TABLE IF NOT EXISTS shop_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nom VARCHAR(255),
            description TEXT,
            prix INT,
            categorie VARCHAR(50), 
            custom_model_data INT
        )`);

        // NOUVEAU : Le sac à dos des joueurs (qui possède quoi)
        await pool.query(`CREATE TABLE IF NOT EXISTS player_inventory (
            uuid VARCHAR(255),
            item_id INT,
            is_equipped BOOLEAN DEFAULT FALSE,
            PRIMARY KEY(uuid, item_id),
            FOREIGN KEY(item_id) REFERENCES shop_items(id)
        )`);
        
        // Insertion de test pour les joueurs
        await pool.query(`INSERT IGNORE INTO players (uuid, pseudo, solde) VALUES ('12-abcd', 'TimTeam', 500)`);
        
        // Insertion de ton premier skin dans le catalogue !
        await pool.query(`INSERT IGNORE INTO shop_items (id, nom, description, prix, categorie, custom_model_data) 
            VALUES (1, 'Épée de Feu', 'Une lame incandescente forgée dans le Nether.', 150, 'skin_sword', 1)`);
            
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

            const token = jwt.sign(
                { uuid: playerUuid, pseudo: playerData[0].pseudo },
                JWT_SECRET,
                { expiresIn: '6h' } // Le token s'autodétruit après 6 heures
            );
            
            // 3. On envoie tout ça à React !
            res.json({ 
                success: true,
                token: token,
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

// --- ROUTE POUR VOIR SON SAC À DOS ---
app.get('/api/inventory', async (req, res) => {
    // 1. Vérification du bracelet VIP (Token)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Accès refusé." });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const uuid = decoded.uuid;

        // 2. La requête magique (SQL JOIN) : 
        // On fusionne l'inventaire du joueur avec le catalogue pour avoir le nom et l'image !
        const [rows] = await pool.query(`
            SELECT shop_items.id, shop_items.nom, shop_items.description, shop_items.categorie, shop_items.custom_model_data, player_inventory.is_equipped 
            FROM player_inventory 
            JOIN shop_items ON player_inventory.item_id = shop_items.id 
            WHERE player_inventory.uuid = ?
        `, [uuid]);

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

    if (!token) return res.status(401).json({ error: "Accès refusé." });

    const { itemId } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const uuid = decoded.uuid;

        // On remet l'objet dans le fond du sac à dos (is_equipped = FALSE)
        await pool.query(`
            UPDATE player_inventory 
            SET is_equipped = FALSE 
            WHERE uuid = ? AND item_id = ?
        `, [uuid, itemId]);

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

    if (!token) return res.status(401).json({ error: "Accès refusé." });

    const { itemId } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const uuid = decoded.uuid;

        // 1. On récupère la catégorie de l'objet qu'il veut équiper (ex: 'skin_sword')
        const [itemRows] = await pool.query("SELECT categorie FROM shop_items WHERE id = ?", [itemId]);
        if (itemRows.length === 0) return res.status(404).json({ error: "Objet inconnu." });
        
        const categorie = itemRows[0].categorie;

        // 2. On déséquipe TOUS les objets de cette catégorie pour ce joueur
        // (Pour éviter qu'il ait 2 skins d'épée équipés en même temps)
        await pool.query(`
            UPDATE player_inventory 
            JOIN shop_items ON player_inventory.item_id = shop_items.id 
            SET player_inventory.is_equipped = FALSE 
            WHERE player_inventory.uuid = ? AND shop_items.categorie = ?
        `, [uuid, categorie]);

        // 3. On équipe l'objet choisi
        await pool.query(`
            UPDATE player_inventory 
            SET is_equipped = TRUE 
            WHERE uuid = ? AND item_id = ?
        `, [uuid, itemId]);

        res.json({ success: true, message: "Skin équipé avec succès !" });

        // 🚀 C'est ICI qu'on ajoutera plus tard la commande Crafty pour actualiser le jeu en direct !

    } catch (error) {
        console.error("❌ Erreur équipement :", error.message);
        res.status(500).json({ error: "Erreur interne." });
    }
});

// 1. ROUTE POUR RÉCUPÉRER LE CATALOGUE DE LA BOUTIQUE
app.get('/api/shop/items', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM shop_items");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. ROUTE D'ACHAT GÉNÉRIQUE (SÉCURISÉE PAR JWT)
app.post('/api/shop/buy/item', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Accès refusé. Connecte-toi." });
    }

    const { itemId } = req.body; // React nous envoie juste l'ID de ce que le joueur veut acheter

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const uuid = decoded.uuid;

        // A. On cherche l'item dans le catalogue pour connaître son prix et son nom
        const [itemRows] = await pool.query("SELECT * FROM shop_items WHERE id = ?", [itemId]);
        if (itemRows.length === 0) {
            return res.status(404).json({ error: "Article introuvable dans la boutique." });
        }
        const item = itemRows[0];

        // B. On récupère les informations du joueur (son solde)
        const [playerRows] = await pool.query("SELECT * FROM players WHERE uuid = ?", [uuid]);
        if (playerRows.length === 0) return res.status(404).json({ error: "Joueur introuvable." });
        const player = playerRows[0];

        // C. Vérification de l'argent
        if (player.solde < item.prix) {
            return res.status(400).json({ error: "Solde insuffisant pour acheter cet article !" });
        }

        // D. On débite le joueur
        const nouveauSolde = player.solde - item.prix;
        await pool.query("UPDATE players SET solde = ? WHERE uuid = ?", [nouveauSolde, uuid]);

        // E. APPLICATION DE L'ACHAT SELON LA CATÉGORIE
        if (item.categorie === 'skin_sword') {
            // Si c'est un skin, on l'ajoute dans son inventaire de cosmétiques (son sac à dos web)
            // IGNORE évite les erreurs si le joueur clique deux fois sur un skin qu'il possède déjà
            await pool.query(
                "INSERT IGNORE INTO player_inventory (uuid, item_id, is_equipped) VALUES (?, ?, FALSE)", 
                [uuid, item.id]
            );
            console.log(`🛒 ${player.pseudo} a débloqué le skin : ${item.nom}`);
        } 
        
        // (Plus tard, on pourra ajouter ici un "else if (item.categorie === 'event')" pour Crafty !)

        // On renvoie la réponse positive à React avec le nouveau solde
        res.json({ success: true, itemName: item.nom, newSolde: nouveauSolde });

    } catch (error) {
        console.error("❌ Erreur achat :", error.message);
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(403).json({ error: "Session expirée. Reconnecte-toi." });
        }
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
});

app.listen(5000, () => {
    console.log("🚀 Back-end démarré sur http://localhost:5000");
});