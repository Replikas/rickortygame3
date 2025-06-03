# Render Deployment Guide

This guide covers deploying the Rick and Morty Dating Simulator to Render with continuous uptime using the ping service.

## Quick Deployment Steps

### 1. Deploy to Render

1. **Connect Repository**
   - Go to [render.com](https://render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository: `https://github.com/Replikas/rickortygame2`

2. **Configure Service**
   ```
   Name: rickortygame2
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm run dev
   Plan: Free
   ```

3. **Environment Variables** (Optional)
   ```
   NODE_ENV=production
   PORT=5000
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy from your main branch

### 2. Setup Continuous Uptime

After deployment, you'll get a URL like: `https://rickortygame2.onrender.com`

#### Option A: Run Ping Service Locally

1. **Update ping service with your URL**
   ```bash
   node ping-service.js https://your-app-name.onrender.com
   ```

2. **Run continuously** (Linux/Mac)
   ```bash
   nohup node ping-service.js https://your-app-name.onrender.com &
   ```

3. **Run continuously** (Windows)
   ```cmd
   start /B node ping-service.js https://your-app-name.onrender.com
   ```

#### Option B: Use GitHub Actions (Recommended)

Create `.github/workflows/ping.yml`:

```yaml
name: Keep Render App Alive

on:
  schedule:
    # Ping every 14 minutes
    - cron: '*/14 * * * *'
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Render App
        run: |
          curl -f https://your-app-name.onrender.com/health || exit 1
          echo "✅ App is alive at $(date)"
```

#### Option C: Use External Service

1. **UptimeRobot** (Free tier)
   - Add your Render URL: `https://your-app-name.onrender.com`
   - Set monitoring interval to 5 minutes

2. **Pingdom** 
   - Monitor your `/health` endpoint
   - Set check interval to 10 minutes

3. **StatusCake**
   - Free monitoring with 5-minute intervals

## Render Configuration Details

### render.yaml Breakdown

```yaml
services:
  - type: web
    name: rickortygame2              # Your service name
    env: node                        # Node.js environment
    plan: free                       # Free tier (750 hours/month)
    buildCommand: npm install && npm run build
    startCommand: npm run dev        # Start your Express server
    healthCheckPath: /health         # Health check endpoint
    autoDeploy: true                 # Auto-deploy on git push
    branch: main                     # Deploy from main branch
```

### Health Check Endpoints

Your app includes these endpoints for monitoring:

- `GET /` - Basic status check
- `GET /health` - Detailed health information

Example responses:
```json
// GET /
{
  "status": "ok",
  "message": "Rick and Morty Dating Simulator is running!",
  "timestamp": "2024-01-15T10:30:00.000Z"
}

// GET /health
{
  "status": "healthy",
  "uptime": 3600,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Preventing Sleep

Render free tier apps sleep after 15 minutes of inactivity. Here's how to prevent it:

### Ping Service Features

- **Smart Timing**: Pings every 14 minutes (just before sleep)
- **Health Monitoring**: Checks `/health` endpoint every 5 minutes
- **Retry Logic**: 3 attempts with 30-second delays
- **Status Reporting**: Hourly uptime reports
- **Graceful Shutdown**: Handles process signals

### Running the Ping Service

```bash
# Basic usage
node ping-service.js https://your-app-name.onrender.com

# With environment variable
export RENDER_URL=https://your-app-name.onrender.com
node ping-service.js

# Background process (Linux/Mac)
nohup node ping-service.js https://your-app-name.onrender.com > ping.log 2>&1 &

# View logs
tail -f ping.log
```

### Service Output Example

```
🚀 Starting Render Ping Service
📍 Target URL: https://rickortygame2.onrender.com
⏱️ Ping interval: 14 minutes
🔍 Health check interval: 5 minutes
🏓 Pinging https://rickortygame2.onrender.com...
✅ Ping #1 successful - Status: 200
📊 Uptime: 0h 1m
💚 Health check OK - App uptime: 3600s
```

## Custom Domain (Optional)

1. **Purchase Domain** from any registrar
2. **Add Custom Domain** in Render dashboard
3. **Update DNS** with CNAME record:
   ```
   CNAME: your-domain.com → your-app-name.onrender.com
   ```
4. **SSL Certificate** is automatically provided

## Performance Optimization

### Render Free Tier Limits
- **CPU**: Shared CPU
- **RAM**: 512MB
- **Bandwidth**: 100GB/month
- **Sleep**: After 15 minutes of inactivity
- **Build Time**: 20 minutes max

### Optimization Tips

1. **Asset Optimization**
   - Images are compressed during build
   - JS/CSS is minified automatically

2. **Caching**
   - Static assets cached for 1 year
   - API responses use appropriate cache headers

3. **Build Performance**
   ```json
   // package.json
   "scripts": {
     "build": "vite build --mode production",
     "build:fast": "vite build --mode development"
   }
   ```

## Monitoring and Logs

### Render Dashboard
- **Metrics**: CPU, memory, response times
- **Logs**: Real-time application logs
- **Events**: Deployment and service events

### Log Access
```bash
# View recent logs
render logs --service-id=your-service-id

# Follow logs in real-time
render logs --service-id=your-service-id --follow
```

### Custom Monitoring
Add to your application:
```javascript
// Simple metrics endpoint
app.get('/metrics', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    timestamp: new Date().toISOString()
  });
});
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check Node.js version
   node --version  # Should be 18+
   
   # Clear npm cache
   npm cache clean --force
   ```

2. **App Won't Start**
   - Check start command in render.yaml
   - Verify PORT environment variable
   - Review application logs

3. **Frequent Sleeping**
   - Ensure ping service is running
   - Check ping interval (should be < 15 minutes)
   - Verify health check endpoint works

4. **High Response Times**
   - App may be sleeping (cold start takes ~10-30 seconds)
   - Consider upgrading to paid plan
   - Optimize application startup time

### Debug Commands
```bash
# Test health endpoint locally
curl https://your-app-name.onrender.com/health

# Test with verbose output
curl -v https://your-app-name.onrender.com

# Check response time
curl -w "@curl-format.txt" https://your-app-name.onrender.com
```

### Support Resources
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- [GitHub Issues](https://github.com/Replikas/rickortygame2/issues)

## Cost Considerations

### Free Tier
- **Cost**: $0/month
- **Limits**: 750 hours/month, sleeps after 15 min
- **Best for**: Development, testing, low-traffic apps

### Paid Plans
- **Starter**: $7/month
- **Benefits**: No sleeping, custom domains, more resources
- **Recommended for**: Production apps with regular traffic

## Security

### HTTPS
- Automatically enabled for all Render apps
- Custom domains get free SSL certificates

### Environment Variables
- Store sensitive data as environment variables
- Never commit API keys to repository

### CORS Configuration
```javascript
// Already configured in your app
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:5000']
}));
```

## Updates and Maintenance

### Auto-Deployment
- Pushes to main branch trigger automatic deployment
- No manual intervention required

### Manual Deployment
```bash
# Trigger deployment via Render dashboard
# Or use Render CLI
render deploy --service-id=your-service-id
```

### Rollback
- Use Render dashboard to rollback to previous deployment
- Keep git history clean for easy rollbacks

---

Your Rick and Morty Dating Simulator is now ready for production deployment on Render with continuous uptime!