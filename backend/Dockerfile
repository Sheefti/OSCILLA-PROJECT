# === Étape 1 : Build ===
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# === Étape 2 : Image finale légère ===
FROM node:20-alpine AS runner

# Sécurité : utilisateur non-root
RUN addgroup -S oscilla && adduser -S oscilla -G oscilla

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY src ./src

USER oscilla

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]