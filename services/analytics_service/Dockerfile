FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY src ./src

EXPOSE 8000

CMD ["node", "src/server.js"]
