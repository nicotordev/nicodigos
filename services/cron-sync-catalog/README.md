# Cron: sincronizar catálogo Kinguin

Servicio ligero que llama `POST /api/cron/sync-catalog` en la app web.

## Variables (servicio `cron-sync-catalog`)

| Variable | Obligatoria | Ejemplo |
| -------- | ----------- | ------- |
| `CRON_SECRET` | Sí | Mismo valor que en `nicodigos-web` |
| `CRON_SYNC_URL` | Una de dos | `https://tu-app.up.railway.app/api/cron/sync-catalog` |
| `BETTER_AUTH_URL` | Una de dos | Referencia `${{nicodigos-web.BETTER_AUTH_URL}}` (el script añade `/api/cron/sync-catalog`) |
| `CRON_SYNC_BATCH_SIZE` | No | `15` |

## Crear en Railway

1. **New service** → **Empty** → nombre `cron-sync-catalog`
2. **Settings** → **Root Directory**: `/services/cron-sync-catalog`
3. **Variables**:
   - `CRON_SECRET` = `${{nicodigos-web.CRON_SECRET}}` (o el mismo secreto)
   - `BETTER_AUTH_URL` = `${{nicodigos-web.BETTER_AUTH_URL}}`
4. El `railway.toml` de esta carpeta define `cronSchedule = "*/15 * * * *"` (UTC, mínimo 5 min en Railway)
5. Deploy

## CLI

```bash
cd services/cron-sync-catalog
railway link
railway service link cron-sync-catalog
railway variables set CRON_SECRET='${{nicodigos-web.CRON_SECRET}}' BETTER_AUTH_URL='${{nicodigos-web.BETTER_AUTH_URL}}'
railway up --detach
```

## Probar local

```bash
export CRON_SECRET=tu-secreto
export BETTER_AUTH_URL=http://localhost:3000
./sync-catalog.sh
```
