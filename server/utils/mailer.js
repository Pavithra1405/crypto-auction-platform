import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Brevo } = require('@getbrevo/brevo');

const client = new Brevo({
  apiKey: process.env.BREVO_API_KEY,
});

export async function sendCongratsEmail({
  to,
  bidderName,
  sellerName,
  sellerEmail,
  cryptoName,
  cryptoSymbol,
  quantity,
  winningBid,
}) {
  const response = await client.sendTransacEmail({
    subject: `Congratulations! You won ${cryptoName} (${cryptoSymbol})`,
    to: [{ email: to, name: bidderName || 'Bidder' }],
    sender: {
      name: sellerName || 'Crypto Auction Platform',
      email: process.env.BREVO_SENDER_EMAIL || 'projectmailm@gmail.com',
    },
    ...(sellerEmail && {
      replyTo: { email: sellerEmail, name: sellerName || 'Seller' },
    }),
    htmlContent: `
      <div style="background:#0b1020;padding:24px">
        <div style="max-width:640px;margin:0 auto;background:#111827;border:1px solid #1f2937;border-radius:16px;overflow:hidden">
          <div style="padding:22px 22px 14px;background:linear-gradient(135deg,#1d4ed8,#7c3aed)">
            <div style="font-family:Arial,sans-serif;color:white">
              <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;opacity:.9">CryptoBid Auction Result</div>
              <div style="font-size:22px;font-weight:700;margin-top:6px">Congratulations${bidderName ? `, ${bidderName}` : ''}!</div>
              <div style="margin-top:6px;opacity:.95">You are the winning bidder.</div>
            </div>
          </div>
          <div style="padding:22px;font-family:Arial,sans-serif;color:#e5e7eb;line-height:1.55">
            <p style="margin:0 0 14px">${sellerName || 'The seller'} is happy to congratulate you on winning the auction.</p>
            <div style="background:#0f172a;border:1px solid #1f2937;border-radius:12px;padding:14px">
              <div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap">
                <div>
                  <div style="color:#9ca3af;font-size:12px">ASSET</div>
                  <div style="font-size:16px;font-weight:700">${cryptoName} <span style="color:#a78bfa">(${cryptoSymbol})</span></div>
                </div>
                <div>
                  <div style="color:#9ca3af;font-size:12px">QUANTITY</div>
                  <div style="font-size:16px;font-weight:700">${quantity}</div>
                </div>
                <div>
                  <div style="color:#9ca3af;font-size:12px">WINNING BID</div>
                  <div style="font-size:16px;font-weight:700;color:#34d399">$${winningBid}</div>
                </div>
              </div>
            </div>
            <div style="margin-top:14px;background:#0b1220;border:1px dashed #334155;border-radius:12px;padding:14px">
              <div style="color:#9ca3af;font-size:12px">SELLER</div>
              <div style="font-weight:700">${sellerName || 'Seller'}</div>
              ${sellerEmail ? `<div style="margin-top:6px;color:#cbd5e1">Contact: <a style="color:#60a5fa" href="mailto:${sellerEmail}">${sellerEmail}</a></div>` : ''}
            </div>
            <p style="margin:16px 0 0">Next step: simply <strong>reply to this email</strong> to coordinate the transaction details.</p>
            <p style="margin:18px 0 0;color:#9ca3af;font-size:12px">This message was sent on behalf of the seller using CryptoBid.</p>
          </div>
        </div>
      </div>
    `,
  });

  return response;
}
