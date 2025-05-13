# Etapa de build
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Verificación explícita de variables de entorno
RUN --mount=type=secret,id=database_url \
    --mount=type=secret,id=jwt_secret \
    --mount=type=secret,id=supabase_url \
    --mount=type=secret,id=supabase_key \
    echo "🔍 Verificando variables de entorno..." && \
    export DATABASE_URL=$(cat /run/secrets/database_url) && \
    export SUPABASE_JWT_SECRET=$(cat /run/secrets/jwt_secret) && \
    export SUPABASE_URL=$(cat /run/secrets/supabase_url) && \
    export SUPABASE_KEY=$(cat /run/secrets/supabase_key) && \
    \
    # Verificar JWT_SECRET \
    if [ -z "$SUPABASE_JWT_SECRET" ]; then \
      echo "ERROR: SUPABASE_JWT_SECRET no está definido o está vacío"; \
      exit 1; \
    else \
      echo "SUPABASE_JWT_SECRET configurado correctamente (longitud: ${#SUPABASE_JWT_SECRET} caracteres)"; \
      echo "   Valor (parcial): ${SUPABASE_JWT_SECRET:0:2}****${SUPABASE_JWT_SECRET: -2}"; \
    fi && \
    \
    # Verificar otras variables \
    echo "🔹 DATABASE_URL: ${DATABASE_URL:0:20}... (longitud: ${#DATABASE_URL})" && \
    echo "🔹 SUPABASE_URL: ${SUPABASE_URL:0:20}..." && \
    echo "🔹 SUPABASE_KEY: ${SUPABASE_KEY:0:2}****${SUPABASE_KEY: -2}" && \
    \
    # Verificar conexión a PostgreSQL \
    echo "Verificando conexión a la base de datos..." && \
    apk add --no-cache postgresql-client && \
    export PGPASSWORD=$(echo $DATABASE_URL | sed -E 's/.*:\/\/[^:]+:([^@]+)@.*/\1/') && \
    DATABASE_URL_NO_QUERY=$(echo $DATABASE_URL | cut -d'?' -f1) && \
    psql "$DATABASE_URL_NO_QUERY" -c '\dt' && echo " Conexión a PostgreSQL exitosa"

# Generar Prisma
RUN npx prisma generate

# Construir aplicación
RUN npm run build

# Etapa de producción
FROM node:18-alpine AS production

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/generated ./generated

# Verificación final en runtime
RUN echo "import { config } from 'dotenv'; config(); \
          if (!process.env.SUPABASE_JWT_SECRET) { \
            console.error('ERROR: SUPABASE_JWT_SECRET no está definido en runtime'); \
            process.exit(1); \
          }" > runtime-check.js

EXPOSE 3000

CMD ["sh", "-c", "node runtime-check.js && node dist/main.js"]
