# Deploy en Railway

## Requisitos

- Cuenta en [Railway](https://railway.com) y [Railway CLI](https://docs.railway.com/guides/cli) (`railway login`)
- Repositorio Git (recomendado: deploy desde GitHub) o deploy con `railway up`

## 1. Crear proyecto

Desde la raíz del repo:

```bash
railway init --name nicodigos
railway add --database postgres
```

Opcional (caché Kinguin en admin):

```bash
railway add --database redis
```

## 2. Variables de entorno (servicio web)

En el dashboard del servicio **web** → **Variables**, o con CLI:

| Variable                         | Obligatoria | Notas                                                                                        |
| -------------------------------- | ----------- | -------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                   | Sí          | Referencia: `${{Postgres.DATABASE_URL}}` (ajusta el nombre del servicio Postgres si difiere) |
| `BETTER_AUTH_URL`                | Sí          | URL pública HTTPS, ej. `https://nicodigos-production.up.railway.app`                         |
| `BETTER_AUTH_SECRET`             | Sí          | `openssl rand -base64 32`                                                                    |
| `RESEND_API_KEY`                 | Sí          | Emails de auth                                                                               |
| `EMAIL_FROM`                     | Sí          | Ej. `nicodigos <noreply@tudominio.com>`                                                      |
| `ADMIN_EMAILS`                   | Sí          | Correos con acceso admin, separados por coma                                                 |
| `KINGUIN_API_BASE`               | Sí          | Producción o sandbox                                                                         |
| `KINGUIN_API_KEY`                | Sí          |                                                                                              |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Recomendada |                                                                                              |
| `TURNSTILE_SECRET_KEY`           | Recomendada |                                                                                              |
| `REDIS_URL`                      | Opcional    | `${{Redis.REDIS_URL}}` si añadiste Redis                                                     |
| `R2_*`                           | Opcional    | Subida de imágenes                                                                           |
| `OPENAI_API_KEY`                 | Opcional    | Asistencia IA en admin                                                                       |
| `EXCHANGE_RATE_EUR_CLP`          | Opcional    | Respaldo si falla el tipo de cambio                                                          |
| `CRON_SECRET`                    | Recomendada | Cron de sincronización de ofertas/stock                                                      |
| `CRON_SYNC_BATCH_SIZE`           | Opcional    | Productos por ejecución del cron (default 15)                                                |
| `CRON_SYNC_DELAY_MS`             | Opcional    | Delay entre productos en ms (default 200)                                                    |

Ejemplo CLI (sustituye valores):

```bash
railway variables set \
  DATABASE_URL='${{Postgres.DATABASE_URL}}' \
  BETTER_AUTH_URL='https://TU-DOMINIO.up.railway.app' \
  BETTER_AUTH_SECRET='...' \
  RESEND_API_KEY='...'
```

## 3. Dominio público

```bash
railway domain
```

Copia la URL generada y actualiza `BETTER_AUTH_URL` con esa misma URL (con `https://`).

## 4. Deploy

**Desde GitHub (recomendado):** Project → **New** → **GitHub Repo** → conecta el repo. Railway usará `railway.toml` para build, migraciones y healthcheck.

**Desde CLI:**

```bash
railway up --detach
railway logs
```

En cada deploy:

1. `npm run build` → `prisma generate` + `next build`
2. `releaseCommand` → `prisma migrate deploy`
3. `npm run start` → Next.js en el puerto `PORT` de Railway

## 5. Cron — catálogo Kinguin (stock y ofertas)

La app expone `GET` o `POST /api/cron/sync-catalog` (protegido con `CRON_SECRET`).

En cada ejecución procesa un **lote** de productos (los menos sincronizados primero), consulta Kinguin, actualiza ofertas/metadatos y ajusta `qty`:

- Sin ofertas o sin stock → `qty = 0` (agotado)
- Vuelve stock en Kinguin → `qty` se restaura

Variables:

| Variable               | Default | Uso                            |
| ---------------------- | ------- | ------------------------------ |
| `CRON_SECRET`          | —       | Obligatoria para el cron       |
| `CRON_SYNC_BATCH_SIZE` | `15`    | Productos por ejecución        |
| `CRON_SYNC_DELAY_MS`   | `200`   | Pausa entre llamadas a Kinguin |

**Servicio cron en Railway (recomendado):** carpeta `services/cron-sync-catalog` (Docker + `curl`).

1. Nuevo servicio `cron-sync-catalog` → **Root Directory** = `/services/cron-sync-catalog`
2. Variables:
   - `CRON_SECRET` = `${{nicodigos-web.CRON_SECRET}}`
   - `BETTER_AUTH_URL` = `${{nicodigos-web.BETTER_AUTH_URL}}`
3. El `railway.toml` de esa carpeta programa `*/15 * * * *` (UTC)

```bash
cd services/cron-sync-catalog
railway service link cron-sync-catalog
railway variables set \
  CRON_SECRET='${{nicodigos-web.CRON_SECRET}}' \
  BETTER_AUTH_URL='${{nicodigos-web.BETTER_AUTH_URL}}'
railway up --detach
```

Guía: [services/cron-sync-catalog/README.md](../services/cron-sync-catalog/README.md)

Con muchos productos, cada ejecución avanza un lote hasta recorrer todo el catálogo.

Prueba manual (local):

```bash
export CRON_SECRET=tu-secreto BETTER_AUTH_URL=http://localhost:3000
./scripts/cron-sync-catalog.sh
```

## 6. Verificación

- Health: `GET /api/health` → `{"ok":true}`
- Auth: registro / magic link con `BETTER_AUTH_URL` correcto
- Admin: tu email debe estar en `ADMIN_EMAILS`

## Troubleshooting

| Problema              | Solución                                                                               |
| --------------------- | -------------------------------------------------------------------------------------- |
| Build falla en Prisma | Revisa logs; `prisma` está en `dependencies` y `postinstall` ejecuta `prisma generate` |
| Migraciones fallan    | Confirma `DATABASE_URL` y que Postgres esté en el mismo proyecto                       |
| Emails / auth rotos   | `BETTER_AUTH_URL` debe coincidir con el dominio público exacto                         |
| Redis no conecta      | `REDIS_URL` debe incluir host completo (`redis://host:6379`)                           |
