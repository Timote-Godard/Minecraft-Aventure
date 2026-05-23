# Utilise une version légère de Linux avec Node.js
FROM node:22-alpine

# Crée le dossier de travail dans le conteneur
WORKDIR /app

# Copie d'abord les fichiers de configuration (pour aller plus vite)
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie tout le reste du code
COPY . .

# Expose le port 5000 pour que le site puisse lui parler
EXPOSE 5000

# Commande de démarrage
CMD ["node", "server.js"]