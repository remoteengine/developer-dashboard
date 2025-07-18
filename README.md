# Developer Dashboard API

A robust Node.js REST API for managing developers, recruiters, and job requests with Google OAuth authentication.

## 🚀 Features

- **Authentication & Authorization**
  - Google OAuth 2.0 integration
  - JWT-based stateless authentication
  - Role-based access control (Developer, Recruiter, Admin)

- **Security**
  - Rate limiting
  - Security headers (Helmet)
  - Input validation
  - HTTP Parameter Pollution protection
  - CORS configuration

- **Performance**
  - Response compression
  - Request logging
  - Health checks
  - Clustering support with PM2

- **Development**
  - Hot reloading with Nodemon
  - Code linting with ESLint
  - Code formatting with Prettier
  - Unit and integration testing with Jest

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 6.0
- Redis (optional, for caching)
- Google OAuth 2.0 credentials

## 🛠 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd developer-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Environment Variables**
   Create `.env` file with the following variables:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=3000
   
   # Database
   MONGO_URI=mongodb://localhost:27017/developer-dashboard
   
   # JWT Configuration
   ACCESS_TOKEN_SECRET=your-access-token-secret
   ACCESS_TOKEN_EXPIRES_IN=15m
   REFRESH_TOKEN_SECRET=your-refresh-token-secret
   REFRESH_TOKEN_EXPIRES=7d
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/auth/google/callback
   
   # Session
   SESSION_SECRET=your-session-secret
   
   # Security
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   
   # Logging
   LOG_LEVEL=info
   ```

## 🏃 Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm run prod
```

### Using PM2
```bash
npm run pm2:start
```

### Using Docker
```bash
# Build and run with Docker
npm run docker:build
npm run docker:run

# Or use Docker Compose
npm run docker:compose
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run integration tests only
npm run test:integration
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/auth/google` | Initiate Google OAuth |
| GET | `/api/v1/auth/google/callback` | OAuth callback |
| GET | `/api/v1/auth/success` | Success page with tokens |
| GET | `/api/v1/auth/failed` | Failed login page |
| POST | `/api/v1/auth/refresh-token` | Refresh JWT tokens |
| GET | `/api/v1/auth/logout` | Logout user |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/healthcheck` | Health status |

### Example Request/Response

**Login Success Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "userType": "developer",
      "isVerified": true,
      "loginBy": "google"
    },
    "tokens": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token",
      "tokenType": "Bearer",
      "expiresIn": "15m"
    }
  }
}
```

## 🏗 Project Structure

```
developer-dashboard/
├── src/
│   ├── api/v1/
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Custom middleware
│   │   ├── routes/          # Route definitions
│   │   ├── services/        # Business logic
│   │   └── validators/      # Input validation
│   ├── config/              # Configuration files
│   ├── middleware/          # Global middleware
│   ├── models/              # Database models
│   └── utils/               # Utility functions
├── tests/                   # Test files
├── logs/                    # Log files
├── scripts/                 # Deployment scripts
├── docker-compose.yml       # Docker composition
├── Dockerfile              # Docker configuration
├── ecosystem.config.js     # PM2 configuration
└── package.json            # Dependencies
```

## 🔧 Development Tools

### Code Quality
```bash
# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check

# Security audit
npm run security:audit
npm run security:fix
```

### Database Operations
```bash
# Seed data
npm run db:seed

# Run migrations
npm run db:migrate
```

## 🚀 Deployment

### Using PM2
```bash
# Start application
pm2 start ecosystem.config.js --env production

# Monitor
pm2 monit

# View logs
pm2 logs

# Restart
pm2 restart all
```

### Using Docker
```bash
# Production build
docker build -t developer-dashboard .

# Run container
docker run -p 3000:3000 --env-file .env.prod developer-dashboard
```

### Environment-specific Deployments
```bash
# Local development
npm run lcl

# Production
npm run prd
```

## 📊 Monitoring & Logging

- **Health Checks**: `/api/v1/healthcheck`
- **Logs**: Stored in `logs/` directory
- **Error Tracking**: Winston logger with multiple transports
- **Performance**: Request timing and monitoring

## 🔒 Security Features

- **Rate Limiting**: Prevents abuse and DDoS attacks
- **Security Headers**: Comprehensive security headers via Helmet
- **Input Validation**: Zod schema validation
- **Authentication**: JWT-based stateless authentication
- **Authorization**: Role-based access control
- **CORS**: Configurable cross-origin resource sharing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For support and questions:
- Create an issue in the repository
- Contact: your-email@example.com

## 🎯 Roadmap

- [ ] Add LinkedIn OAuth integration
- [ ] Implement real-time notifications
- [ ] Add advanced search and filtering
- [ ] Implement caching with Redis
- [ ] Add API documentation with Swagger
- [ ] Implement email notifications
- [ ] Add file upload functionality
- [ ] Implement advanced analytics 