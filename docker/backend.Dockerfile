FROM node:24-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

ARG BACKEND_PORT=8080
EXPOSE ${BACKEND_PORT}

CMD ["node", "--import", "./backend/instrument.js", "backend/server.js"]
