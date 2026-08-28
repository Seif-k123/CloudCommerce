FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install -g npm@12.0.2 \
    && npm ci --omit=dev

COPY src ./src

EXPOSE 5000

USER node

CMD ["node", "src/server.js"]
