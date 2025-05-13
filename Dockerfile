# syntax=docker/dockerfile:1.4
# Etapa de build
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Usa los secrets solo durante el build
RUN --mount=type=secret,id=database_url \
    --mount=type=secret,id=jwt_secret \
    export DATABASE_URL=$(cat /run/secrets/database_url) && \
    export SUPABASE_JWT_SECRET=$(cat /run/secrets/jwt_secret) && \
    npx prisma generate && npm run build

# Etapa de producción
FROM node:18-alpine AS production

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/generated ./generated

EXPOSE 3000

CMD ["node", "dist/main.js"]
