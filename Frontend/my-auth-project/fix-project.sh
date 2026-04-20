#!/bin/bash

# Fix PostCSS config
echo "Fixing PostCSS configuration..."
if [ -f "postcss.config.js" ]; then
  mv postcss.config.js postcss.config.cjs
fi

# Install dependencies with legacy peer deps
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Create a script to update all imports
echo "Creating script to update imports..."
cat > update-imports.js << 'EOF'
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Replace lucide-react imports with our custom Icons
  const updatedContent = content.replace(
    /import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/g,
    "import { $1 } from \"../components/Icons\""
  );
  
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Updated imports in ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.jsx'))) {
      processFile(filePath);
    }
  });
}

walkDir(srcDir);
console.log('All imports updated successfully!');
EOF

# Make the script executable
chmod +x update-imports.js

# Run the script to update imports
echo "Updating imports in all files..."
node update-imports.js

echo "All fixes applied successfully!"
