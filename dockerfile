# ---------- build stage ----------
FROM node:20-alpine AS build
WORKDIR /app
ENV NODE_ENV=production

# Only copy manifests first to maximize layer cache
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Now copy the rest
COPY . .

# ---------- runtime stage ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    TZ=Africa/Casablanca

# Copy node_modules + app from build
COPY --from=build /app /app

# (Optional) Healthcheck – just verifies Node can start a tiny script
# See Dockerfile & Compose healthcheck refs. :contentReference[oaicite:2]{index=2}
HEALTHCHECK --interval=1m --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "process.exit(0)"

# Run your scheduler/script
CMD ["node", "index.js"]
