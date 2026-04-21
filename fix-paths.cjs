const fs = require('fs');
const files = [
  'src/__tests__/useQuiz.test.js',
  'src/__tests__/useGeminiChat.test.js',
  'src/__tests__/ElectionTimeline.test.jsx',
  'src/__tests__/VotingWizard.test.jsx',
  'src/__tests__/AIChat.test.jsx',
  'src/__tests__/KnowledgeQuiz.test.jsx',
];
files.forEach(function(f) {
  let content = fs.readFileSync(f, 'utf8');
  // Fix import paths: ../../X -> ../X
  content = content.replace(/from '\.\.\/\.\.\/hooks\//g, "from '../hooks/");
  content = content.replace(/from '\.\.\/\.\.\/utils\//g, "from '../utils/");
  content = content.replace(/from '\.\.\/\.\.\/firebase/g, "from '../firebase");
  content = content.replace(/from '\.\.\/\.\.\/components\//g, "from '../components/");
  // Fix jest.mock paths
  content = content.replace(/jest\.mock\('\.\.\/\.\.\/firebase/g, "jest.mock('../firebase");
  content = content.replace(/jest\.mock\('\.\.\/\.\.\/hooks\//g, "jest.mock('../hooks/");
  content = content.replace(/jest\.mock\('\.\.\/\.\.\/components\//g, "jest.mock('../components/");
  fs.writeFileSync(f, content);
  console.log('Fixed: ' + f);
});
console.log('All done.');
