FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# On compile le site React (ça crée un dossier 'dist' ultra léger)
RUN npm run build

# On utilise 'serve' pour distribuer les fichiers compilés sur le port 5173
CMD ["npx", "serve", "-s", "dist", "-l", "5173"]