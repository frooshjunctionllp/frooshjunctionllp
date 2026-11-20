const fs = require('node:fs');
const path = require('node:path');
const QRCode = require('qrcode');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/lib/googleReviews.ts'), 'utf8');
const reviewUrl = source.match(/reviewUrl:\s*"([^"]+)"/)?.[1];
if (!reviewUrl) throw new Error('Google review URL was not found.');
QRCode.toFile(path.join(root, 'public/images/google-review-qr.svg'), reviewUrl, {
  type: 'svg', errorCorrectionLevel: 'H', margin: 4, width: 280,
  color: { dark: '#164735', light: '#ffffff' },
}).then(() => console.log('Generated the Google review QR code.')).catch(error => {
  console.error(error); process.exitCode = 1;
});
