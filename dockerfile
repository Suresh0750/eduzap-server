FROM node:20 AS builder

WORKDIR app/

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

#----PRODUCTION-----for small size image

FROM node:20-alpine

WORKDIR app/

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/server.js"]
