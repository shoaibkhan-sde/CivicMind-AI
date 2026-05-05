const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      results.push(file);
    }
  });
  return results;
}
const files = walk('./src');
const jsFiles = files.filter(f => f.endsWith('.js') || f.endsWith('.jsx'));
let issues = [];
jsFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const importRegex = /import\s+.*?from\s+['"](.*?)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    let relativePath;
    
    if (importPath.startsWith('@/')) {
      relativePath = importPath.replace('@/', './src/');
    } else if (importPath.startsWith('.')) {
      relativePath = path.resolve(path.dirname(f), importPath);
    } else {
        continue;
    }

    let extPath = relativePath;
    if (!fs.existsSync(relativePath)) {
      if (fs.existsSync(relativePath + '.js')) extPath += '.js';
      else if (fs.existsSync(relativePath + '.jsx')) extPath += '.jsx';
      else if (fs.existsSync(relativePath + '/index.js')) extPath += '/index.js';
      else if (fs.existsSync(relativePath + '/index.jsx')) extPath += '/index.jsx';
    }
    
    if (fs.existsSync(extPath)) {
      // Check case sensitivity
      const dir = path.dirname(extPath);
      const base = path.basename(extPath);
      const actualFiles = fs.readdirSync(dir);
      if (!actualFiles.includes(base)) {
        issues.push('Case mismatch in ' + f + ': imported ' + importPath + ' but actual file is ' + actualFiles.find(a => a.toLowerCase() === base.toLowerCase()));
      }
      
      // Also check parent dirs if it starts with @/
      if (importPath.startsWith('@/')) {
          let curr = dir;
          while(curr !== '.' && curr !== './src') {
             const pDir = path.dirname(curr);
             const pBase = path.basename(curr);
             const pActual = fs.readdirSync(pDir);
             if (!pActual.includes(pBase)) {
                issues.push('Case mismatch in ' + f + ': imported ' + importPath + ' but actual dir is ' + pActual.find(a => a.toLowerCase() === pBase.toLowerCase()));
             }
             curr = pDir;
          }
      }
    } else {
      issues.push('Missing import in ' + f + ': ' + importPath);
    }
  }
});
console.log(issues.length > 0 ? issues.join('\n') : 'No case mismatch issues found.');
