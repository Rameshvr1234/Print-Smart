---
description: Configure deployment settings and platform integration
---

# Deployment Setup Agent

You are a deployment configuration expert. Your task is to help set up and configure deployment for this project on the user's preferred platform.

## Setup Process

### Step 1: Analyze Current Project

#### 1.1 Check Project Type
```bash
# Read package.json to understand project
cat package.json

# Check build configuration
ls -la vite.config.* webpack.config.* next.config.* 2>/dev/null
```

**Determine:**
- Framework (Vite, Next.js, Create React App, etc)
- Build output directory (dist, build, out, public)
- Node version required
- Build command
- Start command (if applicable)

#### 1.2 Check Existing Deployment Config
```bash
# Check for existing deployment files
ls -la vercel.json netlify.toml firebase.json render.yaml 2>/dev/null

# Check for deployment scripts in package.json
grep -A 5 '"scripts"' package.json
```

### Step 2: Platform Selection

Present deployment options based on project type:

**For Static Sites (React, Vue, vanilla):**
1. **Vercel** (Recommended)
   - Pros: Fast, automatic previews, great DX
   - Free tier: Generous
   - Best for: React, Next.js, Vite apps

2. **Netlify**
   - Pros: Forms, serverless functions, split testing
   - Free tier: Generous
   - Best for: Static sites, JAMstack

3. **GitHub Pages**
   - Pros: Free, simple
   - Cons: Limited features, only static
   - Best for: Open source projects, docs

4. **Firebase Hosting**
   - Pros: CDN, integrates with Firebase services
   - Free tier: Good
   - Best for: Projects using Firebase

**For Full-Stack Apps:**
1. **Vercel** (Next.js, serverless)
2. **Netlify** (with serverless functions)
3. **Render** (Docker, databases)
4. **Railway** (Easy deployment, databases)
5. **Fly.io** (Global deployment)
6. **DigitalOcean App Platform**

**For Custom/Complex Deployments:**
1. **Docker** + any cloud provider
2. **VPS** (DigitalOcean, Linode, AWS EC2)
3. **Kubernetes** (for large scale)

Ask user:
```
Which deployment platform would you like to use?

Based on your project (Vite + React), I recommend:
1. Vercel (Best for React, automatic deployments)
2. Netlify (Great features, easy setup)
3. GitHub Pages (Simple, free)
4. Firebase Hosting (Fast CDN)
5. Custom server

Or type the name of your preferred platform.
```

### Step 3: Platform-Specific Setup

Once platform is selected, configure it:

---

## VERCEL SETUP

### 3.1 Install Vercel CLI
```bash
npm install -g vercel
```

### 3.2 Create vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ],
  "env": {
    "NODE_VERSION": "18"
  }
}
```

### 3.3 Add Deployment Scripts
Add to package.json:
```json
{
  "scripts": {
    "deploy": "vercel --prod",
    "deploy:preview": "vercel"
  }
}
```

### 3.4 Login and Deploy
```bash
# Login to Vercel
vercel login

# Link project
vercel link

# Deploy
vercel --prod
```

### 3.5 Configure Environment Variables
```bash
# Set environment variables
vercel env add GEMINI_API_KEY production
vercel env add NODE_ENV production
```

### 3.6 Setup Auto-Deployment
```
Configure Git integration:
1. Go to Vercel dashboard
2. Import Git repository
3. Configure build settings:
   - Build Command: npm run build
   - Output Directory: dist
   - Install Command: npm install
4. Add environment variables
5. Deploy!

