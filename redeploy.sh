#!/bin/bash

# ===========================================
# Baltica Education - VPS Redeploy Script
# Domain: balticaeducation.com
# ===========================================
# Use this AFTER deploy.sh has been run once.
# It only updates code, rebuilds, and restarts services.
# Does NOT touch: DB, .env, Nginx config, system packages.
# Run from the project root directory on the VPS.
# ===========================================

set -e

echo "=========================================="
echo "  Baltica Education - Redeploy"
echo "=========================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

DEPLOY_PATH="/var/www/baltica-platform"
PM2_APP_NAME="baltica-api"

# ---------- Sanity checks ----------
if [ ! -f "./package.json" ]; then
    echo -e "${RED}ERROR: Run this script from the project root (where package.json lives).${NC}"
    exit 1
fi

if [ ! -d "${DEPLOY_PATH}" ]; then
    echo -e "${RED}ERROR: ${DEPLOY_PATH} does not exist. Run deploy.sh for first-time setup.${NC}"
    exit 1
fi

if [ ! -f "${DEPLOY_PATH}/server/.env" ]; then
    echo -e "${RED}ERROR: ${DEPLOY_PATH}/server/.env not found. Run deploy.sh first.${NC}"
    exit 1
fi

# ---------- Step 1: Backup current build ----------
echo -e "${YELLOW}Step 1/5: Backing up current build...${NC}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/baltica-${TIMESTAMP}"
mkdir -p "${BACKUP_DIR}"
[ -d "${DEPLOY_PATH}/dist" ] && cp -r "${DEPLOY_PATH}/dist" "${BACKUP_DIR}/dist" 2>/dev/null || true
[ -d "${DEPLOY_PATH}/server/dist" ] && cp -r "${DEPLOY_PATH}/server/dist" "${BACKUP_DIR}/server-dist" 2>/dev/null || true
echo "Backup saved to: ${BACKUP_DIR}"

# Keep only the 5 most recent backups
ls -1dt /var/backups/baltica-* 2>/dev/null | tail -n +6 | xargs rm -rf 2>/dev/null || true

# ---------- Step 2: Sync source files ----------
echo -e "${YELLOW}Step 2/5: Syncing source files (preserving .env)...${NC}"

# Safety net: save .env in case rsync glitches
ENV_BACKUP=$(mktemp)
cp "${DEPLOY_PATH}/server/.env" "${ENV_BACKUP}"

if command -v rsync >/dev/null 2>&1; then
    rsync -av --delete \
      --exclude='node_modules' \
      --exclude='dist' \
      --exclude='.env' \
      --exclude='.git' \
      --exclude='server/node_modules' \
      --exclude='server/dist' \
      --exclude='server/.env' \
      ./ "${DEPLOY_PATH}/"
else
    echo "rsync not found, falling back to cp..."
    cp -r ./* "${DEPLOY_PATH}/"
    cp -r ./.[!.]* "${DEPLOY_PATH}/" 2>/dev/null || true
fi

# Restore .env unconditionally
cp "${ENV_BACKUP}" "${DEPLOY_PATH}/server/.env"
rm -f "${ENV_BACKUP}"

cd "${DEPLOY_PATH}"

# ---------- Step 3: Frontend deps + build ----------
echo -e "${YELLOW}Step 3/5: Installing frontend deps + building...${NC}"
if [ -f "package-lock.json" ]; then
    npm ci --no-audit --no-fund
else
    npm install --no-audit --no-fund
fi
npm run build

# ---------- Step 4: Backend deps + build ----------
echo -e "${YELLOW}Step 4/5: Installing backend deps + building...${NC}"
cd server
if [ -f "package-lock.json" ]; then
    npm ci --no-audit --no-fund
else
    npm install --no-audit --no-fund
fi
npm run build
cd ..

# ---------- Step 5: Restart services ----------
echo -e "${YELLOW}Step 5/5: Restarting services...${NC}"

# Zero-downtime reload if PM2 process exists, otherwise start it
if pm2 list | grep -q "${PM2_APP_NAME}"; then
    pm2 reload "${PM2_APP_NAME}"
else
    pm2 start "${DEPLOY_PATH}/server/dist/index.js" --name "${PM2_APP_NAME}"
fi
pm2 save

# Reload Nginx (graceful, no dropped connections)
nginx -t && systemctl reload nginx

# ---------- Done ----------
echo ""
echo -e "${GREEN}=========================================="
echo "  Redeploy Complete!"
echo "==========================================${NC}"
echo ""
echo "Site: https://balticaeducation.com"
echo ""
echo -e "${YELLOW}Verify:${NC}"
echo "  pm2 status"
echo "  pm2 logs ${PM2_APP_NAME} --lines 50"
echo ""
echo -e "${YELLOW}Rollback (if needed):${NC}"
echo "  rm -rf ${DEPLOY_PATH}/dist ${DEPLOY_PATH}/server/dist"
echo "  cp -r ${BACKUP_DIR}/dist ${DEPLOY_PATH}/dist"
echo "  cp -r ${BACKUP_DIR}/server-dist ${DEPLOY_PATH}/server/dist"
echo "  pm2 restart ${PM2_APP_NAME}"
echo "  systemctl reload nginx"
echo ""
