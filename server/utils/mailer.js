import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const SibApiV3Sdk = require('@getbrevo/brevo');

console.log('Brevo exports:', Object.keys(SibApiV3Sdk));

export async function sendCongratsEmail({ to }) {
  console.log('sendCongratsEmail called for:', to);
}
