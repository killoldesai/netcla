FROM node:24-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
FROM base AS dependencies
COPY package*.json ./
RUN npm ci
FROM dependencies AS builder
COPY . .
RUN npm run build
RUN mkdir -p /app/research-specs && cp "research docs/Claude/core-service-sections.csv" "research docs/Claude/hub-and-static-sections.csv" "research docs/Claude/master-icon-prompt.txt" "research docs/Claude/generation-pipeline-prompts.docx" /app/research-specs/
FROM base AS web
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 PERSISTENT_ASSET_DIR=/data/assets PRIVATE_CV_DIR=/data/cvs PAGE_SPEC_SOURCE_DIR=/app/research-specs
RUN groupadd --system app && useradd --system --gid app app
COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static
COPY --from=builder --chown=app:app /app/public ./public
COPY --from=builder --chown=app:app /app/research-specs ./research-specs
RUN mkdir -p /data/assets /data/cvs && chown -R app:app /data
USER app
EXPOSE 3000
CMD ["node","server.js"]
FROM dependencies AS worker
ENV NODE_ENV=production PERSISTENT_ASSET_DIR=/data/assets PRIVATE_CV_DIR=/data/cvs
COPY src ./src
COPY scripts ./scripts
COPY db ./db
COPY tsconfig.json ./
RUN groupadd --system app && useradd --system --gid app app
RUN mkdir -p /data/assets /data/cvs && chown -R app:app /data
USER app
CMD ["node","--import","tsx","src/worker.ts"]
