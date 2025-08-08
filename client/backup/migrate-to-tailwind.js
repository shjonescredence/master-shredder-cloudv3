#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  srcDir: './src',
  backupDir: './backup',
  componentsDir: './src/components',
  cssFiles: [],
  tsxFiles: [],
  cssToTailwindMap: {
    // Background mappings
    'background: linear-gradient(135deg, rgba(25, 30, 35, 0.95), rgba(30, 35, 45, 0.98))': 'bg-panel-gradient',
    'background: rgba(255, 255, 255, 0.05)': 'bg-panel-glass-bg',
    'backdrop-filter: blur(10px)': 'backdrop-blur-md',
    'backdrop-filter: blur(15px)': 'backdrop-blur-lg',
    
    // Border mappings
    'border: 1px solid rgba(100, 120, 140, 0.2)': 'border border-panel-dark-border',
    'border: 1px solid rgba(255, 255, 255, 0.1)': 'border border-panel-glass-border',
    'border-radius: 16px': 'rounded-2xl',
    'border-radius: 12px': 'rounded-xl',
    'border-radius: 8px': 'rounded-lg',
    
    // Spacing mappings
    'padding: 24px': 'p-6',
    'padding: 20px': 'p-5',
    'padding: 16px': 'p-4',
    'margin-bottom: 20px': 'mb-5',
    'margin-bottom: 16px': 'mb-4',
    
    // Flex mappings
    'display: flex': 'flex',
    'flex-direction: column': 'flex-col',
    'justify-content: center': 'justify-center',
    'align-items: center': 'items-center',
    'flex: 1': 'flex-1',
    
    // Shadow mappings
    'box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4)': 'shadow-panel-primary',
    'box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3)': 'shadow-panel-secondary',
    'box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2)': 'shadow-panel-tertiary',
    
    // Typography mappings
    'color: #ffffff': 'text-white',
    'color: rgba(255, 255, 255, 0.8)': 'text-gray-200',
    'color: rgba(255, 255, 255, 0.6)': 'text-gray-400',
    'font-weight: bold': 'font-bold',
    'font-weight: 600': 'font-semibold',
    'font-size: 24px': 'text-2xl',
    'font-size: 20px': 'text-xl',
    'font-size: 16px': 'text-base',
    
    // Transition mappings
    'transition: all 0.3s ease': 'transition-all duration-300',
    'transition: all 0.2s ease': 'transition-all duration-200',
    
    // Common patterns
    'height: 100%': 'h-full',
    'width: 100%': 'w-full',
    'overflow: hidden': 'overflow-hidden',
    'position: relative': 'relative',
    'position: absolute': 'absolute',
    'cursor: pointer': 'cursor-pointer',
  }
};

// Color scheme for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

