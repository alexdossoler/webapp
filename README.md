# Project Intake Form Application

A comprehensive Next.js TypeScript application for collecting and managing project intake requests with a full admin dashboard for lead management.

![Project Intake Form](https://img.shields.io/badge/Next.js-15.4.5-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.13.0-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql)

## ✨ Features

### 🎯 Client-Facing Intake Form
- **7-Step Progressive Form**: Goal → Timeline → Scope → Budget → Contact → Details → Review
- **Real-time Validation**: Instant feedback with user-friendly error messages
- **Auto-save Progress**: Local storage prevents data loss
- **File Upload System**: Drag-and-drop with image processing (resize, compress, EXIF stripping)
- **Budget Range Slider**: Interactive budget selection with preset tiers
- **Feature Tagging**: Dynamic project scope selection
- **Mobile Responsive**: Clean, modern UI inspired by n8n's design principles

### 🎛️ Admin Dashboard
- **Lead Management**: Comprehensive dashboard for viewing and managing all leads
- **Status Tracking**: Visual status pipeline (New → Contacted → Qualified → Proposal → Won/Lost)
- **Lead Scoring**: Automatic scoring based on budget, timeline, and scope
- **Assignment System**: Assign leads to team members
- **Activity History**: Complete audit trail of status changes and notes
- **Statistics**: Real-time dashboard with lead metrics and conversion tracking
- **User Management**: Admin user creation and role management

### 🔒 Authentication & Security
- **JWT Authentication**: Secure token-based auth with HTTP-only cookies
- **Role-based Access**: Admin and user roles with proper authorization
- **Password Hashing**: bcryptjs for secure password storage
- **Protected Routes**: Middleware-based route protection
- **Input Validation**: Comprehensive sanitization and validation

### 💾 Database & API
- **Prisma ORM**: Type-safe database operations with PostgreSQL
- **RESTful APIs**: Clean API design with proper error handling
- **File Processing**: Sharp-based image optimization and storage abstraction
- **Lead Scoring Algorithm**: Intelligent lead qualification scoring
- **Status History**: Complete tracking of lead progression

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone and Install**
   ```bash
   cd your-project-directory
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/intake_db"
   JWT_SECRET="your-super-secure-jwt-secret-change-this"
   MAX_FILE_SIZE=10485760
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

3. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma db push
   
   # Seed with sample data
   npx prisma db seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - **Intake Form**: http://localhost:3000
   - **Admin Dashboard**: http://localhost:3000/admin
   - **Admin Login**: admin@example.com / admin123

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── admin/                # Admin dashboard pages
│   │   ├── leads/[id]/       # Lead detail pages
│   │   ├── login/            # Admin login
│   │   └── page.tsx          # Dashboard home
│   ├── api/                  # API routes
│   │   ├── admin/            # Admin-only endpoints
│   │   ├── auth/             # Authentication
│   │   ├── leads/            # Lead management
│   │   └── project-intake/   # Form submission
│   └── page.tsx              # Main intake form
├── components/               # Reusable React components
│   ├── ProjectIntakeForm.tsx # Main form component
│   ├── BudgetSelector.tsx    # Budget range slider
│   ├── FeatureSelector.tsx   # Feature tagging
│   ├── FileUpload.tsx        # File upload with preview
│   └── ProgressBar.tsx       # Multi-step progress
└── lib/                      # Utilities and services
    ├── auth.ts               # JWT utilities
    ├── file-upload.ts        # File processing service
    ├── prisma.ts             # Database client
    └── withAuth.ts           # Auth middleware

prisma/
├── schema.prisma             # Database schema
└── seed.ts                   # Sample data seeder
```

## 🔧 Configuration

### Database Schema
- **Lead**: Project details, contact info, status, scoring
- **User**: Admin users with role-based access
- **StatusHistory**: Complete audit trail of lead changes

### File Upload
- Max file size: 10MB (configurable)
- Supported formats: Images, PDFs, documents
- Automatic image optimization with Sharp
- Local filesystem or cloud storage (S3-compatible)

### Lead Scoring Algorithm
```typescript
const score = (
  (budgetScore * 0.4) +      // Budget weight: 40%
  (timelineScore * 0.3) +    // Timeline weight: 30%
  (scopeScore * 0.2) +       // Scope complexity: 20%
  (contactScore * 0.1)       // Contact completeness: 10%
);
```

## 🌐 API Endpoints

### Public Endpoints
- `POST /api/project-intake` - Submit intake form
- `GET /api/files/[id]` - Serve uploaded files

### Admin Endpoints
- `POST /api/auth/login` - Admin authentication
- `GET /api/auth/me` - Current user info
- `GET /api/admin/leads` - List leads with filtering
- `PATCH /api/leads/[id]` - Update lead status
- `GET /api/admin/users` - User management

## 🎨 Design System

Built with **Tailwind CSS** following modern design principles:
- **Clean Typography**: Consistent font sizing and spacing
- **Color Palette**: Indigo primary with semantic status colors
- **Interactive Elements**: Hover states and smooth transitions
- **Responsive Grid**: Mobile-first responsive design
- **Accessibility**: ARIA labels, keyboard navigation, semantic HTML

## 🔒 Security Features

- **Input Sanitization**: All user inputs validated and sanitized
- **File Validation**: Type checking and size limits for uploads
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **XSS Prevention**: Proper output encoding
- **CSRF Protection**: HTTP-only cookies with SameSite
- **Rate Limiting**: API endpoint protection (recommended for production)

## 📊 Admin Dashboard Features

### Lead Management
- **Kanban-style Status Board**: Visual pipeline management
- **Advanced Filtering**: By status, date range, score, assignment
- **Bulk Actions**: Mass status updates and assignments
- **Export Functionality**: CSV export for reporting
- **Search**: Full-text search across lead data

### Analytics
- **Conversion Metrics**: Lead-to-customer conversion rates
- **Pipeline Analysis**: Time spent in each stage
- **Source Tracking**: Lead origin and channel analysis
- **Performance Dashboards**: Team and individual metrics

## 🚀 Production Deployment

### Environment Variables
```env
DATABASE_URL="postgresql://prod-db-url"
JWT_SECRET="super-secure-production-secret"
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

### Database Migration
```bash
npx prisma migrate deploy
```

### Build Commands
```bash
npm run build
npm start
```

### Recommended Hosting
- **Vercel**: Seamless Next.js deployment
- **Railway**: Full-stack with PostgreSQL
- **DigitalOcean**: App Platform with managed database
- **AWS**: ECS with RDS

## 🧪 Development

### Adding New Features
1. **Form Steps**: Extend `ProjectIntakeForm.tsx` steps array
2. **API Endpoints**: Add routes in `src/app/api/`
3. **Database Changes**: Update `prisma/schema.prisma` and migrate
4. **Admin Views**: Add pages in `src/app/admin/`

### Testing
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Database testing
npx prisma studio
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🆘 Support

For issues and questions:
- Check the [Issues](link-to-issues) page
- Review the [Documentation](link-to-docs)
- Contact support team

---

**Built with ❤️ using Next.js, TypeScript, Prisma, and Tailwind CSS**
