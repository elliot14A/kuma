FROM oven/bun:1-alpine

WORKDIR /app
RUN chown -R bun:bun /app /home/bun

# Remove package managers and unnecessary network binaries
RUN rm -f /sbin/apk /usr/bin/wget 2>/dev/null || true

USER bun:bun
ENV HOME=/home/bun
ENV NODE_ENV=test
