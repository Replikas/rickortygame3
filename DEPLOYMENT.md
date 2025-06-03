# Deployment Guide

This guide will help you deploy the Rick and Morty Dating Simulator to GitHub and various hosting platforms.

## GitHub Setup

### 1. Prepare Your Repository

Make sure all files are ready for GitHub:

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: Rick and Morty Dating Simulator"

# Add your GitHub repository as remote
git remote add origin https://github.com/Replikas/rickortygame2.git

# Push to GitHub
git push -u origin main
```

### 2. Repository Settings

In your GitHub repository settings:

1. Go to **Settings** → **Pages**
2. Enable GitHub Pages if you want a demo site
3. Set source to "GitHub Actions" for custom deployment

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is perfect for this React + Express app:

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect the framework

2. **Build Settings**
   ```
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Environment Variables**
   - No environment variables needed (local storage only)

4. **Deploy**
   - Click "Deploy" and Vercel will handle everything

### Option 2: Netlify

Another excellent option for static site hosting:

1. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Import from Git → GitHub → Select your repository

2. **Build Settings**
   ```
   Build Command: npm run build
   Publish Directory: dist
   ```

3. **Deploy**
   - Click "Deploy site"

### Option 3: Railway

For full-stack deployment with the Express backend:

1. **Connect to Railway**
   - Go to [railway.app](https://railway.app)
   - Create new project from GitHub repository

2. **Configuration**
   - Railway will auto-detect Node.js
   - Start command: `npm run dev`
   - No additional config needed

### Option 4: Render

Free tier option for full-stack deployment:

1. **Create Web Service**
   - Go to [render.com](https://render.com)
   - Create new Web Service from GitHub

2. **Settings**
   ```
   Build Command: npm install && npm run build
   Start Command: npm run dev
   ```

### Option 5: GitHub Pages (Static Only)

For a static version without the Express backend:

1. **Create GitHub Action**
   Create `.github/workflows/deploy.yml`:

   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         
         - name: Setup Node.js
           uses: actions/setup-node@v2
           with:
             node-version: '18'
             
         - name: Install dependencies
           run: npm install
           
         - name: Build
           run: npm run build
           
         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

## Build Commands Reference

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Production Environment Variables

Since this app uses local storage only, no environment variables are required for deployment. Users provide their own AI API keys through the settings interface.

## Domain Configuration

### Custom Domain (Optional)

1. **Purchase a domain** from any registrar
2. **Configure DNS** to point to your hosting provider:
   - Vercel: Add CNAME record pointing to `cname.vercel-dns.com`
   - Netlify: Add CNAME record pointing to your Netlify subdomain
   - Railway: Follow Railway's custom domain guide

3. **SSL Certificate** is automatically provided by all major hosts

## Performance Optimization

### 1. Asset Optimization
The build process automatically optimizes:
- Images are compressed
- JavaScript is minified
- CSS is optimized
- Static assets are cached

### 2. CDN Configuration
Most hosting providers include CDN by default:
- **Vercel**: Global Edge Network
- **Netlify**: Global CDN included
- **Railway**: CDN available

### 3. Caching Strategy
```javascript
// Service worker caching (optional enhancement)
// Cache static assets for 1 year
// Cache API responses for 5 minutes
```

## Monitoring and Analytics

### Error Tracking (Optional)
Add error tracking service:
- Sentry for error monitoring
- LogRocket for user session replay
- Google Analytics for usage analytics

### Performance Monitoring
- Vercel Analytics (built-in for Vercel)
- Web Vitals monitoring
- Lighthouse CI for performance testing

## Security Considerations

### Content Security Policy
Add to your hosting provider's headers:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://openrouter.ai;
```

### HTTPS
All recommended hosting providers include automatic HTTPS certificates.

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (requires 18+)
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Asset Loading Issues**
   - Ensure all assets are in the correct paths
   - Check Vite configuration for asset handling

3. **API Integration**
   - Verify CORS settings if using external APIs
   - Check API key configuration in settings

### Support Resources

- GitHub Issues: Report bugs and get community support
- Documentation: This README and deployment guide
- Hosting Provider Support: Each platform has detailed documentation

## Post-Deployment Checklist

- [ ] Site loads correctly
- [ ] All characters display properly
- [ ] Audio assets work
- [ ] AI integration settings accessible
- [ ] Local storage functioning
- [ ] Terms and privacy page accessible
- [ ] Mobile responsiveness working
- [ ] Error pages display correctly

## Updates and Maintenance

### Updating the Deployment

1. **Make changes** to your local code
2. **Test locally** with `npm run dev`
3. **Commit and push** to GitHub
4. **Automatic deployment** triggers on most platforms

### Version Control
Use semantic versioning:
- `v1.0.0` - Initial release
- `v1.1.0` - New features
- `v1.0.1` - Bug fixes

---

Choose the deployment option that best fits your needs. Vercel and Netlify are recommended for their ease of use and excellent performance.