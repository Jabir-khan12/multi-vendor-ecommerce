#!/bin/bash
# Quick Deployment Script for AstraMarket
# This script helps you push to GitHub and deploy to Vercel

set -e

echo "========================================"
echo "  AstraMarket Deployment Helper"
echo "========================================"
echo ""

# Check if GitHub remote is set
if ! git remote | grep -q origin; then
    echo "❌ No GitHub remote found!"
    echo ""
    echo "📝 Please follow these steps:"
    echo ""
    echo "1. Go to https://github.com/new"
    echo "2. Create a new repository named 'astramarket'"
    echo "3. Do NOT initialize with README"
    echo "4. Then run:"
    echo ""
    echo "   git remote add origin https://github.com/YOUR_USERNAME/astramarket.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo ""
    exit 1
fi

echo "✅ GitHub remote configured"
echo ""
echo "📊 Changes pending push:"
git log origin/master..master --oneline 2>/dev/null || git log HEAD~3..HEAD --oneline

echo ""
echo "🚀 Ready to push? Run:"
echo ""
echo "   git push origin main"
echo ""
echo "Then go to https://vercel.com/new to deploy!"
echo ""
