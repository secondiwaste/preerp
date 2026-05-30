const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Custom renderer to ensure header IDs are generated with unicode characters preserved
const renderer = new marked.Renderer();

renderer.heading = function(text, level, raw) {
  // Generate ID from raw text - preserve unicode (accented) characters
  // Lowercase, trim, replace spaces with hyphens, remove special chars but keep unicode letters
  const id = raw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u00C0-\u024F\u1E00-\u1EFF-]/g, '');
  
  return `<h${level} id="${id}">${text}</h${level}>\n`;
};

// Configure marked options
marked.setOptions({
  renderer: renderer,
  headerIds: true,
  mangle: false,
  breaks: true,
  gfm: true
});

// HTML template for the documentation
const createHtmlTemplate = (title, content, css) => `<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        ${css}
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            ${content}
        </div>
    </div>
</body>
</html>`;

// CSS styles for the documentation
const docStyles = `
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    background: #f5f5f5;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.content {
    background: white;
    padding: 3rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h1 {
    color: #667eea;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 3px solid #667eea;
    font-size: 2.5rem;
}

h2 {
    color: #444;
    margin-top: 2.5rem;
    margin-bottom: 1rem;
    padding-bottom: 0.3rem;
    border-bottom: 2px solid #e0e0e0;
    font-size: 2rem;
}

h3 {
    color: #555;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    font-size: 1.5rem;
}

h4 {
    color: #666;
    margin-top: 1.25rem;
    margin-bottom: 0.5rem;
    font-size: 1.25rem;
}

p {
    margin-bottom: 1rem;
}

ul, ol {
    margin-bottom: 1rem;
    padding-left: 2rem;
}

li {
    margin-bottom: 0.5rem;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

thead {
    background: #667eea;
    color: white;
}

th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
}

td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e0e0e0;
}

tbody tr:hover {
    background: #f8f9fa;
}

tbody tr:nth-child(even) {
    background: #f9f9f9;
}

tbody tr:nth-child(even):hover {
    background: #f0f0f0;
}

code {
    background: #f4f4f4;
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.9em;
    color: #e83e8c;
}

pre {
    background: #f4f4f4;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    margin: 1rem 0;
}

pre code {
    background: none;
    padding: 0;
    color: #333;
}

strong {
    color: #222;
    font-weight: 600;
}

em {
    color: #555;
}

hr {
    border: none;
    border-top: 2px solid #e0e0e0;
    margin: 2rem 0;
}

a {
    color: #667eea;
    text-decoration: none;
    transition: color 0.2s;
}

a:hover {
    color: #5568d3;
    text-decoration: underline;
}

blockquote {
    border-left: 4px solid #667eea;
    padding-left: 1rem;
    margin: 1rem 0;
    color: #666;
    font-style: italic;
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 4px;
}

@media print {
    body {
        background: white;
    }
    
    .container {
        padding: 0;
    }
    
    .content {
        box-shadow: none;
        padding: 1rem;
    }
}

@media (max-width: 768px) {
    .container {
        padding: 1rem;
    }
    
    .content {
        padding: 1.5rem;
    }
    
    h1 {
        font-size: 2rem;
    }
    
    h2 {
        font-size: 1.5rem;
    }
    
    table {
        font-size: 0.9rem;
    }
    
    th, td {
        padding: 0.5rem;
    }
}
`;

// Main function to build documentation
function buildDocs() {
    console.log('📚 Building documentation...');
    
    const sourceFile = path.join(__dirname, '..', 'FELHASZNALOI_KEZIKONYV.md');
    const outputDir = path.join(__dirname, '..', 'frontend', 'dist', 'preerp', 'browser', 'docs');
    const outputFile = path.join(outputDir, 'index.html');
    
    // Check if source file exists
    if (!fs.existsSync(sourceFile)) {
        console.error(`❌ Error: Source file not found: ${sourceFile}`);
        process.exit(1);
    }
    
    // Read markdown file
    console.log(`📖 Reading: ${sourceFile}`);
    const markdown = fs.readFileSync(sourceFile, 'utf8');
    
    // Convert markdown to HTML
    console.log('🔄 Converting markdown to HTML...');
    const htmlContent = marked(markdown);
    
    // Create full HTML page
    const fullHtml = createHtmlTemplate('Felhasználói kézikönyv - PreERP', htmlContent, docStyles);
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        console.log(`📁 Creating output directory: ${outputDir}`);
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write output file
    console.log(`💾 Writing: ${outputFile}`);
    fs.writeFileSync(outputFile, fullHtml, 'utf8');
    
    console.log('✅ Documentation built successfully!');
    console.log(`📄 Output: ${outputFile}`);
    
    // Get file size
    const stats = fs.statSync(outputFile);
    console.log(`📊 File size: ${(stats.size / 1024).toFixed(2)} KB`);
}

// Run the build
try {
    buildDocs();
} catch (error) {
    console.error('❌ Error building documentation:', error);
    process.exit(1);
}
