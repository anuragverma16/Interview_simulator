# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS base

# Java 21 for coding submissions (java-caller); curl for health checks
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    openjdk-21-jdk-headless \
    curl \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV JAVA_HOME=/usr/lib/jvm/default-java
ENV PATH="${JAVA_HOME}/bin:${PATH}"

WORKDIR /app

# --- dependencies (cached layer) ---
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# --- production image ---
FROM base AS runner

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY scripts ./scripts

RUN mkdir -p uploads \
  && chown -R node:node /app

USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
  CMD sh -c 'curl -fsS "http://127.0.0.1:${PORT:-5000}/api/health" || exit 1'

CMD ["node", "src/index.js"]
