/**
 * Script to replace console.log statements with logger throughout the codebase
 * Usage: node scripts/replace-console-logs.js
 */

const fs = require('fs');
const path = require('path');

// Directories to scan
const dirsToScan = ['app', 'components', 'lib'];

// File extensions to process
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

// Patterns to replace
const replacements = [
  {
    // Replace: if (isDev) console.log(...)
    pattern: /if\s*\(isDev\)\s*console\.log\((.*?)\)/g,
    replacement: 'clientLogger.log($1)'
  },
  {
    // Replace: if (isDev) console.error(...)
    pattern: /if\s*\(isDev\)\s*console\.error\((.*?)\)/g,
    replacement: 'clientLogger.error($1)'
  },
  {
    // Replace: if (isDev) console.warn(...)
    pattern: /if\s*\(isDev\)\s*console\.warn\((.*?)\)/g,
    replacement: 'clientLogger.warn($1)'
  },
  {
    // Replace: if (isDev) { console.log(...); console.log(...); }
    pattern: /if\s*\(isDev\)\s*\{\s*console\.(log|error|warn|info|debug)\((.*?)\)\s*console\.(log|error|warn|info|debug)\((.*?)\)\s*\}/g,
    replacement: (match, method1, args1, method2, args2) => {
      return `clientLogger.${method1}(${args1})\n      clientLogger.${method2}(${args2})`;
    }
  }
];

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Check if file needs logger import
  const needsLogger = /if\s*\(isDev\)\s*console\./g.test(content);

  if (needsLogger) {
    // Add import if not present
    if (!content.includes('from "@/lib/logger"') && !content.includes('from \'@/lib/logger\'')) {
      // Find the last import statement
      const importMatch = content.match(/^import .* from .*$/gm);
      if (importMatch) {
        const lastImport = importMatch[importMatch.length - 1];
        const importIndex = content.indexOf(lastImport) + lastImport.length;
        content = content.slice(0, importIndex) + '\nimport { clientLogger } from "@/lib/logger"' + content.slice(importIndex);
        modified = true;
      }
    }

    // Apply replacements
    replacements.forEach(({ pattern, replacement }) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    // Remove isDev declaration if present
    content = content.replace(/const isDev = process\.env\.NODE_ENV === ['"]development['"]\s*\n/g, '');

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
  }

  return false;
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  let count = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      count += scanDirectory(filePath);
    } else if (stat.isFile() && extensions.some(ext => file.endsWith(ext))) {
      if (replaceInFile(filePath)) {
        count++;
      }
    }
  });

  return count;
}

console.log('🔍 Scanning for console.log statements...\n');

let totalUpdated = 0;
dirsToScan.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    const updated = scanDirectory(dirPath);
    totalUpdated += updated;
  }
});

console.log(`\n✨ Complete! Updated ${totalUpdated} files.`);
console.log('\n📝 Manual steps:');
console.log('1. Review the changes with git diff');
console.log('2. Check for any multiline console statements that need manual fixing');
console.log('3. Import { logger } from "@/lib/logger" for server-side files');
console.log('4. Import { clientLogger } from "@/lib/logger" for client-side files');
