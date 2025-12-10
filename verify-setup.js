// Verification script to check if all dependencies are properly installed
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Fundfeed project setup...\n');

// Check required files
const requiredFiles = [
  'package.json',
  'tsconfig.json',
  'next.config.js',
  'tailwind.config.js',
  'postcss.config.js',
  '.eslintrc.json',
  'jest.config.js',
  'jest.setup.js',
  'app/layout.tsx',
  'app/page.tsx',
  'app/globals.css',
  'types/index.ts',
  '.env.example',
  'README.md'
];

const requiredDirs = [
  'app',
  'components',
  'lib',
  'contexts',
  'types',
  'node_modules'
];

let allGood = true;

console.log('📁 Checking required files:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allGood = false;
});

console.log('\n📂 Checking required directories:');
requiredDirs.forEach(dir => {
  const exists = fs.existsSync(path.join(__dirname, dir));
  console.log(`  ${exists ? '✅' : '❌'} ${dir}`);
  if (!exists) allGood = false;
});

console.log('\n📦 Checking key dependencies:');
const packageJson = require('./package.json');
const requiredDeps = {
  'next': '14.2.3',
  'react': '^18.3.1',
  '@supabase/supabase-js': '^2.49.4',
  'canvas-confetti': '^1.9.3',
  'tailwindcss': '^3.4.3',
  'typescript': '^5.4.5',
  'fast-check': '^3.19.0'
};

Object.entries(requiredDeps).forEach(([dep, version]) => {
  const installed = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
  console.log(`  ${installed ? '✅' : '❌'} ${dep}${installed ? ` (${installed})` : ''}`);
  if (!installed) allGood = false;
});

console.log('\n' + (allGood ? '✅ All checks passed! Project is ready.' : '❌ Some checks failed. Please review the output above.'));
process.exit(allGood ? 0 : 1);
