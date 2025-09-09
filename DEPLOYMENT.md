# FR-05.1 ChatUI Deployment Guide

This document provides comprehensive deployment instructions for the RAG ChatUI application.

## 🎯 Deployment Overview

The ChatUI application can be deployed in several ways:
- **Development**: Local development server
- **Production**: Standalone Node.js server
- **Docker**: Containerized deployment with optional Nginx
- **Cloud**: Cloud platform deployment (AWS, Google Cloud, Azure)

## 📋 Prerequisites

### System Requirements
- **OS**: Linux, macOS, or Windows
- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher
- **Memory**: Minimum 2GB RAM (4GB+ recommended for production)
- **Storage**: At least 1GB free space
- **Network**: Port 3000 available (or custom port)

### For Docker Deployment
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher

### For Production Deployment
- **SSL Certificate**: For HTTPS (recommended)
- **Domain Name**: For public access
- **Reverse Proxy**: Nginx (recommended)

## 🚀 Step-by-Step Deployment

### 1. Development Deployment

**Step 1.1: Setup Environment**
```bash
cd C:\undertest\FR-02.2\FR-05.1_ChatUI
cp .env.example .env.local
```

**Step 1.2: Configure Environment Variables**
Edit `.env.local`:
```env
# Development Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_ENABLE_FILE_UPLOAD=true
NEXT_PUBLIC_ENABLE_EXPORT=true
NEXT_PUBLIC_ENABLE_SEARCH=true
NEXT_PUBLIC_ENABLE_DARK_MODE=true
```

**Step 1.3: Install and Run**
```bash
npm install
npm run dev
```

**Step 1.4: Verify**
- Open browser to `http://localhost:3000`
- Test login functionality
- Verify WebSocket connection
- Test file upload (if backend supports it)

### 2. Production Deployment (Node.js)

**Step 2.1: Prepare Production Environment**
```bash
# Clone or copy the application files
cd /var/www/rag-chatui
```

**Step 2.2: Configure Production Environment**
Create `.env.local`:
```env
# Production Configuration
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_WS_URL=wss://your-api-domain.com
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_APP_NAME=RAG Chatbot UI
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ALLOWED_FILE_TYPES=.pdf,.doc,.docx,.txt,.md
NEXT_PUBLIC_ENABLE_FILE_UPLOAD=true
NEXT_PUBLIC_ENABLE_EXPORT=true
NEXT_PUBLIC_ENABLE_SEARCH=true
NEXT_PUBLIC_ENABLE_DARK_MODE=true
NEXT_PUBLIC_ENABLE_CSP=true
```

**Step 2.3: Build and Install**
```bash
npm ci --production
npm run build
```

**Step 2.4: Start Production Server**
```bash
# Option 1: Direct start
npm start

# Option 2: Using PM2 (recommended)
npm install -g pm2
pm2 start npm --name "rag-chatui" -- start
pm2 save
pm2 startup
```

**Step 2.5: Configure Reverse Proxy (Nginx)**
Create `/etc/nginx/sites-available/rag-chatui`:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/rag-chatui /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Docker Deployment

**Step 3.1: Prepare Docker Environment**
```bash
cd C:\undertest\FR-02.2\FR-05.1_ChatUI
cp .env.example .env.local
```

**Step 3.2: Configure Docker Environment**
Edit `.env.local` for your environment:
```env
# Docker Production Configuration
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://your-api-host:8000
NEXT_PUBLIC_WS_URL=ws://your-api-host:8000
NEXT_PUBLIC_ENVIRONMENT=docker
# ... other variables
```

**Step 3.3: Build and Deploy**

**Option A: Docker Compose (Recommended)**
```bash
# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Option B: Docker Build**
```bash
# Build image
docker build -t rag-chatui:latest .

# Run container
docker run -d \
  --name rag-chatui \
  -p 3000:3000 \
  --env-file .env.local \
  rag-chatui:latest

# Check status
docker ps

# View logs
docker logs rag-chatui
```

**Step 3.4: SSL Configuration (If using Nginx)**
1. Place SSL certificates in `nginx/ssl/` directory
2. Update `nginx/nginx.conf` with your domain
3. Restart containers:
```bash
docker-compose down
docker-compose up -d
```

### 4. Cloud Platform Deployment

#### AWS Deployment

**Step 4.1: EC2 Instance**
1. Launch EC2 instance (t3.medium or larger recommended)
2. Install Docker and Docker Compose
3. Clone repository and follow Docker deployment steps
4. Configure security groups (ports 80, 443, 3000)
5. Set up Application Load Balancer for high availability

**Step 4.2: ECS/Fargate**
1. Create ECR repository
2. Build and push Docker image
3. Create ECS task definition
4. Deploy using ECS service
5. Configure ALB and Route 53 for domain

#### Google Cloud Deployment

**Step 4.1: Cloud Run**
1. Build container image
2. Push to Google Container Registry
3. Deploy to Cloud Run
4. Configure custom domain and SSL

**Step 4.2: GKE**
1. Create GKE cluster
2. Apply Kubernetes manifests
3. Configure ingress and SSL

#### Azure Deployment

**Step 4.1: Container Instances**
1. Create resource group
2. Deploy container instance
3. Configure networking and DNS

**Step 4.2: App Service**
1. Create App Service plan
2. Deploy from container registry
3. Configure custom domain and SSL

## ⚙️ Configuration Management

### Environment Variables by Environment

**Development (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_ENVIRONMENT=development
```

