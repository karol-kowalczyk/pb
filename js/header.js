const { jsPDF } = window.jspdf;

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
    });
}

function drawLogo(doc, img, x, y, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imgData = canvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', x, y, width, height);
}

function drawHeader(doc, x, y) {
    const text = 'Aluterr GmbH | GF: Sabina Holda | An der Knippenburg 107 | 46238 Bottrop';
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(text, x, y);
    const textWidth = doc.getTextWidth(text);
    doc.setLineWidth(0.2);
    doc.line(x, y + 0.7, x + textWidth, y + 0.7);

    
}

function getSelectedAddress() {
    const selected = document.getElementById('company-select')?.value || '';
    if (selected === 'esp') {
        return [
            "ESP Pulverbeschichtung GmbH",
            "Carolinenglückstr. 6",
            "44793 Bochum"
        ];
    } else if (selected === 'wirth') {
        return [
            "Wirth GmbH",
            "Emscherstraße 22",
            "45891 Gelsenkirchen",
            "Deutschland"
        ];
    } else {
        return ["[Keine Adresse ausgewählt]"];
    }
}

function drawAddress(doc, lines, x, startY, spacing = 5) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    lines.forEach((line, i) => {
        const y = startY + i * spacing;
        doc.text(x, y, line);
    });
}

function getTodayDateString() {
    const now = new Date();

    const dtf = new Intl.DateTimeFormat('de-DE', {
        timeZone: 'Europe/Berlin',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    const parts = dtf.formatToParts(now);

    const day = parts.find(p => p.type === 'day').value;
    const month = parts.find(p => p.type === 'month').value;
    const year = parts.find(p => p.type === 'year').value;

    return `${day}.${month}.${year}`;
}

function drawRightFields(doc, x, startY, spacing = 5) {
    const commissionInput = document.getElementById('commission-input')?.value || '[Keine Kommission eingegeben]';
    const lines = [
        `Datum: ${getTodayDateString()}`,
        `Kommission: ${commissionInput}`,
        "Ansprechpartner: Herr Holda",
        "Mail: einkauf@aluterr.de",
        "Telefonnr.: +49 2041 7529132"
    ];
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    lines.forEach((line, i) => {
        const y = startY + i * spacing;
        doc.text(x, y, line);
    });
}

async function generatePDF() {
  const doc = new jsPDF();

  const logoPos = { x: 15, y: 15, width: 90, height: 20 };
  await drawHeaderWithLogo(doc, logoPos);

  const contentY = logoPos.y + logoPos.height + 15;
  await preloadImages();

  const addressX = 20;
  const rightX = 120;
  const addressLines = getSelectedAddress();

  drawMainContent(doc, addressLines, addressX, rightX, contentY);
  drawFooter(doc);
  addPageNumbers(doc);
  savePDF(doc);

}

async function drawHeaderWithLogo(doc, { x, y, width, height }) {
  try {
    const img = await loadImage('img/Aluterr-Logo.png');
    drawLogo(doc, img, x, y, width, height);
  } catch {
    doc.text("[Logo nicht geladen]", x, y);
  }
  drawHeader(doc, x + 5, y + height + 10);
}

function drawMainContent(doc, addressLines, addressX, rightX, contentY) {
  drawAddress(doc, addressLines, addressX, contentY);
  drawRightFields(doc, rightX, contentY);
  return drawLieferscheinLabel(doc, addressLines, addressX, contentY);
}

function addPageNumbers(doc) {
  const pageCount = doc.getNumberOfPages();
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(0);
    doc.text(`Seite ${i} von ${pageCount}`, width - 10, height - 10, { align: "right" });
  }
}

function savePDF(doc) {
  const title = document.getElementById("commission-input")?.value.trim() || 'unbenannt';
  doc.save(`lieferschein-${title}.pdf`);
}
