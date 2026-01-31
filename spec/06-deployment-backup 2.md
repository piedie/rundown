# Deployment + Backup

## Environments
- production: app.landstede.live + ws.landstede.live
- staging: staging.app.landstede.live + staging.ws.landstede.live

## Docker Compose (high-level)
- nextjs app
- postgres
- minio (S3)
- websocket server (presence + locks)

## Backups
- Nightly Postgres dump (retain 14 days)
- MinIO bucket replication or daily sync
- Restore procedure documented in ops README (later)

## Health checks
- /api/health (db + storage)
- ws /health
