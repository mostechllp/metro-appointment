const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

// `top` = distance of the text BASELINE from the visible top edge of the page.
function drawCentered(page, font, text, { centerX, top, size, color, maxWidth }) {
  const mb = page.getMediaBox();            // template origin is not (0,0)
  const y = mb.y + mb.height - top;
  let s = size;
  while (maxWidth && font.widthOfTextAtSize(text, s) > maxWidth && s > 8) s -= 0.5;
  const w = font.widthOfTextAtSize(text, s);
  page.drawText(text, { x: mb.x + centerX - w / 2, y, size: s, font, color });
}

async function generateCertificate(name, event) {
  const templateBytes = fs.readFileSync(path.join(__dirname, '../certificate-template.pdf'));
  const pdfDoc = await PDFDocument.load(templateBytes);
  const page = pdfDoc.getPages()[0];
  const { width } = page.getSize();

  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const navy = rgb(0.08, 0.15, 0.30);
  const cx = width / 2;
  const title = event.title.toUpperCase();

  // 1. Small title between the gold lines under the logo
  drawCentered(page, bold, title, { centerX: cx, top: 148, size: 12, color: navy, maxWidth: 380 });

  // 2. Participant name on the gold line
  drawCentered(page, bold, name, { centerX: cx, top: 316, size: 28, color: rgb(0, 0, 0), maxWidth: 520 });

  // 3. Big title under "for participation in the"
  drawCentered(page, bold, title, { centerX: cx, top: 399, size: 26, color: navy, maxWidth: 560 });

  // 4. Event date above the DATE line
  const dateStr = new Date(event.date).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  drawCentered(page, regular, dateStr, { centerX: 240, top: 506, size: 12, color: navy });

  return Buffer.from(await pdfDoc.save());
}

module.exports = { generateCertificate };