**Staging (.env.local)**
```env
NEXT_PUBLIC_API_URL=https://api-staging.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api-staging.yourdomain.com
NEXT_PUBLIC_ENVIRONMENT=staging
```

**Production (.env.local)**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_ENABLE_CSP=true
```

### Security Configuration

**Content Security Policy**
Update `next.config.js` for your domains:
```javascript
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' ws: wss: https://your-api-domain.com;
  frame-src 'none';
`;
```

## 📊 Monitoring and Health Checks

### Health Check Endpoints

1. **Application Health**: `GET /api/health`
   ```json
   {
     "status": "healthy",
     "timestamp": "2024-01-01T00:00:00Z",
     "version": "1.0.0"
   }
   ```

2. **Nginx Health**: `GET /health`
   ```
   healthy
   ```

### Monitoring Setup

**Docker Compose with Monitoring**
Add to `docker-compose.yml`:
```yaml
services:
  # ... existing services
  
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

### Log Management

**Docker Logs**
```bash
# View real-time logs
docker-compose logs -f chatui

# View specific number of lines
docker-compose logs --tail=100 chatui

# Export logs
docker-compose logs chatui > chatui.log
```

**Production Logs with PM2**
```bash
# View logs
pm2 logs rag-chatui

# Monitor logs
pm2 monit

# Export logs
pm2 flush  # Clear logs
pm2 logs --lines 1000 > chatui.log
```

## 🚨 Troubleshooting

### Common Deployment Issues

**1. Port Already in Use**
```bash
# Find process using port
lsof -i :3000
# Or on Windows
netstat -ano | findstr :3000

# Kill process
kill -9 <PID>
```

**2. Docker Build Fails**
```bash
# Clear Docker cache
docker system prune -a

# Build without cache
docker build --no-cache -t rag-chatui .
```

**3. WebSocket Connection Issues**
- Check firewall settings
- Verify WebSocket URL in environment variables
- Test WebSocket endpoint directly
- Check proxy configuration

**4. SSL Certificate Issues**
```bash
# Test SSL certificate
openssl s_client -connect yourdomain.com:443

# Check certificate expiry
openssl x509 -in cert.pem -text -noout | grep "Not After"
```

**5. Memory Issues**
```bash
# Check memory usage
docker stats
# Or
free -h

# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=2048" npm start
```

### Performance Optimization

**1. Enable Gzip Compression**
In Nginx configuration:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

**2. Configure Caching**
```nginx
location /_next/static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

**3. Database Connection Pooling**
Configure your backend API with connection pooling for better performance.

## 🔄 Backup and Recovery

### Database Backup (Backend)
```bash
# Regular backups
0 2 * * * /usr/local/bin/backup-script.sh
```

### Application Backup
```bash
# Backup application files
tar -czf chatui-backup-$(date +%Y%m%d).tar.gz /var/www/rag-chatui

# Backup Docker volumes
docker run --rm -v rag-chatui_data:/data -v $(pwd):/backup ubuntu tar czf /backup/data-backup.tar.gz /data
```

### Disaster Recovery
1. Maintain infrastructure as code (Docker Compose, Kubernetes manifests)
2. Automate deployment pipeline
3. Regular testing of backup restoration
4. Document recovery procedures
5. Monitor and alert on failures

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Backend API is running and accessible
- [ ] Database is configured and accessible
- [ ] SSL certificates are ready (for production)
- [ ] Domain DNS is configured
- [ ] Environment variables are set
- [ ] Firewall ports are configured

### Deployment
- [ ] Application builds successfully
- [ ] All environment variables are configured
- [ ] Health checks pass
- [ ] SSL is working (for production)
- [ ] WebSocket connections work
- [ ] File upload functionality works
- [ ] Authentication flows work

### Post-Deployment
- [ ] Monitor application logs
- [ ] Verify all features work end-to-end
- [ ] Check performance metrics
- [ ] Set up automated backups
- [ ] Configure monitoring and alerts
- [ ] Document any custom configurations

## 📞 Support and Maintenance

### Regular Maintenance Tasks
- **Daily**: Check application health and logs
- **Weekly**: Review performance metrics and resource usage
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review and test disaster recovery procedures

### Getting Help
1. Check application logs first
2. Review this deployment guide
3. Verify backend API connectivity
4. Test in development environment
5. Check system resources and dependencies

This deployment guide should provide everything needed to successfully deploy the FR-05.1 ChatUI application in various environments.