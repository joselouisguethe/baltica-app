#!/bin/bash

# ===========================================
# Baltica Education - Database Backup Script
# Domain: balticaeducation.com
# ===========================================
# Dumps the PostgreSQL database to a .sql file under:
#   /root/backup/database-<YYYY-MM-DD>/baltica-<YYYY-MM-DD_HHMMSS>.sql.gz
#
# Reads DATABASE_URL from server/.env (no hardcoded credentials).
# Safe to run repeatedly (timestamped filenames never overwrite).
#
# Usage:
#   sudo ./backup-db.sh
#
# Restore a backup:
#   gunzip -c /root/backup/database-2026-05-29/baltica-2026-05-29_031500.sql.gz \
#     | psql "$DATABASE_URL"
# ===========================================

set -euo pipefail

# ---------- Colors ----------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ---------- Config ----------
BACKUP_ROOT="/root/backup"
RETENTION_DAYS=14          # delete date-folders older than this (0 = keep forever)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${ENV_FILE:-${SCRIPT_DIR}/server/.env}"

echo "=========================================="
echo "  Baltica Education - Database Backup"
echo "=========================================="

# ---------- Resolve DATABASE_URL ----------
DB_URL="${DATABASE_URL:-}"
if [ -z "${DB_URL}" ]; then
    if [ ! -f "${ENV_FILE}" ]; then
        echo -e "${RED}ERROR: ${ENV_FILE} not found and DATABASE_URL is not set.${NC}"
        echo "Set ENV_FILE=/path/to/server/.env or export DATABASE_URL, then re-run."
        exit 1
    fi
    # Grab the DATABASE_URL line, strip key + optional surrounding quotes.
    DB_URL=$(grep -E '^[[:space:]]*DATABASE_URL=' "${ENV_FILE}" | head -n1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
fi

if [ -z "${DB_URL}" ]; then
    echo -e "${RED}ERROR: DATABASE_URL is empty.${NC}"
    exit 1
fi

# ---------- Check pg_dump ----------
if ! command -v pg_dump >/dev/null 2>&1; then
    echo -e "${RED}ERROR: pg_dump not found. Install it with: sudo apt install -y postgresql-client${NC}"
    exit 1
fi

# ---------- Paths ----------
DATE_DAY=$(date +%F)              # 2026-05-29
STAMP=$(date +%F_%H%M%S)          # 2026-05-29_031500
BACKUP_DIR="${BACKUP_ROOT}/database-${DATE_DAY}"
OUT_FILE="${BACKUP_DIR}/baltica-${STAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

# ---------- Dump ----------
echo -e "${YELLOW}Dumping database to ${OUT_FILE} ...${NC}"
# --no-owner / --no-privileges keeps the dump restorable under any role.
# Pipe straight into gzip so we never write the uncompressed file to disk.
if pg_dump --no-owner --no-privileges "${DB_URL}" | gzip > "${OUT_FILE}"; then
    SIZE=$(du -h "${OUT_FILE}" | cut -f1)
    echo -e "${GREEN}Backup complete: ${OUT_FILE} (${SIZE})${NC}"
else
    echo -e "${RED}ERROR: pg_dump failed. Removing partial file.${NC}"
    rm -f "${OUT_FILE}"
    exit 1
fi

# ---------- Retention ----------
if [ "${RETENTION_DAYS}" -gt 0 ]; then
    echo -e "${YELLOW}Pruning backups older than ${RETENTION_DAYS} days...${NC}"
    find "${BACKUP_ROOT}" -maxdepth 1 -type d -name 'database-*' -mtime "+${RETENTION_DAYS}" -exec rm -rf {} + 2>/dev/null || true
fi

echo ""
echo -e "${GREEN}Done.${NC}"
echo "Latest backup: ${OUT_FILE}"
