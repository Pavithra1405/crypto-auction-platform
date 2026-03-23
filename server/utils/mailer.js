import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkg = require('@getbrevo/brevo');

console.log('All exports:', Object.keys(pkg));
console.log('Brevo type:', typeof pkg.Brevo);
console.log('BrevoClient type:', typeof pkg.BrevoClient);
console.log('Brevo value:', pkg.Brevo);
console.log('BrevoClient value:', pkg.BrevoClient);

export async function sendCongratsEmail({ to }) {
  console.log('called for:', to);
}
