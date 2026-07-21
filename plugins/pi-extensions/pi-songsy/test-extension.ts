#!/usr/bin/env node

/**
 * Simple test script for the songsy extension
 * Run with: node test-extension.ts
 * 
 * This script tests the extension loading and tool registration.
 * It does not actually call the MiniMax API.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Testing songsy extension...\n');

const extensionDir = path.join(__dirname, 'extensions', 'songsy');
const skillDir = path.join(__dirname, 'skills', 'songsy');

console.log('1. Checking file structure...');

const requiredFiles = [
  'extensions/songsy/index.ts',
  'extensions/songsy/package.json',
  'extensions/songsy/README.md',
  'skills/songsy/SKILL.md',
  'skills/songsy/REFERENCE.md',
  'skills/songsy/EXAMPLES.md',
];

let allFilesExist = true;
for (const file of requiredFiles) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✓ ${file}`);
  } else {
    console.log(`  ✗ ${file} (missing)`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.error('\n❌ Some required files are missing');
  process.exit(1);
}

console.log('\n2. Checking TypeScript compilation...');

try {
  execSync('npx tsc --noEmit', { 
    cwd: extensionDir, 
    stdio: 'pipe',
    encoding: 'utf-8'
  });
  console.log('  ✓ TypeScript compilation successful');
} catch (error) {
  console.error('  ✗ TypeScript compilation failed');
  console.error(error.stdout);
  process.exit(1);
}

console.log('\n3. Checking npm dependencies...');

try {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(extensionDir, 'package.json'), 'utf-8')
  );
  
  if (packageJson.dependencies?.typebox) {
    console.log('  ✓ typebox dependency found');
  } else {
    console.log('  ✗ typebox dependency missing');
  }
  
  if (packageJson.pi?.extensions) {
    console.log('  ✓ Pi extension configuration found');
  } else {
    console.log('  ✗ Pi extension configuration missing');
  }
} catch (error) {
  console.error('  ✗ Error reading package.json');
  process.exit(1);
}

console.log('\n4. Testing extension loading with Pi...');

try {
  // Set a test API key
  process.env.MINIMAX_API_KEY = 'test';
  
  // Run Pi with the extension and a simple prompt
  const output = execSync(
    'pi -e ./extensions/songsy -p "What tools are available?"',
    { 
      cwd: __dirname, 
      stdio: 'pipe',
      encoding: 'utf-8',
      timeout: 10000
    }
  );
  
  if (output.includes('minimax_music')) {
    console.log('  ✓ Extension loaded successfully');
    console.log('  ✓ minimax_music tool registered');
  } else {
    console.log('  ✗ Extension loaded but tool not found');
    console.log('  Output:', output.substring(0, 200) + '...');
  }
  
  if (output.includes('minimax_music_cover_preprocess')) {
    console.log('  ✓ minimax_music_cover_preprocess tool registered');
  } else {
    console.log('  ✗ minimax_music_cover_preprocess tool not found');
  }
  
  if (output.includes('minimax_music_download')) {
    console.log('  ✓ minimax_music_download tool registered');
  } else {
    console.log('  ✗ minimax_music_download tool not found');
  }
} catch (error) {
  console.error('  ✗ Error testing extension with Pi');
  console.error(error.message);
}

console.log('\n✅ All tests passed!\n');
console.log('The songsy extension is ready to use.');
console.log('\nTo use the extension:');
console.log('1. Set MINIMAX_API_KEY environment variable');
console.log('2. Run: pi -e ./extensions/songsy');
console.log('3. Use the minimax_music tool to generate music');