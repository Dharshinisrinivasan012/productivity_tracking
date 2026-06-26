# PPMS Deployment Guide

## Overview

Personal Productivity Management System (PPMS) - A full-stack MERN application for managing tasks, habits, study plans, and productivity analytics.

## Prerequisites

- Node.js 18+ 
- MongoDB 6+ (local or MongoDB Atlas)
- Git
- (Optional) OpenAI API key for AI features
- (Optional) SMTP credentials for email notifications
- (Optional) Cloudinary credentials for image uploads

## Environment Variables

### Backend (.env)

```env
NODE_ENV=production
PORT=5000

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ppms

# JWT Secrets (Generate secure random strings)
JWT_ACCESS_SECRET=your-32-character-minimum-secret
JWT_REFRESH_SECRET=your-32-character-minimum-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Client URL
CLIENT_URL=https://your-frontend-domain.vercel.app

# Email (Optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Cloudinary (Optional - for avatars)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OpenAI (Optional - for AI features)
OPENAI_API_KEY=sk-your-openai-api-key
```

### Frontend (.env)

```env
VITE_API_URL=https://your-backend-domain.onrender.com/api
VITE_SOCKET_URL=https://your-backend-domain.onrender.com
```

## Local Development

### 1. Clone Repository

```bash
git clone <repository-url>
cd tracker
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create database user
4. Get connection string
5. Add to .env file

### 4. Configure Environment Variables

Copy example files and fill in values:

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

### 5. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

## Production Deployment

### Backend Deployment (Render)

1. **Prepare Backend**
```bash
cd backend
npm run build
```

2. **Deploy to Render**
   - Create account at https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Root Directory**: `backend`
     - **Build Command**: `npm run build`
     - **Start Command**: `npm start`
     - **Environment Variables**: Add all backend .env variables
   - Deploy

3. **MongoDB Atlas Setup**
   - Ensure your MongoDB Atlas whitelist includes Render's IP ranges
   - Or use 0.0.0.0/0 for development (not recommended for production)

### Frontend Deployment (Vercel)

1. **Prepare Frontend**
```bash
cd frontend
npm run build
```

2. **Deploy to Vercel**
   - Create account at https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure:
     - **Root Directory**: `frontend`
     - **Framework Preset**: Vite
     - **Environment Variables**: Add VITE_API_URL and VITE_SOCKET_URL
   - Deploy

### Docker Deployment (Optional)

1. **Build Images**
```bash
# Backend
docker build -t ppms-backend ./backend

# Frontend
docker build -t ppms-frontend ./frontend
```

2. **Run with Docker Compose**
```bash
docker-compose up -d
```

## CI/CD with GitHub Actions

The project includes GitHub Actions workflows for automated testing and deployment.

### Setup

1. Add secrets to GitHub repository:
   - `MONGODB_URI`
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `OPENAI_API_KEY` (optional)
   - `CLOUDINARY_CLOUD_NAME` (optional)
   - `CLOUDINARY_API_KEY` (optional)
   - `CLOUDINARY_API_SECRET` (optional)

2. Workflows:
   - `.github/workflows/backend.yml` - Backend tests and deployment
   - `.github/workflows/frontend.yml` - Frontend tests and deployment

## Post-Deployment Checklist

- [ ] Backend health check returns success
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] JWT token refresh works
- [ ] Tasks can be created/updated/deleted
- [ ] Habits can be created/tracked
- [ ] Study planner works
- [ ] Dashboard displays real data
- [ ] Analytics charts render
- [ ] Calendar events display
- [ ] Notifications work
- [ ] Settings persist
- [ ] Email notifications work (if configured)
- [ ] AI assistant works (if OpenAI key configured)
- [ ] Mobile responsive design works

## Troubleshooting

### Backend Issues

**MongoDB Connection Failed**
- Check MONGODB_URI is correct
- Verify MongoDB Atlas whitelist includes your server IP
- Check network connectivity

**JWT Token Errors**
- Ensure JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are set
- Secrets must be at least 32 characters
- Check token expiration times

**Port Already in Use**
- Change PORT in .env
- Kill process using the port

### Frontend Issues

**API Connection Failed**
- Check VITE_API_URL is correct
- Verify backend is running
- Check CORS configuration

**Socket.IO Connection Failed**
- Check VITE_SOCKET_URL is correct
- Verify backend Socket.IO is initialized
- Check firewall/network settings

**Build Errors**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (18+ required)

### Database Issues

**Data Not Persisting**
- Verify MongoDB connection is stable
- Check database indexes
- Review model schemas

**Slow Queries**
- Add compound indexes for frequent queries
- Use pagination for large datasets
- Consider caching with Redis

## Security Best Practices

1. **Environment Variables**: Never commit .env files
2. **JWT Secrets**: Use strong, randomly generated secrets
3. **MongoDB**: Use authentication and enable IP whitelisting
4. **HTTPS**: Always use HTTPS in production
5. **Rate Limiting**: Configured in backend (100 req/min, 10 req/min for auth)
6. **Input Validation**: Zod schemas validate all inputs
7. **Password Hashing**: bcrypt with salt rounds
8. **CORS**: Restrict to allowed origins only
9. **Helmet**: Security headers configured
10. **XSS Protection**: Input sanitization enabled

## Monitoring

### Recommended Tools

- **Backend**: Render logs, MongoDB Atlas metrics
- **Frontend**: Vercel analytics
- **Error Tracking**: Sentry (optional)
- **Uptime Monitoring**: UptimeRobot (optional)

### Key Metrics to Monitor

- API response times
- Error rates
- Database query performance
- User activity
- Memory/CPU usage

## Scaling

### Backend Scaling

- **Vertical**: Increase Render instance size
- **Horizontal**: Use load balancer with multiple instances
- **Database**: Use MongoDB Atlas with appropriate tier
- **Caching**: Add Redis for session/cache storage

### Frontend Scaling

- Vercel automatically scales
- Consider CDN for static assets
- Optimize bundle size

## Backup Strategy

- **Database**: MongoDB Atlas automated backups
- **Code**: Git repository
- **Environment**: Store secrets securely (Render/Vercel secrets)

## Support

For issues or questions:
- Check logs in Render/Vercel dashboards
- Review MongoDB Atlas metrics
- Check browser console for frontend errors
- Review this deployment guide

## License

[Your License Here]
