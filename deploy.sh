#!/bin/bash

# Krish Download Wala - Deployment Script
# This script helps you deploy to Vercel quickly

echo "🚀 Krish Download Wala - Deployment Helper"
echo "==========================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Krish Download Wala YouTube Downloader"
    git branch -M main
    echo "✅ Git repository initialized"
    echo ""
    echo "⚠️  Next steps:"
    echo "1. Create a repository on GitHub"
    echo "2. Run: git remote add origin <your-repo-url>"
    echo "3. Run: git push -u origin main"
    echo "4. Import your repository on vercel.com"
else
    echo "✅ Git repository already initialized"
fi

echo ""
echo "📋 Deployment Options:"
echo ""
echo "Option 1 - Vercel CLI (Quick):"
echo "  npm i -g vercel"
echo "  vercel"
echo ""
echo "Option 2 - GitHub + Vercel (Recommended):"
echo "  1. Push code to GitHub"
echo "  2. Visit vercel.com"
echo "  3. Click 'Import Project'"
echo "  4. Select your repository"
echo "  5. Click 'Deploy'"
echo ""
echo "Option 3 - Manual Vercel Dashboard:"
echo "  1. Run: npm run build"
echo "  2. Upload .next folder to Vercel"
echo ""
echo "🎯 Your app will be live at: your-project.vercel.app"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md"
echo ""
