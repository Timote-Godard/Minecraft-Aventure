FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# On compile le site
RUN npm run build

# On installe 'serve' globalement pour ne plus utiliser npx
RUN npm install -g serve

# On lance le serveur sans poser de questions
CMD ["serve", "-s", "dist", "-l", "5001"]