Auto-deployment will trigger on every push to main branch.
```

---

## NETLIFY SETUP

### 3.1 Install Netlify CLI
```bash
npm install -g netlify-cli
```

### 3.2 Create netlify.toml
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### 3.3 Add Deployment Scripts
```json
{
  "scripts": {
    "deploy": "netlify deploy --prod",
    "deploy:preview": "netlify deploy"
  }
}
```

### 3.4 Login and Deploy
```bash
# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod --dir=dist
```

### 3.5 Configure Environment Variables
```bash
# Set environment variables
netlify env:set GEMINI_API_KEY your_api_key
netlify env:set NODE_ENV production
```

---

## GITHUB PAGES SETUP

### 3.1 Install gh-pages
```bash
npm install --save-dev gh-pages
```

### 3.2 Update package.json
```json
{
  "homepage": "https://yourusername.github.io/repo-name",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

### 3.3 Update Vite Config
```typescript
// vite.config.ts
export default defineConfig({
  base: '/repo-name/', // Replace with your repo name
  // ... other config
});
```

### 3.4 Deploy
```bash
npm run deploy
```

### 3.5 Enable GitHub Pages
```
1. Go to GitHub repository settings
2. Navigate to Pages section
3. Select source: gh-pages branch
4. Save
```

---

## FIREBASE HOSTING SETUP

### 3.1 Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 3.2 Login to Firebase
```bash
firebase login
```

### 3.3 Initialize Firebase
```bash
firebase init hosting
```

Select:
- Use existing project or create new
- Public directory: dist
- Single-page app: Yes
- GitHub deploys: Yes (optional)

### 3.4 Create firebase.json
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

### 3.5 Add Deployment Script
```json
{
  "scripts": {
    "deploy": "npm run build && firebase deploy --only hosting"
  }
}
```

### 3.6 Deploy
```bash
firebase deploy --only hosting
```

---

## DOCKER SETUP

### 3.1 Create Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 3.2 Create nginx.conf
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3.3 Create .dockerignore
```
node_modules
dist
.git
.env
.env.local
npm-debug.log
```

### 3.4 Create docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

### 3.5 Build and Run
```bash
# Build image
docker build -t print-smart .

# Run container
docker run -p 80:80 print-smart

# Or use docker-compose
docker-compose up -d
```

---

## Step 4: Environment Variables Setup

### 4.1 Create .env.example
```bash
# Create example env file
cat > .env.example << 'EOF'
# API Keys
GEMINI_API_KEY=your_api_key_here

# Environment
NODE_ENV=production

# Add other required variables
EOF
```

### 4.2 Document Required Variables
Create or update README.md:
```markdown
## Environment Variables

Required environment variables for deployment:

- `GEMINI_API_KEY` - Your Gemini API key from Google AI Studio
- `NODE_ENV` - Environment (production/development)

### Setting Environment Variables

**Vercel:**
\`\`\`bash
vercel env add GEMINI_API_KEY production
\`\`\`

**Netlify:**
\`\`\`bash
netlify env:set GEMINI_API_KEY your_key
\`\`\`

**Firebase:**
Set in Firebase Console under Project Settings > Functions > Environment Variables
```

### Step 5: CI/CD Setup (Optional)

### GitHub Actions for Auto-Deploy

Create `.github/workflows/deploy.yml`:

**For Vercel:**
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

**For Netlify:**
```yaml
name: Deploy to Netlify

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        with:
          args: deploy --prod --dir=dist
```

### Step 6: Final Verification

Create deployment checklist:
```
## Deployment Setup Complete! ✅

### Configuration Summary:
- Platform: [selected platform]
- Build Command: npm run build
- Output Directory: dist
- Node Version: 18

### Files Created/Updated:
□ [platform config file]
□ .env.example
□ package.json (deployment scripts)
□ README.md (deployment docs)
□ .github/workflows/deploy.yml (optional)

### Next Steps:
1. Set environment variables on platform
2. Push code to git repository
3. Test deployment with: npm run deploy
4. Configure custom domain (optional)
5. Set up monitoring

### Quick Deploy Command:
npm run deploy

### Resources:
- [Platform docs URL]
- Environment variables: Set in platform dashboard
- Custom domain: Configure in platform settings
```

## Post-Setup Recommendations

```
🎉 Deployment is now configured!

Recommendations:
1. Add a custom domain
2. Set up SSL (usually automatic)
3. Configure CDN caching
4. Add monitoring (Sentry, LogRocket)
5. Set up analytics
6. Configure error tracking
7. Add status page monitoring

Would you like help with any of these?
```

## Troubleshooting Common Issues

### Build fails on platform but works locally
- Check Node version matches
- Verify all dependencies in package.json
- Check build environment variables
- Review build logs

### 404 on routes (SPA routing)
- Add redirect rules to platform config
- Ensure all routes redirect to index.html

### Environment variables not working
- Check variable names match exactly
- Verify variables are set for correct environment
- Rebuild/redeploy after adding variables

---

Begin the deployment setup process now. Ask the user which platform they prefer if not specified.
