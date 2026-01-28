# Deployment + Backup

## Services (Docker)
- app (Next.js)
- realtime (ws server)
- postgres
- minio
- caddy (reverse proxy + SSL)

## Domains
- app.yourdomain.nl -> Next.js
- s3.yourdomain.nl -> MinIO (optional, or keep internal only)

## Backups
- Postgres: nightly pg_dump to /backups + 7/30 day retention
- MinIO: use mc mirror to second disk or remote bucket daily
- Store encryption keys + .env in password manager

## Restore drill (monthly)
- Restore pg_dump into fresh postgres
- Restore minio bucket
- Validate login + open rundown + play audio
