FROM node:24-alpine

RUN apk upgrade --no-cache

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

ARG FRONTEND_PORT=3000
EXPOSE ${FRONTEND_PORT}

CMD ["npm", "start"]
