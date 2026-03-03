FROM node:22-alpine

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev || npm install

COPY server.js ./
COPY web ./web

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
