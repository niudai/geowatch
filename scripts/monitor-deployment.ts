#!/usr/bin/env node
/**
 * Vercel Deployment Monitor & Auto-Fixer
 *
 * Monitors Vercel deployments and automatically:
 * 1. Detects build failures
 * 2. Analyzes error logs
 * 3. Fixes common issues (missing deps, env vars, etc.)
 * 4. Triggers redeploy
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface DeploymentInfo {
  url: string;
  status: string;
  age: string;
  duration: string;
}

interface ErrorAnalysis {
  type: 'missing_dependency' | 'env_variable' | 'build_error' | 'unknown';
  packages?: string[];
  message: string;
  canAutoFix: boolean;
  fixCommand?: string;
}

const REPO_ROOT = path.join(__dirname, '..');
const LOG_FILE = path.join(REPO_ROOT, '.deployment-monitor.log');
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

class DeploymentMonitor {
  private retryCount = 0;
  private lastCheckedDeployment = '';

  /**
   * Get latest deployment info from Vercel
   */
  getLatestDeployment(): DeploymentInfo | null {
    try {
      const output = execSync('vercel list --prod 2>&1', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      const lines = output.split('\n');
      const deploymentLine = lines.find((l) =>
        l.includes('https://geowatch') && l.includes('Error')
      );

      if (!deploymentLine) {
        return null;
      }

      const parts = deploymentLine.trim().split(/\s+/);
      return {
        url: parts.find((p) => p.startsWith('https://'))!,
        status: 'Error',
        age: parts[0],
        duration: parts[parts.length - 2],
      };
    } catch (error) {
      console.error('Failed to get deployment list:', error);
      return null;
    }
  }

  /**
   * Fetch deployment logs and analyze errors
   */
  analyzeDeploymentError(deploymentUrl: string): ErrorAnalysis {
    try {
      const logs = execSync(`vercel inspect ${deploymentUrl} --logs 2>&1`, {
        encoding: 'utf-8',
        cwd: REPO_ROOT,
      });

      // Check for missing dependencies
      const missingDepMatch = logs.match(
        /Module not found: Can't resolve '([^']+)'/g
      );
      if (missingDepMatch) {
        const packages = missingDepMatch
          .map((m) => m.match(/'([^']+)'/)?.[1])
          .filter(Boolean) as string[];

        return {
          type: 'missing_dependency',
          packages,
          message: `Missing dependencies: ${packages.join(', ')}`,
          canAutoFix: true,
          fixCommand: `pnpm add ${packages.join(' ')}`,
        };
      }

      // Check for missing environment variables
      if (logs.includes('process.env') || logs.includes('is not defined')) {
        return {
          type: 'env_variable',
          message: 'Missing environment variables',
          canAutoFix: false,
          fixCommand: 'Set environment variables in Vercel dashboard',
        };
      }

      // Check for build errors
      if (logs.includes('Build error occurred') || logs.includes('failed')) {
        return {
          type: 'build_error',
          message: 'Build compilation failed',
          canAutoFix: false,
        };
      }

      return {
        type: 'unknown',
        message: 'Unknown deployment error',
        canAutoFix: false,
      };
    } catch (error) {
      console.error('Failed to analyze deployment:', error);
      return {
        type: 'unknown',
        message: 'Failed to analyze logs',
        canAutoFix: false,
      };
    }
  }

  /**
   * Automatically fix common issues
   */
  autoFixIssue(analysis: ErrorAnalysis): boolean {
    if (!analysis.canAutoFix) {
      console.log('⚠️  Cannot auto-fix:', analysis.message);
      return false;
    }

    console.log('🔧 Attempting auto-fix:', analysis.message);

    try {
      if (analysis.type === 'missing_dependency' && analysis.fixCommand) {
        console.log(`   Running: ${analysis.fixCommand}`);
        execSync(analysis.fixCommand, { cwd: REPO_ROOT, stdio: 'inherit' });

        // Commit and push
        console.log('   Committing fix...');
        execSync('git add pnpm-lock.yaml package.json', { cwd: REPO_ROOT });
        execSync(
          `git commit -m "fix: add missing dependencies (${analysis.packages?.join(', ')})

Auto-fixed deployment issue.

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"`,
          { cwd: REPO_ROOT }
        );

        console.log('   Pushing to remote...');
        execSync('git push origin main', { cwd: REPO_ROOT });

        return true;
      }
    } catch (error) {
      console.error('❌ Auto-fix failed:', error);
      return false;
    }

    return false;
  }

  /**
   * Trigger a new deployment
   */
  triggerRedeploy(): boolean {
    try {
      console.log('🚀 Triggering new deployment...');
      execSync('vercel --prod', { cwd: REPO_ROOT, stdio: 'inherit' });
      return true;
    } catch (error) {
      console.error('❌ Failed to trigger redeploy:', error);
      return false;
    }
  }

  /**
   * Wait for deployment to complete
   */
  async waitForDeployment(maxWait: number = 300000): Promise<boolean> {
    console.log('⏳ Waiting for deployment to complete...');
    const startTime = Date.now();
    let attempts = 0;

    while (Date.now() - startTime < maxWait) {
      attempts++;
      const deployment = this.getLatestDeployment();

      if (!deployment) {
        console.log('✅ Deployment succeeded!');
        return true;
      }

      console.log(
        `   Status: ${deployment.status} (check ${attempts}) - waiting...`
      );
      await new Promise((r) => setTimeout(r, 10000)); // Wait 10 seconds between checks
    }

    console.log('❌ Deployment timed out');
    return false;
  }

  /**
   * Log monitoring activity
   */
  log(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);

    try {
      fs.appendFileSync(LOG_FILE, logMessage + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  /**
   * Main monitoring loop
   */
  async monitor(): Promise<void> {
    console.log('\n🔍 GeoWatch Deployment Monitor Started\n');
    this.log('Monitor started');

    const deployment = this.getLatestDeployment();

    if (!deployment) {
      console.log('✅ No failed deployments found');
      this.log('No failed deployments found');
      return;
    }

    // Skip if we just checked this deployment
    if (this.lastCheckedDeployment === deployment.url) {
      console.log('⏭️  Already processed this deployment, skipping');
      return;
    }

    this.lastCheckedDeployment = deployment.url;
    console.log(`📋 Found failed deployment: ${deployment.url}`);
    this.log(`Found failed deployment: ${deployment.url}`);

    // Analyze error
    const analysis = this.analyzeDeploymentError(deployment.url);
    console.log(`📊 Error Type: ${analysis.type}`);
    console.log(`   ${analysis.message}`);
    this.log(`Error analysis: ${analysis.type} - ${analysis.message}`);

    if (!analysis.canAutoFix) {
      console.log('\n⚠️  Manual intervention required');
      console.log('   Please check the error and fix manually');
      this.log('Manual intervention required');
      return;
    }

    // Attempt auto-fix
    console.log('\n🔧 Attempting automatic fix...');
    const fixed = this.autoFixIssue(analysis);

    if (!fixed) {
      this.log('Auto-fix failed');
      return;
    }

    this.log('Auto-fix succeeded, triggering redeploy');

    // Trigger redeploy
    const redeployed = this.triggerRedeploy();
    if (!redeployed) {
      this.log('Redeploy trigger failed');
      return;
    }

    // Wait for deployment
    const success = await this.waitForDeployment();
    if (success) {
      this.log('✅ Deployment monitoring complete - SUCCESS');
      console.log('\n✅ Deployment fixed and redeployed successfully!\n');
    } else {
      this.log('❌ Deployment monitoring complete - FAILED');
      console.log('\n❌ Deployment failed again\n');
    }
  }
}

// Run monitor
const monitor = new DeploymentMonitor();
monitor.monitor().catch((error) => {
  console.error('Monitor error:', error);
  process.exit(1);
});
