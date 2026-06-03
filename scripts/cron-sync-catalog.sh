#!/usr/bin/env sh
# Wrapper local: ejecuta el mismo script que el servicio Railway.
set -eu
ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
exec "$ROOT/services/cron-sync-catalog/sync-catalog.sh"
