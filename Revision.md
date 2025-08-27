# CloudVault - Comprehensive Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Features & Functionality](#features--functionality)
4. [Project Structure](#project-structure)
5. [Installation & Setup](#installation--setup)
6. [API Endpoints](#api-endpoints)
7. [State Management](#state-management)
8. [Performance Optimizations](#performance-optimizations)
9. [Security Features](#security-features)
10. [Deployment](#deployment)
11. [Future Enhancements](#future-enhancements)

---

## 🎯 Project Overview

**CloudVault** is a sophisticated cloud storage management application that provides two distinct storage modes:

### **Dual Storage Architecture**
- **Platform Mode**: Managed cloud storage with user authentication
- **Self-Managed Mode**: Direct AWS S3 integration with user credentials

### **Core Purpose**
- Secure file storage and management
- Efficient folder hierarchy navigation
- Advanced search and filtering capabilities
- Real-time storage monitoring
- Multi-tenant architecture support

---

## 🏗️ Architecture & Tech Stack

### **Frontend Technologies**
- **React 18** - Modern UI framework with hooks
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Hot Toast** - User notification system
- **Axios** - HTTP client for API communication

### **Backend Technologies**
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **AWS SDK** - AWS service integration
- **JWT** - JSON Web Token authentication
- **Multer** - File upload handling
- **Archiver** - ZIP file creation

### **Infrastructure**
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **AWS S3** - Object storage service
- **MongoDB Atlas** - Cloud database service

---

## ✨ Features & Functionality

### **File Management**
- **Upload**: Single files, multiple files, entire folders
- **Download**: Individual files and folder ZIPs
- **Rename**: File and folder renaming
- **Delete**: Single and bulk deletion
- **Move**: Drag-and-drop file organization

### **Storage Operations**
- **Hierarchical Navigation**: Folder tree structure
- **Search & Filter**: Real-time file search
- **Storage Monitoring**: Usage tracking and limits
- **File Preview**: Image and document previews
- **Sharing**: Secure file sharing with expiration

### **User Experience**
- **Responsive Design**: Mobile-first approach
- **Dark Theme**: Modern UI with dark mode
- **Drag & Drop**: Intuitive file operations
- **Progress Indicators**: Upload/download progress
- **Error Handling**: Comprehensive error management

---

## 📁 Project Structure

```
CloudVault/
├── backend/                          # Backend server
│   ├── config/                       # Configuration files
│   │   └── db.js                     # Database connection
│   ├── controllers/                   # Business logic
│   │   ├── authController.js         # Authentication logic
│   │   ├── s3Controller.js           # S3 operations
│   │   ├── platforms3Controller.js   # Platform S3 operations
│   │   └── urlShortenerController.js # URL shortening
│   ├── middleware/                    # Express middleware
│   ├── models/                        # Database models
│   │   ├── User.js                   # User schema
│   │   └── ShortUrl.js               # URL schema
│   ├── routes/                        # API endpoints
│   │   ├── auth.js                   # Authentication routes
│   │   ├── s3Routes.js               # S3 operation routes
│   │   └── shortUrlRoutes.js         # URL routes
│   ├── server.js                      # Main server file
│   └── Dockerfile                     # Backend container
├── frontend/                          # React application
│   ├── src/
│   │   ├── components/                # Reusable components
│   │   │   ├── dashboard/             # Self-managed dashboard
│   │   │   ├── Platformdashboard/     # Platform dashboard
│   │   │   └── landing/               # Landing page components
│   │   ├── contexts/                  # React contexts
│   │   │   ├── AuthContext.jsx        # User authentication
│   │   │   └── AwsContext.jsx         # AWS credentials
│   │   ├── pages/                     # Application pages
│   │   │   ├── auth/                  # Login/registration
│   │   │   ├── user/                  # Dashboard pages
│   │   │   └── LandingPage.jsx        # Home page
│   │   ├── utils/                     # Utility functions
│   │   │   └── axiosInstance.js       # HTTP client config
│   │   └── main.jsx                   # Application entry
│   ├── Dockerfile                     # Frontend container
│   └── vite.config.js                 # Vite configuration
├── docker-compose.yaml                # Container orchestration
└── README.md                          # Project documentation
```

---

## 🚀 Installation & Setup

### **Prerequisites**
- Node.js 18+ and npm
- Docker and Docker Compose
- MongoDB instance (local or Atlas)
- AWS account with S3 access

### **Environment Variables**

#### **Backend (.env)**
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/cloudvault
# or
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cloudvault

# JWT
JWT_SECRET=your-super-secret-jwt-key

# AWS S3 (Platform Mode)
PLATFORM_AWS_ACCESS_KEY_ID=your-access-key
PLATFORM_AWS_SECRET_ACCESS_KEY=your-secret-key
PLATFORM_AWS_REGION=us-east-1
PLATFORM_S3_BUCKET=your-platform-bucket

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Storage Limits
STORAGE_CAP_MB=50
```

#### **Frontend (.env)**
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_STORAGE_CAP_MB=50
```

### **Quick Start**
```bash
# Clone repository
git clone https://github.com/yourusername/cloudvault.git
cd cloudvault

# Start with Docker
docker-compose up -d

# Or manual setup
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

---

## 🔌 API Endpoints

### **Authentication Routes**
```javascript
POST /api/auth/register          # User registration
POST /api/auth/login             # User login
POST /api/auth/logout            # User logout
GET  /api/auth/verify            # Token verification
```

### **S3 Operations (Self-Managed)**
```javascript
POST /api/self/s3/list-files     # List files and folders
POST /api/self/s3/upload         # Upload file
POST /api/self/s3/download       # Download file
POST /api/self/s3/delete         # Delete file
POST /api/self/s3/rename         # Rename file/folder
POST /api/self/s3/create-folder  # Create folder
POST /api/self/s3/delete-folder  # Delete folder
POST /api/self/s3/move           # Move files
```

### **S3 Operations (Platform)**
```javascript
POST /api/platform/s3/:userId/list-files     # List user files
POST /api/platform/s3/:userId/upload         # Upload to user space
POST /api/platform/s3/:userId/download       # Download user file
POST /api/platform/s3/:userId/delete         # Delete user file
POST /api/platform/s3/:userId/rename         # Rename user file
POST /api/platform/s3/:userId/create-folder  # Create user folder
```

### **URL Shortener**
```javascript
POST /api/shorten                # Create short URL
GET  /api/:shortId               # Redirect to original URL
```

---

## 🧠 State Management

### **Context Architecture**
```javascript
// Authentication Context
const { user, setUser, logout, mode, setMode } = useAuth();

// AWS Context (Self-Managed)
const { aws, setAws, disconnectAws } = useAws();
```

### **State Flow**
```
User Action → API Call → Response → State Update → UI Re-render
     ↓
Cache Update → Local Storage → Component Update
```

### **Key State Variables**
- **User Authentication**: JWT tokens, user profile
- **AWS Credentials**: Access keys, bucket, region
- **File System**: Current path, file list, cache
- **Storage Usage**: Used space, total limit
- **UI State**: View mode, search, filters

---

## ⚡ Performance Optimizations

### **Caching Strategy**
- **List Caching**: 5-minute cache for folder listings
- **Storage Caching**: Avoid redundant size calculations
- **Thumbnail Optimization**: Lazy loading for media files
- **API Call Reduction**: 60-80% reduction in requests

### **Before vs After**
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| API Calls | 2,000+ | 400-600 | 60-80% |
| Folder Navigation | Slow | Instant | 90%+ |
| Search Performance | Linear | O(k) | 10-100x |

### **Optimization Techniques**
1. **State Updates**: Direct state modification vs API refresh
2. **Conditional Fetching**: Only fetch when necessary
3. **Cache Invalidation**: Smart cache management
4. **Lazy Loading**: On-demand content loading
5. **Batch Operations**: Bulk file operations

---

## 🔒 Security Features

### **Authentication & Authorization**
- **JWT Tokens**: Secure session management
- **Google OAuth**: Third-party authentication
- **Password Hashing**: bcrypt encryption
- **Token Expiration**: Automatic session cleanup

### **Data Protection**
- **HTTPS Only**: Secure communication
- **Input Validation**: XSS and injection prevention
- **File Type Validation**: Malicious file prevention
- **Access Control**: User-specific data isolation

### **AWS Security**
- **IAM Policies**: Least privilege access
- **Presigned URLs**: Temporary access tokens
- **Bucket Policies**: S3 security configuration
- **Credential Rotation**: Regular key updates

---

## 🐳 Deployment

### **Docker Configuration**
```yaml
# docker-compose.yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    depends_on:
      - mongodb
  
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
  
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
```

### **Production Deployment**
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# Environment-specific configs
NODE_ENV=production
MONGODB_URI=production-mongodb-uri
AWS_CREDENTIALS=production-aws-keys
```

---

## 🚀 Future Enhancements

### **Planned Features**
1. **Advanced Search**: Full-text search with Elasticsearch
2. **File Versioning**: Git-like file history
3. **Collaboration**: Real-time file sharing and editing
4. **Mobile App**: React Native mobile application
5. **AI Integration**: Smart file organization and tagging

### **Performance Improvements**
1. **CDN Integration**: Global content delivery
2. **Database Optimization**: Query optimization and indexing
3. **Microservices**: Service-oriented architecture
4. **Caching Layer**: Redis for session and data caching
5. **Load Balancing**: Horizontal scaling support

### **Security Enhancements**
1. **2FA Authentication**: Multi-factor authentication
2. **Audit Logging**: Comprehensive activity tracking
3. **Encryption**: End-to-end file encryption
4. **Compliance**: GDPR, HIPAA, SOC2 compliance
5. **Penetration Testing**: Regular security assessments

---

## 📚 Additional Resources

### **Documentation**
- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

### **External Links**
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [MongoDB Atlas](https://docs.atlas.mongodb.com/)

### **Support**
- **Issues**: [GitHub Issues](https://github.com/yourusername/cloudvault/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/cloudvault/discussions)
- **Wiki**: [Project Wiki](https://github.com/yourusername/cloudvault/wiki)

---

## 🏆 Project Status

### **Current Version**: v1.0.0
### **Last Updated**: December 2024
### **Maintainers**: [Your Name]
### **License**: MIT License

### **Achievements**
- ✅ **MVP Complete**: Core functionality implemented
- ✅ **Performance Optimized**: 60-80% API reduction
- ✅ **Security Hardened**: JWT + OAuth authentication
- ✅ **Production Ready**: Docker deployment support
- ✅ **Documentation**: Comprehensive project docs

---

## 🎯 Quick Revision Checklist

### **Architecture Understanding**
- [ ] Dual storage modes (Platform vs Self-Managed)
- [ ] React + Node.js + MongoDB stack
- [ ] Docker containerization
- [ ] AWS S3 integration

### **Key Features**
- [ ] File upload/download/management
- [ ] Folder hierarchy navigation
- [ ] Search and filtering
- [ ] Storage monitoring
- [ ] User authentication

### **Performance Optimizations**
- [ ] Caching strategies
- [ ] API call reduction
- [ ] State management
- [ ] Lazy loading

### **Security Features**
- [ ] JWT authentication
- [ ] OAuth integration
- [ ] AWS IAM policies
- [ ] Input validation

### **Deployment**
- [ ] Docker setup
- [ ] Environment variables
- [ ] Production configuration
- [ ] Monitoring and logging

---

**🎉 Congratulations! You now have a complete understanding of CloudVault. This README serves as your comprehensive revision guide for the entire project.**