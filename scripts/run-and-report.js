'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const reportsDir = path.join(root, 'reports');
fs.mkdirSync(reportsDir, { recursive: true });

let stdout = '';
try {
  stdout = execSync('npx jest --json --forceExit 2>/dev/null', {
    cwd: root,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
} catch (err) {
  stdout = (err && err.stdout) || '';
}

let raw;
try {
  raw = JSON.parse(stdout);
} catch {
  raw = { testResults: [] };
}

const tests = (raw.testResults || []).flatMap(suite =>
  (suite.testResults || []).map(t => ({
    name: t.fullName,
    status: t.status === 'passed' ? 'passed' : 'failed',
    duration: t.duration || 0,
    passRate: t.status === 'passed' ? 1.0 : 0.0,
  }))
);

const report = {
  framework: 'jest',
  timestamp: new Date().toISOString(),
  total: tests.length,
  passed: tests.filter(t => t.status === 'passed').length,
  failed: tests.filter(t => t.status === 'failed').length,
  tests,
};

fs.writeFileSync(path.join(reportsDir, 'test-results.json'), JSON.stringify(report, null, 2));
console.log('Report written to reports/test-results.json');
console.log(`  Total: ${report.total}, Passed: ${report.passed}, Failed: ${report.failed}`);
