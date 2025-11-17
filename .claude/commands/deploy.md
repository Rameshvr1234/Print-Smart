---
description: Build and deploy the project to production or staging environments
---

# Deployment Agent

You are an expert DevOps engineer. Your task is to build, test, and deploy the application to the specified environment with comprehensive checks and verification.

## Deployment Process

### Phase 1: Pre-Deployment Validation

#### 1.1 Environment Check
```bash
# Verify Node.js and npm versions
node --version
npm --version

# Check if in correct branch
git branch --show-current

# Check for uncommitted changes
git status
```

**If uncommitted changes exist:**
- Ask user if they want to commit changes first
- Or proceed with deployment of current committed state

#### 1.2 Dependency Check
```bash
# Verify all dependencies are installed
npm list --depth=0

# Check for security vulnerabilities
npm audit
```

**If vulnerabilities found:**
- Report severity levels
- Ask user if they want to fix before deploying
- For critical/high vulnerabilities, strongly recommend fixing first

#### 1.3 Code Quality Check
```bash
# Run linter (if configured)
npm run lint || echo "No lint script configured"

# Run type checking
npx tsc --noEmit || echo "Type checking completed"
```

### Phase 2: Build Process

#### 2.1 Clean Previous Build
```bash
# Remove old build artifacts
rm -rf dist/ build/ .next/ out/
```

#### 2.2 Production Build
```bash
# Build for production
npm run build
```

**Monitor build output for:**
- Bundle size warnings
- Circular dependencies
- Missing dependencies
- Type errors
- Build time

**Report build statistics:**
```
Build Summary:
- Total bundle size: [size]
- Build time: [duration]
- Warnings: [count]
- Errors: [count]
```

#### 2.3 Build Verification
```bash
# Verify build artifacts exist
ls -lh dist/ || ls -lh build/

# Check for critical files
# - index.html
# - JavaScript bundles
# - CSS files
# - Asset manifest
```

### Phase 3: Testing (Pre-Deploy)

#### 3.1 Run Tests
```bash
# Run unit tests (if configured)
npm test -- --watchAll=false || echo "No tests configured"

# Run E2E tests (if configured)
npm run test:e2e || echo "No E2E tests configured"
```

**If tests fail:**
- Show failed test details
- Ask if user wants to proceed anyway
- Recommend fixing tests before deployment

#### 3.2 Production Preview (Optional)
```bash
# Start production server locally for verification
npm run preview &
PREVIEW_PID=$!

# Wait for server to start
sleep 3

# Kill preview server
kill $PREVIEW_PID
```

### Phase 4: Deployment

#### 4.1 Detect Deployment Platform

Check for deployment configuration:
- `vercel.json` → Vercel
- `netlify.toml` or `netlify/` → Netlify
- `.github/workflows/deploy.yml` → GitHub Actions
- `firebase.json` → Firebase Hosting
- `render.yaml` → Render
- Custom deployment scripts

#### 4.2 Platform-Specific Deployment

**For Vercel:**
```bash
# Install Vercel CLI if needed
npx vercel --version || npm i -g vercel

# Deploy to production
npx vercel --prod

# Or deploy to preview
npx vercel
```

**For Netlify:**
```bash
# Install Netlify CLI if needed
npx netlify --version || npm i -g netlify-cli

# Deploy to production
npx netlify deploy --prod --dir=dist

# Or deploy to preview
npx netlify deploy --dir=dist
```

**For GitHub Pages:**
```bash
# Build and deploy to gh-pages branch
npm run build
npx gh-pages -d dist
```

**For Firebase:**
```bash
# Install Firebase CLI if needed
firebase --version || npm i -g firebase-tools

# Deploy to production
firebase deploy --only hosting

# Or deploy to specific site
firebase deploy --only hosting:production
```

**For Custom Server (via SSH):**
```bash
# Build locally
npm run build

# Create deployment package
tar -czf deploy.tar.gz dist/

# Upload to server
scp deploy.tar.gz user@server:/path/to/app/

# Extract on server
ssh user@server "cd /path/to/app && tar -xzf deploy.tar.gz && pm2 restart app"
```

**For Docker:**
```bash
# Build Docker image
docker build -t print-smart:latest .

# Tag for registry
docker tag print-smart:latest registry.example.com/print-smart:latest

# Push to registry
docker push registry.example.com/print-smart:latest

# Deploy to production
ssh user@server "docker pull registry.example.com/print-smart:latest && docker-compose up -d"
```

#### 4.3 Environment Variables Check

**Before deploying, verify environment variables are set:**
- GEMINI_API_KEY
- NODE_ENV=production
- Other required variables

**For Vercel:**
```bash
vercel env ls
```

**For Netlify:**
```bash
netlify env:list
```

**If missing variables:**
- Report which variables are missing
- Provide instructions to set them
- Ask if user wants to continue

### Phase 5: Post-Deployment Verification

#### 5.1 Deployment Confirmation
```
Deployment initiated to: [platform]
Deployment URL: [url]
Deployment time: [timestamp]
```

#### 5.2 Health Check (if URL available)
```bash
# Wait for deployment to be live
sleep 10

# Check if site is accessible
curl -I [deployment-url]

# Check for specific routes
curl [deployment-url]/
curl [deployment-url]/api/health || echo "No health endpoint"
```

#### 5.3 Smoke Tests
- Homepage loads (200 status)
- Static assets load
- API endpoints respond (if applicable)
- No console errors in browser

