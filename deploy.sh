#!/bin/bash

# WHITEHAT PROTOCOL - Quick Deploy Script

echo "╔══════════════════════════════════════╗"
echo "║  WHITEHAT PROTOCOL                   ║"
echo "║  Deployment Helper                   ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

echo "🔍 Checking current branch..."
CURRENT_BRANCH=$(git branch --show-current)
echo "   Current branch: $CURRENT_BRANCH"
echo ""

# Add all changes
echo "📦 Staging changes..."
git add .

# Commit
echo "💾 Creating commit..."
read -p "Enter commit message (or press Enter for default): " COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Update deployment configuration"
fi

git commit -m "$COMMIT_MSG" || echo "   No changes to commit"
echo ""

# Push
echo "🚀 Pushing to remote..."
git push -u origin $CURRENT_BRANCH

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "NEXT STEPS:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. Go to https://render.com"
    echo "2. Sign in with GitHub"
    echo "3. Click 'New +' > 'Web Service'"
    echo "4. Connect your repository"
    echo "5. Select branch: $CURRENT_BRANCH"
    echo "6. Click 'Create Web Service'"
    echo ""
    echo "Your game will be live in ~5 minutes!"
    echo ""
    echo "📖 For detailed instructions, see DEPLOYMENT.md"
    echo ""
else
    echo ""
    echo "❌ Push failed. Please check your connection and try again."
    exit 1
fi
