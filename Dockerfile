# Etapa de construcción
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

ARG NODE_ENV=production
ARG DATABASE_URL

ENV NODE_ENV=$NODE_ENV \
    DATABASE_URL=$DATABASE_URL

RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS production

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/generated ./generated

EXPOSE 3000

CMD ["node", "dist/main.js"]