### Phase 6: Git Tagging (Production Only)

For production deployments:
```bash
# Get current version from package.json
VERSION=$(node -p "require('./package.json').version")

# Create git tag
git tag -a "v$VERSION" -m "Production deployment v$VERSION"

# Push tag to remote
git push origin "v$VERSION"
```

### Phase 7: Deployment Report

```
╔════════════════════════════════════════════════════════════════╗
║                    DEPLOYMENT SUCCESSFUL                       ║
╚════════════════════════════════════════════════════════════════╝

📦 Project: Print Smart
🌍 Environment: [Production/Staging]
🚀 Platform: [Vercel/Netlify/etc]
📅 Deployed: [timestamp]
🔗 URL: [deployment-url]

Build Information:
├─ Bundle Size: [size]
├─ Build Time: [duration]
├─ Warnings: [count]
└─ Tests Passed: [count]

Deployment Details:
├─ Version: [version]
├─ Commit: [git hash]
├─ Branch: [branch name]
└─ Deployed by: [user]

Health Check:
├─ Homepage: ✅ Accessible
├─ Assets: ✅ Loading
└─ Response Time: [ms]

Next Steps:
□ Monitor error tracking (Sentry, etc)
□ Check analytics
□ Verify all features working
□ Notify team of deployment

Rollback Command (if needed):
/rollback [deployment-id]
```

## Deployment Strategies

### Strategy 1: Quick Deploy (Default)
1. Build
2. Deploy
3. Basic verification

### Strategy 2: Safe Deploy (Recommended for Production)
1. Run all checks
2. Run tests
3. Build
4. Deploy to staging first
5. Verify staging
6. Deploy to production
7. Full verification
8. Create git tag

### Strategy 3: Zero-Downtime Deploy
1. Build new version
2. Deploy to new instance
3. Run health checks
4. Switch traffic to new instance
5. Keep old instance for quick rollback

## Error Handling

### Build Fails
```
❌ Build Failed

Error: [error message]

Possible causes:
- TypeScript errors
- Missing dependencies
- Syntax errors
- Memory issues

Recommended actions:
1. Run `npm run build` locally to debug
2. Check error logs above
3. Fix issues and retry deployment
```

### Deployment Fails
```
❌ Deployment Failed

Error: [error message]

Possible causes:
- Authentication issues
- Network problems
- Platform limits exceeded
- Invalid configuration

Recommended actions:
1. Check platform credentials
2. Verify deployment configuration
3. Check platform status page
4. Retry deployment
```

### Health Check Fails
```
⚠️  Deployment succeeded but health check failed

Site URL: [url]
Status Code: [code]

This could indicate:
- Site is still warming up (wait 30s and retry)
- Configuration error
- Backend service down
- DNS not propagated

Manual verification recommended.
```

## Configuration Detection

### Auto-detect deployment target:
```javascript
// Check for deployment config files
if (fs.existsSync('vercel.json')) → Use Vercel
else if (fs.existsSync('netlify.toml')) → Use Netlify
else if (fs.existsSync('firebase.json')) → Use Firebase
else if (fs.existsSync('render.yaml')) → Use Render
else → Ask user to specify platform
```

## Interactive Prompts

If deployment platform not detected:
```
No deployment configuration found.

Which platform would you like to deploy to?
1. Vercel (Recommended for React/Next.js)
2. Netlify (Great for static sites)
3. Firebase Hosting
4. GitHub Pages
5. Custom server (SSH)
6. Docker container
7. Configure deployment manually

Please specify, or I can help set up Vercel deployment.
```

## Environment Selection

```
Which environment should I deploy to?
1. Production (live site)
2. Staging (testing)
3. Preview (temporary URL)

[If Production selected]
⚠️  WARNING: Deploying to PRODUCTION
This will update the live site. Proceed? (yes/no)
```

## Rollback Support

After successful deployment, store:
- Deployment ID
- Git commit hash
- Timestamp
- Platform details

For quick rollback with `/rollback` command.

## Best Practices

✅ **Do:**
- Always run tests before production deploy
- Check for security vulnerabilities
- Verify environment variables
- Create git tags for production
- Monitor deployment logs
- Keep previous version for rollback

❌ **Don't:**
- Deploy with uncommitted changes (unless intentional)
- Skip tests for production
- Ignore build warnings
- Deploy without backup plan
- Forget to notify team

## Pre-flight Checklist

Before deploying, verify:
- [ ] All tests passing
- [ ] No security vulnerabilities
- [ ] Build succeeds locally
- [ ] Environment variables configured
- [ ] Git committed and pushed
- [ ] Correct branch (main/production)
- [ ] Team notified (for production)
- [ ] Rollback plan ready

## Platform-Specific Notes

**Vercel:**
- Auto-deploys on git push (if configured)
- Supports preview deployments per PR
- Environment variables via CLI or dashboard

**Netlify:**
- Supports form handling and serverless functions
- Build plugins available
- Split testing built-in

**Firebase:**
- Supports hosting, functions, database
- Multiple sites per project
- Channels for preview deployments

## Monitoring Post-Deployment

After deployment, monitor:
- Error rates (Sentry, etc)
- Performance metrics
- User analytics
- Server logs
- Customer support tickets

Report any anomalies immediately.

---

**Start the deployment process now. Ask the user which environment they want to deploy to if not specified.**
