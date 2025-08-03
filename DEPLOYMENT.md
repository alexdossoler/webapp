# Deployment Guide - Project Intake Form v2

## 🚀 Quick Deploy Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL (production) or SQLite (development)
- Domain/hosting service

### 1. Setup Environment
```bash
# Extract archive
unzip project-intake-form-v2.zip
cd "WebApp intake"

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your production values
```

### 2. Database Setup

#### For SQLite (Development/Testing)
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

#### For PostgreSQL (Production)
```bash
# Update .env with PostgreSQL URL
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Update prisma/schema.prisma
# Change provider from "sqlite" to "postgresql"

npx prisma generate
npx prisma db push
npx prisma db seed
```

### 3. Build & Deploy
```bash
npm run build
npm start
```

## 🔐 Default Admin Account
- **Email**: admin@example.com
- **Password**: admin123
- **⚠️ Change immediately in production!**

## 📦 Archive Contents
- Complete Next.js application with admin dashboard
- Database schema & seed data with sample leads
- Authentication system with JWT tokens
- File upload processing with Sharp
- Mobile-responsive design with Tailwind CSS
- Production configurations and documentation

Ready to deploy! 🎉
