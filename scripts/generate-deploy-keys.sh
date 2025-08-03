#!/usr/bin/env bash
set -e

# Secure SSH Key Generation for Deployment
# This script generates SSH keys specifically for CI/CD deployment

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[INFO] $1${NC}"; }
success() { echo -e "${GREEN}[SUCCESS] $1${NC}"; }
warn() { echo -e "${YELLOW}[WARNING] $1${NC}"; }
error() { echo -e "${RED}[ERROR] $1${NC}"; }

echo -e "${BLUE}🔐 Secure SSH Key Generation for Deployment${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Configuration
KEY_NAME="webapp-deploy"
KEY_PATH="$HOME/.ssh/$KEY_NAME"
COMMENT="deploy@webapp-$(date +%Y%m%d)"

warn "This script will generate SSH keys for secure deployment."
warn "NEVER share or expose these keys in chat or unsecured locations!"
echo ""

# Check if key already exists
if [ -f "$KEY_PATH" ]; then
    warn "SSH key already exists: $KEY_PATH"
    read -rp "Overwrite existing key? (y/N): " OVERWRITE
    if [[ ! "$OVERWRITE" =~ ^[Yy]$ ]]; then
        log "Using existing key"
    else
        rm -f "$KEY_PATH" "$KEY_PATH.pub"
        log "Removed existing key files"
    fi
fi

# Generate new SSH key if needed
if [ ! -f "$KEY_PATH" ]; then
    log "Generating new SSH key pair..."
    ssh-keygen -t ed25519 -C "$COMMENT" -f "$KEY_PATH" -N ""
    success "SSH key pair generated successfully!"
else
    log "Using existing SSH key"
fi

# Set proper permissions
chmod 600 "$KEY_PATH"
chmod 644 "$KEY_PATH.pub"

echo ""
echo -e "${GREEN}✅ SSH Keys Ready for Deployment${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}�� Private Key: ${YELLOW}$KEY_PATH${NC}"
echo -e "${BLUE}🔓 Public Key:  ${YELLOW}$KEY_PATH.pub${NC}"
echo -e "${BLUE}📝 Comment:     ${YELLOW}$COMMENT${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

warn "SECURE SETUP INSTRUCTIONS:"
echo ""
echo "1. 🔐 ADD TO GITHUB SECRETS:"
echo "   Go to: https://github.com/alexdossoler/webapp/settings/secrets/actions"
echo "   Secret name: SSH_PRIVATE_KEY"
echo "   Secret value: Copy the ENTIRE content below:"
echo ""
echo "   ┌─────────────────────────────────────────────────────┐"
echo "   │ COPY THIS TO SSH_PRIVATE_KEY SECRET:                │"
echo "   └─────────────────────────────────────────────────────┘"
cat "$KEY_PATH"
echo "   ┌─────────────────────────────────────────────────────┐"
echo "   │ END OF PRIVATE KEY                                  │"
echo "   └─────────────────────────────────────────────────────┘"
echo ""

echo "2. 📤 ADD TO YOUR SERVER:"
echo "   Copy this public key to your server's authorized_keys:"
echo ""
echo "   ┌─────────────────────────────────────────────────────┐"
echo "   │ PUBLIC KEY FOR SERVER:                              │"
echo "   └─────────────────────────────────────────────────────┘"
cat "$KEY_PATH.pub"
echo "   ┌─────────────────────────────────────────────────────┐"
echo "   │ END OF PUBLIC KEY                                   │"
echo "   └─────────────────────────────────────────────────────┘"
echo ""

echo "3. 🧪 TEST CONNECTION:"
echo "   ssh -i $KEY_PATH deploy@YOUR_SERVER_IP"
echo ""

warn "SECURITY REMINDERS:"
echo "• Never share the private key"
echo "• Keep keys secure and backed up"
echo "• Rotate keys regularly"
echo "• Use different keys for different environments"
echo ""

success "SSH keys generated securely!"
log "Ready for GitHub secrets setup"
