#!/bin/sh
set -eu

: "${CRON_SECRET:?CRON_SECRET is required}"

if [ -n "${CRON_SYNC_URL:-}" ]; then
  TARGET="${CRON_SYNC_URL}"
elif [ -n "${BETTER_AUTH_URL:-}" ]; then
  TARGET="${BETTER_AUTH_URL%/}/api/cron/sync-catalog"
else
  echo "[cron-sync] ERROR: set CRON_SYNC_URL or BETTER_AUTH_URL" >&2
  exit 1
fi

QUERY=""
if [ -n "${CRON_SYNC_BATCH_SIZE:-}" ]; then
  QUERY="?batch=${CRON_SYNC_BATCH_SIZE}"
fi

echo "[cron-sync] POST ${TARGET}${QUERY}"

curl -fsS -X POST \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  -H "Accept: application/json" \
  "${TARGET}${QUERY}"

echo ""
echo "[cron-sync] done"
