FROM python:3.11-alpine

RUN pip install --no-cache-dir pytest && \
    addgroup -g 1000 -S kuma && \
    adduser -u 1000 -S kuma -G kuma -h /home/kuma

WORKDIR /app
RUN chown -R kuma:kuma /app /home/kuma

# Remove package managers and package installation tools
RUN rm -rf /sbin/apk /usr/local/bin/pip* /usr/bin/wget 2>/dev/null || true

USER kuma:kuma
ENV HOME=/home/kuma
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
