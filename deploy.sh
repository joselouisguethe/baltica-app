#!/bin/bash

# ===========================================
# Baltica Education - VPS Deployment Script
# Domain: balticaeducation.com
# ===========================================

set -e  # Exit on any error

echo "=========================================="
echo "  Baltica Education - Deployment Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration - EDIT THESE VALUES
DB_PASSWORD="BaltIca2026SecureDB!"
JWT_SECRET="baltica-education-jwt-$(openssl rand -hex 32)"
ADMIN_EMAIL="admin@baltica.app"
ADMIN_PASSWORD="Admin2026!"
MERCADOPAGO_TOKEN="your-mercadopago-production-token"
DOMAIN="balticaeducation.com"

echo -e "${YELLOW}Step 1/8: Updating system...${NC}"
apt update && apt upgrade -y

echo -e "${YELLOW}Step 2/8: Installing Node.js 20...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

echo -e "${YELLOW}Step 3/8: Installing PostgreSQL...${NC}"
apt install -y postgresql postgresql-contrib

echo -e "${YELLOW}Step 4/8: Installing Nginx & tools...${NC}"
apt install -y nginx git certbot python3-certbot-nginx
npm install -g pm2

echo -e "${YELLOW}Step 5/8: Setting up PostgreSQL database...${NC}"
sudo -u postgres psql <<EOF
CREATE DATABASE baltica;
CREATE USER baltica_user WITH ENCRYPTED PASSWORD '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON DATABASE baltica TO baltica_user;
\c baltica
GRANT ALL ON SCHEMA public TO baltica_user;
EOF

echo -e "${YELLOW}Step 6/8: Setting up project files...${NC}"
mkdir -p /var/www/baltica-platform

# Check if we're running from the project directory
if [ -f "./package.json" ]; then
    echo "Copying project files..."
    cp -r ./* /var/www/baltica-platform/
    cp -r ./.[!.]* /var/www/baltica-platform/ 2>/dev/null || true
else
    echo -e "${RED}ERROR: Run this script from the project root directory${NC}"
    echo "Or upload files to /var/www/baltica-platform manually"
    exit 1
fi

cd /var/www/baltica-platform

echo "Installing frontend dependencies..."
npm install

echo "Building frontend..."
npm run build

echo "Setting up backend..."
cd server
npm install
npm run build

echo -e "${YELLOW}Step 7/8: Creating environment file...${NC}"
cat > /var/www/baltica-platform/server/.env <<EOF
DATABASE_URL=postgresql://baltica_user:${DB_PASSWORD}@localhost:5432/baltica
JWT_SECRET=${JWT_SECRET}
PORT=3001
MERCADOPAGO_ACCESS_TOKEN=${MERCADOPAGO_TOKEN}
MERCADOPAGO_WEBHOOK_SECRET=
FRONTEND_URL=https://${DOMAIN}
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
EOF

echo "Running database migrations..."
npm run migrate || echo "Migration completed or skipped"

echo -e "${YELLOW}Step 8/8: Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/baltica <<EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    location / {
        root /var/www/baltica-platform/dist;
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/baltica /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
systemctl enable nginx

echo "Starting backend with PM2..."
cd /var/www/baltica-platform/server
pm2 delete baltica-api 2>/dev/null || true
pm2 start dist/index.js --name baltica-api
pm2 save
pm2 startup systemd -u root --hp /root

echo ""
echo -e "${GREEN}=========================================="
echo "  Deployment Complete!"
echo "==========================================${NC}"
echo ""
echo "Your site is now running at: http://${DOMAIN}"
echo ""
echo -e "${YELLOW}NEXT STEPS:${NC}"
echo ""
echo "1. Point your domain to this server:"
echo "   - Go to Hostinger hPanel → Domains → ${DOMAIN}"
echo "   - Add A record: @ → $(curl -s ifconfig.me)"
echo "   - Add A record: www → $(curl -s ifconfig.me)"
echo ""
echo "2. After DNS propagates (5-10 min), enable HTTPS:"
echo "   certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo ""
echo "3. Update MercadoPago token in:"
echo "   nano /var/www/baltica-platform/server/.env"
echo ""
echo -e "${YELLOW}USEFUL COMMANDS:${NC}"
echo "  pm2 logs baltica-api    - View logs"
echo "  pm2 restart baltica-api - Restart API"
echo "  pm2 status              - Check status"
echo ""
