# Stage 1: Build workspace
FROM oven/bun:1-alpine AS builder
WORKDIR /app

# Copy workspace manifests for caching
COPY package.json bun.lock biome.json tsconfig.base.json tsconfig.json ./
COPY apps/cli/package.json ./apps/cli/
COPY apps/server/package.json ./apps/server/
COPY apps/web/package.json ./apps/web/
COPY packages/domain/package.json ./packages/domain/
COPY packages/infra/package.json ./packages/infra/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source tree and migrations
COPY apps/ ./apps/
COPY packages/ ./packages/
COPY migrations/ ./migrations/

# Stage 2: Production runtime image
FROM oven/bun:1-alpine AS runtime
WORKDIR /app

RUN apk add --no-cache ca-certificates

# Copy node_modules, package manifests, apps, packages, and migrations
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/bun.lock /app/bun.lock
COPY --from=builder /app/tsconfig.base.json /app/tsconfig.base.json
COPY --from=builder /app/tsconfig.json /app/tsconfig.json
COPY --from=builder /app/packages /app/packages
COPY --from=builder /app/apps /app/apps
COPY --from=builder /app/migrations /app/migrations

# CLI entrypoint wrapper
RUN printf '#!/bin/sh\nexec bun run /app/apps/cli/src/main.ts "$@"\n' > /usr/local/bin/kuma && chmod +x /usr/local/bin/kuma

ENV KUMA_SERVER_PORT=8080
ENV KUMA_SERVER_HOST=0.0.0.0

EXPOSE 8080

ENTRYPOINT ["kuma"]
CMD ["server"]
