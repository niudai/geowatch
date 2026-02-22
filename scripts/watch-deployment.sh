#!/bin/bash

# Vercel Deployment Watcher
# Continuously monitors deployments and auto-fixes common issues

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
MONITOR_LOG="$PROJECT_ROOT/.deployment-monitor.log"
CHECK_INTERVAL=30  # Check every 30 seconds
MAX_CHECKS=360     # Max 3 hours of monitoring

echo "🚀 Vercel Deployment Watcher Started"
echo "   Project: $PROJECT_ROOT"
echo "   Log: $MONITOR_LOG"
echo "   Check interval: ${CHECK_INTERVAL}s"
echo "   Max duration: $((MAX_CHECKS * CHECK_INTERVAL / 60)) minutes"
echo ""

# Function to check and fix deployment
check_deployment() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Checking deployment status..."

  # Get latest deployment
  latest=$(vercel list --prod 2>/dev/null | grep -E "geowatch.*Error" | head -1)

  if [ -z "$latest" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ No failed deployments"
    return 0
  fi

  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  Found failed deployment"
  echo "$latest"

  # Extract deployment URL
  url=$(echo "$latest" | awk '{for(i=1;i<=NF;i++)if($i ~ /^https:/)print $i}' | head -1)

  if [ -z "$url" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Could not extract deployment URL"
    return 1
  fi

  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Analyzing: $url"

  # Get logs
  logs=$(vercel inspect "$url" --logs 2>&1 || true)

  # Check for missing dependencies
  if echo "$logs" | grep -q "Module not found: Can't resolve"; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🔧 Detected missing dependencies"

    # Extract package names
    packages=$(echo "$logs" | grep "Module not found: Can't resolve" | \
               sed "s/.*Can't resolve '\([^']*\)'.*/\1/" | tr '\n' ' ')

    if [ -n "$packages" ]; then
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] Installing: $packages"
      cd "$PROJECT_ROOT"

      # Install packages
      pnpm add $packages || {
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Failed to install packages"
        return 1
      }

      # Commit and push
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] Committing fix..."
      git add pnpm-lock.yaml package.json 2>/dev/null || true

      if git diff --cached --quiet; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] No changes to commit"
      else
        git commit -m "fix: add missing dependencies ($packages)

Auto-fixed by deployment monitor.

Co-Authored-By: Deployment Monitor <monitor@geowatch.local>" || true

        echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🚀 Pushing fix..."
        git push origin main || {
          echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Failed to push"
          return 1
        }

        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Fix pushed, Vercel will auto-deploy"
      fi
    fi

    return 0
  fi

  # Check for env variable errors
  if echo "$logs" | grep -qE "(process\.env|is not defined|ENOENT)"; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  Detected environment variable issue - manual fix required"
    return 1
  fi

  # Generic build error
  if echo "$logs" | grep -q "Build error"; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Build error - manual investigation required"
    return 1
  fi

  return 0
}

# Main monitoring loop
check_count=0
while [ $check_count -lt $MAX_CHECKS ]; do
  check_count=$((check_count + 1))

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Check #$check_count of $MAX_CHECKS"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  check_deployment
  result=$?

  if [ $result -eq 0 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Check complete"
  else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Check failed - manual action may be needed"
  fi

  if [ $check_count -lt $MAX_CHECKS ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Next check in ${CHECK_INTERVAL}s... (Ctrl+C to stop)"
    sleep $CHECK_INTERVAL
  fi
done

echo ""
echo "⏱️  Monitoring timeout reached ($((MAX_CHECKS * CHECK_INTERVAL / 60)) minutes)"
echo "Exiting..."
