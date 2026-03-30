/**
 * Optionnel : obfuscation du bundle après `vite build`.
 * N'affecte pas le mode développement.
 */
import JavaScriptObfuscator from 'javascript-obfuscator';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distAssets = path.join(__dirname, '..', 'dist', 'assets');

if (!fs.existsSync(distAssets)) {
  console.warn('Dossier dist/assets absent — lancez npm run build d’abord.');
  process.exit(0);
}

const files = fs.readdirSync(distAssets).filter((f) => f.endsWith('.js'));
for (const file of files) {
  const full = path.join(distAssets, file);
  const code = fs.readFileSync(full, 'utf8');
  const ob = JavaScriptObfuscator.obfuscate(code, {
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    debugProtection: false,
    selfDefending: false,
    stringArray: true,
    stringArrayEncoding: ['base64'],
    transformObjectKeys: true,
  });
  fs.writeFileSync(full, ob.getObfuscatedCode());
  console.log('Obfusqué:', file);
}
