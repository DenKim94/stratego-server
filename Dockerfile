FROM node:24.22.2 AS base

WORKDIR /usr/src/stratego_server

COPY package*.json ./

# Installiere Abhängigkeiten
RUN npm install

# Kopiere den gesmten Quellcode
COPY . .

# Finales Image erstellen
FROM base AS production

EXPOSE 3002

CMD ["node", "src/index.js"]