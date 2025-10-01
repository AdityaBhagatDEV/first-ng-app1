# Angular Project Setup Guide
## Replicating the Development Environment

This guide will help you set up the same Angular development environment and CI/CD pipeline on other client laptops.

## Prerequisites

### Required Software
1. **Node.js** (v20.x or later)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **Git**
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

3. **Angular CLI**
   ```bash
   npm install -g @angular/cli
   ```
   - Verify installation: `ng version`

4. **Chrome Browser** (for running tests)
   - Download from: https://www.google.com/chrome/

### Optional but Recommended
- **Visual Studio Code**: https://code.visualstudio.com/
- **Azure CLI**: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

## Project Setup Steps

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd first-ng-app1
```

### 2. Install Dependencies
```bash
npm ci
```

### 3. Verify Setup
```bash
# Run tests
npm test

# Build the application
npm run build

# Start development server
npm start
```

## Testing Setup

### Unit Testing Configuration
The project is configured with comprehensive unit tests:

- **Test Framework**: Jasmine
- **Test Runner**: Karma
- **Coverage**: Istanbul/nyc
- **Browser**: Chrome Headless for CI

### Running Tests
```bash
# Run tests once
npm test -- --watch=false

# Run tests with coverage
npm test -- --watch=false --code-coverage=true

# Run tests in headless Chrome (CI mode)
npm test -- --browsers=ChromeHeadless --watch=false
```

### Test Files Location
- Main test file: `src/app/app.component.spec.ts`
- Test utilities: `src/app/testing/test-helpers.ts`
- Mock services: `src/app/testing/mocks.ts`

## Azure DevOps Pipeline Setup

### 1. Repository Setup
1. Push your code to Azure DevOps repository
2. Navigate to your Azure DevOps project
3. Go to Pipelines > Create Pipeline

### 2. Pipeline Configuration
Choose one of the provided pipeline files:

#### Option A: Full Pipeline (`azure-pipelines.yml`)
- Comprehensive pipeline with all stages
- Includes quality gates and artifact publishing
- Best for production environments

#### Option B: PR Validation Only (`azure-pipelines-pr.yml`)
- Lightweight pipeline for PR validation
- Quick feedback on pull requests
- Minimal resource usage

### 3. Pipeline Setup Steps
1. In Azure DevOps, go to **Pipelines** > **New Pipeline**
2. Select **Azure Repos Git** (or your source)
3. Select your repository
4. Choose **Existing Azure Pipelines YAML file**
5. Select the branch and path to your pipeline file
6. Review and run the pipeline

### 4. Branch Protection Rules
Set up branch protection for main/develop branches:
1. Go to **Repos** > **Branches**
2. Find your main branch > **More options** > **Branch policies**
3. Enable:
   - Require a minimum number of reviewers (2 recommended)
   - Check for linked work items
   - Check for comment resolution
   - **Build validation** - Select your pipeline

### 5. Pipeline Variables (if needed)
Configure these variables in Azure DevOps:
- `nodeVersion`: '20.x'
- `buildConfiguration`: 'production'

## Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push and create PR
git push origin feature/your-feature-name
```

### 2. Pull Request Process
1. Create PR from feature branch to main/develop
2. Pipeline automatically runs validation
3. Address any test failures or linting issues
4. Request code review
5. Merge after approval and successful validation

### 3. Local Development Best Practices
```bash
# Before making changes
git pull origin main
npm ci

# Run tests frequently
npm test

# Check build before committing
npm run build

# Run linting (if configured)
ng lint
```

## Troubleshooting

### Common Issues and Solutions

#### Node Version Mismatch
```bash
# Check Node version
node --version

# If wrong version, use nvm (Node Version Manager)
# Windows: https://github.com/coreybutler/nvm-windows
# macOS/Linux: https://github.com/nvm-sh/nvm

nvm install 20
nvm use 20
```

#### Chrome Not Found Error
```bash
# Set Chrome path (if needed)
export CHROME_BIN=/usr/bin/google-chrome

# Or install Chrome
# Ubuntu/Debian
sudo apt-get install google-chrome-stable

# Windows - Download from Google Chrome website
```

#### Permission Issues
```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm

# Or use npx instead of global installs
npx @angular/cli@latest new my-app
```

#### Pipeline Failures
1. **Test Failures**: Check test output in Azure DevOps logs
2. **Build Failures**: Verify Node version and dependencies
3. **Permission Issues**: Check service connection settings

### Environment-Specific Notes

#### Windows Setup
```powershell
# Set execution policy if needed
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Install Chocolatey (package manager)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Node via Chocolatey
choco install nodejs
```

#### macOS Setup
```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node
brew install node

# Install Angular CLI
npm install -g @angular/cli
```

#### Linux (Ubuntu) Setup
```bash
# Update package index
sudo apt update

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Angular CLI
sudo npm install -g @angular/cli
```

## Security Considerations

### 1. Environment Variables
Never commit sensitive data. Use Azure DevOps variable groups for:
- API keys
- Connection strings
- Service principal credentials

### 2. Package Security
```bash
# Regular security audits
npm audit

# Fix vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated
```

### 3. Access Control
- Use Azure AD integration for pipeline access
- Implement least-privilege access
- Regular review of repository permissions

## Performance Optimization

### 1. Build Optimization
```bash
# Production build with optimization
ng build --configuration=production --aot --build-optimizer

# Bundle analysis
npm install -g webpack-bundle-analyzer
ng build --stats-json
npx webpack-bundle-analyzer dist/first-ng-app1/stats.json
```

### 2. Pipeline Optimization
- Use pipeline caching for `node_modules`
- Parallel job execution where possible
- Minimize pipeline triggers

## Support and Resources

### Documentation Links
- [Angular Documentation](https://angular.io/docs)
- [Azure DevOps Documentation](https://docs.microsoft.com/en-us/azure/devops/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [Karma Test Runner](https://karma-runner.github.io/latest/index.html)

### Internal Contacts
- Development Team Lead: [Your Name]
- DevOps Engineer: [DevOps Contact]
- Project Manager: [PM Contact]

### Quick Reference Commands
```bash
# Project setup
npm ci
ng serve

# Testing
npm test
npm run test:ci  # Headless mode

# Building
npm run build
npm run build:prod

# Code quality
ng lint
npm audit
```

---

## Checklist for New Team Members

- [ ] Install Node.js (v20.x)
- [ ] Install Angular CLI globally
- [ ] Clone repository
- [ ] Run `npm ci`
- [ ] Verify tests pass: `npm test`
- [ ] Verify build works: `npm run build`
- [ ] Access to Azure DevOps project
- [ ] Understanding of branching strategy
- [ ] Familiarity with PR process
- [ ] Setup IDE with recommended extensions

This setup ensures consistency across all development environments and provides a robust CI/CD pipeline for your Angular application.