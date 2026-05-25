# ⚔️ Aventure Cosmetics - La Bible de l'Infrastructure

Ce document explique le fonctionnement complet du système de cosmétiques synchronisés entre le site web et le serveur Minecraft.

## 🏗️ 1. L'Architecture (Qui fait quoi ?)

Le système repose sur 5 piliers qui communiquent en temps réel :

1. **Frontend (React)** : Le site web (https://minecraft.timote.ovh). Affiche la boutique et l'inventaire. Ne parle qu'au Backend Node.js.
2. **Backend (Node.js - Docker)** : L'API sur le port `5000`. C'est le cerveau. Il valide les tokens JWT, gère l'argent, écrit dans MySQL et envoie des ordres à Crafty.
3. **Base de Données (MySQL - Docker)** : La mémoire sur le port `3306`. Base : `minecraft_db`. Utilisateur : `timote`.
4. **Contrôleur (Crafty)** : L'interface d'administration sur le port `8443`. Reçoit des requêtes HTTP du Backend pour exécuter des commandes Minecraft dans la console en direct.
5. **Serveur Minecraft (Fabric 1.20+)** : Le jeu. Fait tourner le mod `AventureCosmetics`. Il écoute Crafty et lit MySQL pour afficher les illusions (Packet Spoofing).

---

## 🔄 2. Le Chemin d'une Action : Exemple "Équiper une Épée"

Si j'oublie comment la magie opère, voici le trajet exact d'un clic :

1. **Le Joueur clique** sur "Équiper" sur le site web.
2. **Node.js reçoit la requête** sur `/api/inventory/equip`.
3. **Node.js modifie MySQL** : il passe `is_equipped = TRUE` pour cet objet.
4. **Node.js contacte Crafty** via l'API (avec le token HTTPS). Il envoie du texte brut : `skin-update TimTeam minecraft:wooden_sword 1`.
5. **Crafty tape la commande** dans la console Minecraft.
6. **Le Mod Java intercepte la commande** : 
   - Il met à jour la base MySQL côté jeu (`aventure_cosmetics`).
   - Il met à jour la mémoire vive du serveur (RAM).
   - Il force le renvoi de l'inventaire au joueur via réseau.
7. **Le Mixin Java (EquipmentSpoofMixin)** : Juste avant que l'inventaire n'atteigne le client, il intercepte le paquet, voit une épée en bois, et lui colle l'étiquette `CustomModelData: 1`.
8. **Le Joueur voit l'épée s'enflammer** instantanément en jeu.

---

## 🔑 3. Adresses, Ports et Identifiants

* **MySQL** : `iplocalduserveur` (depuis Java). Port `3306`.
* **API Node.js** : `http://localhost:5000`
* **API Crafty** : `https://iplocalduserveur:8443/api/v2/servers/<UUID_DU_SERVEUR>/stdin`
* **Utilisateur MySQL du Mod** : `timote` (Accès restreint à `minecraft_db.*`)

*(Note: Les mots de passe exacts sont stockés localement dans le fichier `.env`).*

---

## 💻 4. Commandes de Secours (Cheat Sheet)

### Relancer le Backend (Node.js) après une modif du .env :
```bash
docker compose up -d --force-recreate minecraft-aventure-backend
# ou (selon la config)
docker restart minecraft-aventure-backend-1


Voir si le Backend Node.js plante (Logs) :
Bash

docker logs minecraft-aventure-backend-1

Se connecter manuellement à MySQL :
Bash

docker exec -it mc-mysql mysql -u root -p
# Pour tester les droits de l'utilisateur du mod :
docker exec -it mc-mysql mysql -u timote -p minecraft_db

Relancer le Runner GitHub (s'il plante au redémarrage) :
Bash

cd ~/actions-runner
sudo ./svc.sh start
# Pour vérifier son statut :
sudo ./svc.sh status

🚨 5. Que faire si ça casse ? (Troubleshooting)

    "L'épée ne s'équipe pas mais l'argent est débité" : Crafty ne reçoit pas la commande. Vérifier l'IP CRAFTY_API_URL dans le .env et relancer Docker.

    "Access denied for user 'timote'@'172.17.0.1'" : Le backend Node.js utilise un ancien mot de passe en cache. Forcer la recréation du conteneur ou vérifier le .env.

    "L'épée reste en feu quand je la jette" : Normal si on est en mode Créatif ! En Créatif, le client impose la réalité au serveur. Toujours tester en mode Survie.

***

Avec ce fichier, peu importe qui reprend le projet, il comprendra tout en moins de 3 minutes. 

Que dirais-tu de créer ton schéma sur Excalidraw, de le sauvegarder en image (`architecture.png`), et