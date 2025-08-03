# 🔐 Secure GitHub CI/CD Setup Guide

## 🚨 FIRST: Revoke the Exposed Token

**IMMEDIATELY** go to: https://github.com/settings/tokens
and **REVOKE** the token starting with `ghp_pLOmwd...`

The token was accidentally exposed in the setup process and must be revoked for security.

## ✅ Secure Setup Process

### Step 1: Your Repository is Ready

Your project is already uploaded to: https://github.com/alexdossoler/webapp

### Step 2: Set Up SSH Keys for Deployment (Secure Method)

```bash
# Generate a new SSH key pair specifically for deployment
ssh-keygen -t ed25519 -C "deploy@webapp-$(date +%Y%m%d)" -f ~/.ssh/webapp-deploy

# This creates:
# ~/.ssh/webapp-deploy (private key - for GitHub secret)
# ~/.ssh/webapp-deploy.pub (public key - for your server)
```

### Step 3: Manually Set GitHub Secrets (Secure)

Go to: https://github.com/alexdossoler/webapp/settings/secrets/actions

Click "New repository secret" for each:

#### Required Secrets:

1. **SSH_PRIVATE_KEY**
   ```bash
   # Copy this content to GitHub secret:
   cat ~/.ssh/webapp-deploy
   ```

2. **SSH_HOST**
   - Your server IP address or hostname
   - Examples: `192.168.1.100`, `myserver.com`, `localhost`

3. **SSH_USER** 
   - SSH username (recommended: `deploy`)

4. **DEPLOY_PATH**
   - Server deployment directory
   - Example: `/home/deploy/webapp`

5. **KNOWN_HOSTS** (optional but recommended)
   ```bash
   # Generate this for your server:
   ssh-keyscan -H YOUR_SERVER_IP_OR_HOSTNAME
   ```

### Step 4: Prepare Your Server

Copy the public key to your server:

```bash
# Method 1: Using ssh-copy-id
ssh-copy-id -i ~/.ssh/webapp-deploy.pub deploy@YOUR_SERVER

# Method 2: Manual (if ssh-copy-id not available)
cat ~/.ssh/webapp-deploy.pub
# Then on your server:
mkdir -p ~/.ssh
echo "PASTE_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

Run the server setup script on your production server:

```bash
# On your server (as root):
curl -fsSL https://raw.githubusercontent.com/alexdossoler/webapp/main/scripts/setup-server.sh | bash
```

### Step 5: Test SSH Connection

```bash
# Test the connection with your new key:
ssh -i ~/.ssh/webapp-deploy deploy@YOUR_SERVER "echo 'Connection successful!'"
```

## 🚀 Ready-to-Use Files Created

### CI/CD Workflow: `.github/workflows/ci-cd.yml`
- ✅ Automated testing and building
- ✅ Secure SSH deployment
- ✅ Blue-green deployment strategy
- ✅ Health checks and rollback capability

### Server Scripts: `scripts/`
- ✅ `setup-server.sh` - Initial server configuration
- ✅ `deploy.sh` - Server-side deployment automation
- ✅ `get-mcp-token.sh` - OAuth automation for MCP integration

### Health Check: `src/app/api/health/route.ts`
- ✅ POST-deployment verification endpoint

## 🎯 Deployment Process

Once secrets are set:

1. **Push to main branch** → Triggers automatic deployment
2. **Monitor in GitHub Actions** → https://github.com/alexdossoler/webapp/actions
3. **Check deployment logs** → Verify successful deployment
4. **Access your app** → Via your server IP/domain

## 🔒 Security Best Practices

### ✅ What We've Done Right:
- Dedicated SSH keys for deployment
- Non-root deployment user
- Secrets stored in GitHub (not in code)
- SSH key authentication (no passwords)
- Proper file permissions

### ⚠️ Security Reminders:
- Never paste tokens/keys in chat
- Rotate deployment keys regularly
- Use environment-specific secrets
- Monitor deployment logs for anomalies
- Keep server packages updated

## 🛠️ Manual Secret Setup Template

Copy this template for manual setup:

```yaml
# GitHub Repository Secrets
SSH_PRIVATE_KEY: |
  -----BEGIN OPENSSH PRIVATE KEY-----
  [paste content from ~/.ssh/webapp-deploy]
  -----END OPENSSH PRIVATE KEY-----

SSH_HOST: YOUR_SERVER_IP_OR_HOSTNAME
SSH_USER: deploy  
DEPLOY_PATH: /home/deploy/webapp
KNOWN_HOSTS: [output from ssh-keyscan -H YOUR_SERVER]
```

## 🧪 Test Your Setup

After setting secrets, you can test with our validation workflow:

```bash
# Copy the test workflow and run it manually in GitHub Actions
cp scripts/test-secrets.yml .github/workflows/
git add .github/workflows/test-secrets.yml
git commit -m "Add secrets validation workflow"
git push
```

Then go to GitHub Actions and manually run "Test GitHub Secrets" workflow.

Your CI/CD pipeline is production-ready with enterprise-grade security practices!
