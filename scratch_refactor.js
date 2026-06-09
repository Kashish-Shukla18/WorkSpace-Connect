const fs = require('fs');
const path = require('path');

const srcDir = 'd:\\Khushi\\IITK Projects\\WorkSpace-Connect\\frontend\\src';

function processFile(filePath) {
    if (!filePath.endsWith('.js') && !filePath.endsWith('.jsx')) return;
    if (filePath.endsWith('config.js')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    const regex = /(["'`])http:\/\/(?:172\.24\.109\.63|localhost):5000(.*?)\1/g;
    
    if (regex.test(content)) {
        content = content.replace(regex, '`${API_BASE_URL}$2`');
        
        // ensure import is added
        if (!content.includes('API_BASE_URL')) {
            // this check is redundant but safe
        }
        
        if (!content.includes("import { API_BASE_URL }")) {
            // add to top
            content = "import { API_BASE_URL } from './config';\n" + content;
        }

        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated:', path.basename(filePath));
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else {
            processFile(fullPath);
        }
    }
}

walkDir(srcDir);
console.log('Done refactoring frontend!');
