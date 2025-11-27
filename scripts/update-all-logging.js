/**
 * Comprehensive script to update all console.log statements to use logger
 * This handles both client and server files appropriately
 */

const fs = require('fs');
const path = require('path');

// Files to update (from grep results)
const filesToUpdate = [
  'components/app-sidebar.tsx',
  'lib/analytics-api.ts',
  'components/dashboard-content-new.tsx',
  'app/ask-rate/page.tsx',
  'components/approvals-content.tsx',
  'lib/api/enquiry.ts',
  'lib/rate-queries-api.ts',
  'components/printing-wizard.tsx',
  'components/inquiries-content.tsx',
  'components/new-inquiry-form.tsx',
  'components/drafts-content.tsx',
  'components/ai-costing-chat.tsx',
  'hooks/use-auto-save-draft.ts',
  'lib/drafts-api.ts',
  'app/api/drafts/route.ts',
  'app/rate-queries/page.tsx',
  'app/projects/page.tsx',
  'lib/api-config.ts',
  'app/page.tsx',
  'app/inquiries/page.tsx',
  'components/ui/client-dropdown.tsx',
  'components/clients-content.tsx',
  'app/clients/page.tsx',
  'app/dashboard/page.tsx',
  'hooks/use-voice-input.ts',
  'components/recent-chats.tsx',
  'app/profile/page.tsx',
  'lib/font-size-context.tsx'
];

// Determine if file is client-side or server-side
function isClientSide(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Check for "use client" directive
  if (content.trim().startsWith('"use client"') || content.trim().startsWith("'use client'")) {
    return true;
  }
  // Components and hooks are typically client-side
  if (filePath.includes('/components/') || filePath.includes('/hooks/')) {
    return true;
  }
  // App pages might be client or server
  if (filePath.includes('/app/') && filePath.endsWith('/page.tsx')) {
    return content.includes('"use client"') || content.includes("'use client'");
  }
  // API routes are server-side
  if (filePath.includes('/api/')) {
    return false;
  }
  // Lib files are typically server-side unless they have "use client"
  if (filePath.includes('/lib/')) {
    return content.includes('"use client"') || content.includes("'use client'");
  }
  return false;
}

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    const isClient = isClientSide(filePath);
    const loggerName = isClient ? 'clientLogger' : 'logger';

    console.log(`Processing: ${filePath} (${isClient ? 'client' : 'server'})`);

    // Check if already has logger import
    const hasLoggerImport = content.includes('from "@/lib/logger"') || content.includes("from '@/lib/logger'");

    // Replace all console statements (but keep them in logger.ts)
    if (!filePath.includes('logger.ts')) {
      // Replace console.log, console.error, console.warn, console.info, console.debug
      content = content.replace(/\bconsole\.log\(/g, `${loggerName}.log(`);
      content = content.replace(/\bconsole\.error\(/g, `${loggerName}.error(`);
      content = content.replace(/\bconsole\.warn\(/g, `${loggerName}.warn(`);
      content = content.replace(/\bconsole\.info\(/g, `${loggerName}.info(`);
      content = content.replace(/\bconsole\.debug\(/g, `${loggerName}.debug(`);

      // Add import if needed and content changed
      if (content !== originalContent && !hasLoggerImport) {
        // Find where to insert import
        const lines = content.split('\n');
        let insertIndex = 0;

        // Find last import or "use client"
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('import ') && lines[i].includes(' from ')) {
            insertIndex = i + 1;
          } else if (lines[i].includes('"use client"') || lines[i].includes("'use client'")) {
            insertIndex = i + 1;
            // Add blank line after "use client"
            if (lines[insertIndex] && lines[insertIndex].trim() !== '') {
              insertIndex = i + 1;
            }
          }
        }

        // Insert the import
        const importStatement = `import { ${loggerName} } from "@/lib/logger"`;
        lines.splice(insertIndex, 0, importStatement);
        content = lines.join('\n');
      }
    }

    // Write back if changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ Updated`);
      return true;
    } else {
      console.log(`  ⏭️  No changes needed`);
      return false;
    }
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return false;
  }
}

console.log('🔍 Starting comprehensive logging update...\n');

let totalUpdated = 0;
let totalSkipped = 0;
let totalErrors = 0;

filesToUpdate.forEach(relativePath => {
  const fullPath = path.join(process.cwd(), relativePath);
  if (fs.existsSync(fullPath)) {
    const updated = updateFile(fullPath);
    if (updated) {
      totalUpdated++;
    } else {
      totalSkipped++;
    }
  } else {
    console.log(`⚠️  File not found: ${relativePath}`);
    totalErrors++;
  }
});

console.log('\n' + '='.repeat(50));
console.log(`✨ Complete!`);
console.log(`  ✅ Updated: ${totalUpdated} files`);
console.log(`  ⏭️  Skipped: ${totalSkipped} files`);
console.log(`  ❌ Errors: ${totalErrors} files`);
console.log('='.repeat(50));

console.log('\n📝 Next steps:');
console.log('1. Review changes: git diff');
console.log('2. Test in development: npm run dev');
console.log('3. Test build: npm run build');
console.log('4. Check for any remaining console statements:');
console.log('   grep -r "console\\." app/ components/ lib/ --include="*.ts" --include="*.tsx"');
