FROM curlimages/curl:8.12.1

WORKDIR /app
COPY sync-catalog.sh /app/sync-catalog.sh
RUN chmod +x /app/sync-catalog.sh

ENTRYPOINT ["/app/sync-catalog.sh"]
