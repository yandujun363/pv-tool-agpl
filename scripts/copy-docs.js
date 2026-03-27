import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

// 直接通配符匹配所有 .md 文件和 LICENSE
const files = fs.readdirSync(rootDir);
const docsToCopy = files.filter(f => 
  f === 'LICENSE' || 
  f === 'NOTICE' || 
  f === 'README.md' || 
  f === 'CONTRIBUTORS.md'
);

docsToCopy.forEach(file => {
  const src = path.join(rootDir, file);
  const dest = path.join(distDir, file);
  
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✅ Copied ${file}`);
  }
});

// 如果没有 NOTICE 文件，创建一个简单的
const noticeDest = path.join(distDir, 'NOTICE');
if (!fs.existsSync(noticeDest)) {
  const noticeContent = `PV Tool — AGPL Community Edition
Copyright (c) 2026 DanteAlighieri13210914
Copyright (c) 2026 Contributors

Source: https://github.com/yandujun363/pv-tool-agpl
License: AGPL-3.0
`;
  fs.writeFileSync(noticeDest, noticeContent);
  console.log('✅ Created NOTICE');
}