// Utility functions
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n${'='.repeat(50)}`),
};

// Step 1: Create backup
function createBackup() {
  log.header('Creating Backup');
  
  if (!fs.existsSync(CONFIG.backupDir)) {
    fs.mkdirSync(CONFIG.backupDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(CONFIG.backupDir, `backup-${timestamp}`);
  
  execSync(`cp -r ${CONFIG.srcDir} ${backupPath}`);
  log.success(`Backup created at: ${backupPath}`);
  
  return backupPath;
}

// Step 2: Find all CSS and TSX files
function findFiles() {
  log.header('Finding Files');
  
  function walkDir(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules')) {
        walkDir(filePath, fileList);
      } else if (file.endsWith('.css')) {
        CONFIG.cssFiles.push(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
        CONFIG.tsxFiles.push(filePath);
      }
    });
  }
  
  walkDir(CONFIG.srcDir);
  
  log.success(`Found ${CONFIG.cssFiles.length} CSS files`);
  log.success(`Found ${CONFIG.tsxFiles.length} TSX/JSX files`);
}

// Step 3: Parse CSS file and extract classes
function parseCSSFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const classes = {};
  
  // Extract class definitions
  const classRegex = /\.([a-zA-Z0-9_-]+)\s*{([^}]+)}/g;
  let match;
  
  while ((match = classRegex.exec(content)) !== null) {
    const className = match[1];
    const styles = match[2].trim();
    classes[className] = styles;
  }
  
  return classes;
}

// Step 4: Convert CSS to Tailwind classes
function convertToTailwind(cssStyles) {
  const tailwindClasses = [];
  const unmappedStyles = [];
  
  // Split styles into individual properties
  const styleProps = cssStyles.split(';').map(s => s.trim()).filter(s => s);
  
  styleProps.forEach(prop => {
    let mapped = false;
    
    // Check if we have a direct mapping
    for (const [cssPattern, tailwindClass] of Object.entries(CONFIG.cssToTailwindMap)) {
      if (prop.includes(cssPattern.split(':')[0])) {
        tailwindClasses.push(tailwindClass);
        break;
      }
    }
    
    if (!mapped && prop) {
      unmappedStyles.push(prop);
    }
  });
  
  return { tailwindClasses, unmappedStyles };
}

// Step 5: Update TSX files
function updateTSXFile(filePath, cssToTailwindMappings) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Remove CSS imports
  const cssImportRegex = /import\s+['"].*\.css['"]\s*;?\s*\n?/g;
  if (cssImportRegex.test(content)) {
    content = content.replace(cssImportRegex, '');
    modified = true;
    log.info(`Removed CSS imports from ${path.basename(filePath)}`);
  }
  
  // Replace className attributes
  for (const [cssClass, tailwindClasses] of Object.entries(cssToTailwindMappings)) {
    const classNameRegex = new RegExp(`className\s*=\s*["']${cssClass}["']`, 'g');
    
    if (classNameRegex.test(content)) {
      content = content.replace(
        classNameRegex, 
        `className="${tailwindClasses.join(' ')}"`
      );
      modified = true;
      log.info(`Replaced .${cssClass} with Tailwind classes in ${path.basename(filePath)}`);
    }
    
    // Handle multiple classes
    const multiClassRegex = new RegExp(`["']([^"']*\s)?${cssClass}(\s[^"']*)?["']`, 'g');
    content = content.replace(multiClassRegex, (match, before = '', after = '') => {
      const newClasses = tailwindClasses.join(' ');
      return `"${before}${newClasses}${after}".trim()`;
    });
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    log.success(`Updated ${path.basename(filePath)}`);
  }
  
  return modified;
}

// Step 6: Generate migration report
function generateReport(mappings, unmappedStyles) {
  log.header('Migration Report');
  
  const reportPath = path.join(CONFIG.backupDir, 'migration-report.md');
  let report = '# CSS to Tailwind Migration Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  report += '## Successfully Mapped Classes\n\n';
  for (const [cssClass, tailwind] of Object.entries(mappings)) {
    report += `- \`.${cssClass}\` → \`${tailwind.join(' ')}\`\n`;
  }
  
  report += '\n## Unmapped Styles (Require Manual Review)\n\n';
  unmappedStyles.forEach(style => {
    report += `- \`${style}\`\n`;
  });
  
  report += '\n## Next Steps\n\n';
  report += '1. Review unmapped styles and create custom Tailwind utilities if needed\n';
  report += '2. Test all components thoroughly\n';
  report += '3. Remove old CSS files once migration is verified\n';
  report += '4. Run `npm run build` to ensure no build errors\n';
  
  fs.writeFileSync(reportPath, report);
  log.success(`Report generated: ${reportPath}`);
}

// Main migration function
async function migrate() {
  console.log(`\n${colors.bright}${colors.cyan}\n╔═══════════════════════════════════════════════════╗\n║     Master Shredder CSS → Tailwind Migration     ║\n╚═══════════════════════════════════════════════════╝\n${colors.reset}`);

  try {
    // Create backup
    const backupPath = createBackup();
    
    // Find files
    findFiles();
    
    // Process CSS files
    log.header('Processing CSS Files');
    const allMappings = {};
    const allUnmapped = [];
    
    CONFIG.cssFiles.forEach(cssFile => {
      log.info(`Processing ${path.basename(cssFile)}`);
    });
    
    CONFIG.tsxFiles.forEach(tsxFile => {
      if (updateTSXFile(tsxFile, allMappings)) {
        filesUpdated++;
      }
    });
    
    log.success(`Updated ${filesUpdated} component files`);
    
    // Generate report
    generateReport(allMappings, [...new Set(allUnmapped)]);
    
    log.header('Migration Complete!');
    log.success('✨ Your CSS has been migrated to Tailwind');
    log.info(`Backup saved at: ${backupPath}`);
    log.warning('Please review the migration report and test your application');
    
  } catch (error) {
    log.error(`Migration failed: ${error.message}`);
    process.exit(1);
  }
}

// Run migration
migrate();
