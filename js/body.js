// add profile row
function addProfileRow(selectedProductNumber = "") {
  const container = document.getElementById("profile-section");

  ensureProfileHeaderExists(container);

  const row = createProfileRowElement();
  container.appendChild(row);

  const select = row.querySelector(".profile-select");
  populateProfileSelect(select);

  if (selectedProductNumber) {
    preselectProfile(select, selectedProductNumber);
  }
}

function ensureProfileHeaderExists(container) {
  if (document.getElementById("profile-table-header")) return;

  const header = document.createElement("table");
  header.id = "profile-table-header";
  header.innerHTML = `
    <tr>
      <td>Bezeichnung</td>
      <td></td>
      <td>Menge</td>
      <td></td>
      <td>Länge</td>
      <td></td>
    </tr>
  `;
  container.appendChild(header);
}

function createProfileRowElement() {
  const row = document.createElement("div");
  row.className = "profile-row";

  row.innerHTML = `
    <div>
      <select class="profile-select">
        <option value="">-- Profil auswählen --</option>
      </select>
      <input type="number" class="profile-anzahl" placeholder="Anzahl" min="1" value="1">
      <input type="number" class="profile-laenge" placeholder="Länge" min="1" value="1000">
      <select class="profile-unit">
        <option value="mm">mm</option>
        <option value="mm">Stck</option>
      </select>
      <button onclick="removeProfileRow(this)">Entfernen</button>
    </div>
  `;

  return row;
}

function populateProfileSelect(selectElement) {
  profile_descriptions.forEach((bez, index) => {
    const option = document.createElement("option");
    option.value = productIDs[index];
    option.textContent = bez;
    selectElement.appendChild(option);
  });
}

// remove profile row
function removeProfileRow(button) {
  const row = button.parentElement;
  row.remove();
}

function preselectProfile(selectElement, productID) {
  selectElement.value = productID;
}

// Load and fills the colors wiht preselected options
function loadColors() {
  clearColorOptions();
  addPredefinedColors();
  addStoredColors();
  restoreSelectedColor();
}

function clearColorOptions() {
  colorSelect.innerHTML = '';
}

function addPredefinedColors() {
  predefinedColors.forEach(color => {
    const option = createOption(color);
    colorSelect.appendChild(option);
  });
}

function addStoredColors() {
  const storedColors = JSON.parse(localStorage.getItem('customColors') || '[]');
  storedColors.forEach(color => {
    const option = createOption(color);
    colorSelect.appendChild(option);
  });
}

function restoreSelectedColor() {
  const selectedColor = localStorage.getItem('selectedColor');
  if (selectedColor) {
    colorSelect.value = selectedColor;
  }
}

// Hilfsfunktion: Create Option-Element
function createOption(value) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = value;
  return option;
}

// Add color button
addColorBtn.addEventListener('click', () => {
  const newColor = getTrimmedCustomColor();
  if (!newColor) return;

  let storedColors = getStoredColors();

  if (isNewColor(newColor, storedColors)) {
    addNewColor(newColor, storedColors);
  }

  updateColorSelect(newColor);
  clearCustomInput();
});

// Checks if color changed
colorSelect.addEventListener('change', () => {
  saveSelectedColor(colorSelect.value);
});

function getTrimmedCustomColor() {
  return colorCustomInput.value.trim();
}

function getStoredColors() {
  return JSON.parse(localStorage.getItem('customColors') || '[]');
}

function isNewColor(color, storedColors) {
  return !storedColors.includes(color) && !predefinedColors.includes(color);
}

function addNewColor(color, storedColors) {
  storedColors.push(color);
  localStorage.setItem('customColors', JSON.stringify(storedColors));
}

function updateColorSelect(color) {
  loadColors();
  colorSelect.value = color;
  saveSelectedColor(color);
}

function clearCustomInput() {
  colorCustomInput.value = '';
}

function saveSelectedColor(color) {
  localStorage.setItem('selectedColor', color);
}

loadColors();

// draw delivery note pdf version
async function drawLieferscheinLabel(doc, addressLines, x, startY, spacing = 5) {
  const labelY = calculateLabelY(startY, addressLines.length, spacing);
  drawLabelTitle(doc, x, labelY);

  const selectedColor = getSelectedColor();
  const baseText = getBaseText();

  const textLinesData = prepareTextLines(doc, baseText, selectedColor, 160);
  drawMainText(doc, textLinesData.lines, x, labelY + 5);

  if (textLinesData.colorInLastLine) {
    drawColorText(doc, selectedColor, x, labelY + 9.8, textLinesData.lines.length, textLinesData.lastLine);
  }

  resetTextColor(doc);

  await drawLieferscheinTable(doc, labelY + 10 + textLinesData.lines.length * 5 - 5);
}

function calculateLabelY(startY, lineCount, spacing) {
  return startY + (lineCount * spacing) + 20;
}

function drawLabelTitle(doc, x, y) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Lieferschein', x, y);
}

function getSelectedColor() {
  return document.getElementById('color-select').value || '';
}

function getBaseText() {
  return 'Hiermit liefern wir Ihnen die unten gelisteten Produkte und bitten Sie, diese schnellstmöglich zu beschichten in folgender Farbe: ';
}

function prepareTextLines(doc, baseText, selectedColor, maxWidth) {
  const fullText = baseText + selectedColor;
  const split = doc.splitTextToSize(fullText, maxWidth + 80);

  let lastLine = split[split.length - 1];
  let colorInLastLine = false;

  if (lastLine.includes(selectedColor)) {
    colorInLastLine = true;
    lastLine = lastLine.replace(selectedColor, '').trim();
    split[split.length - 1] = lastLine;
  }

  return {
    lines: split,
    colorInLastLine,
    lastLine
  };
}

function drawMainText(doc, lines, x, y) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(lines, x, y);
}

function drawColorText(doc, color, x, baseY, lineCount, lastLine) {
  const colorX = x + doc.getTextWidth(lastLine + ' ');
  const colorY = baseY + (lineCount - 1) * 5 - 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 0, 0);
  doc.text(color, colorX, colorY);
}

function resetTextColor(doc) {
  doc.setTextColor(0, 0, 0);
}

async function loadImageAsBase64(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

const imageBasePath = 'img/pics-elements-lieferschein/';
const productIDsPictures = {};

async function preloadImages() {
  for (const nummer of productIDs) {
    const imagePath = `${imageBasePath}${nummer}.png`;
    try {
      const base64 = await loadImageAsBase64(imagePath);
      productIDsPictures[nummer] = base64;
    } catch (e) {
      console.warn(`Bild nicht gefunden für ${nummer}`);
    }
  }
}

async function drawLieferscheinTable(doc, startY) {
  const colX = [20, 30, 98, 130, 165, 180];
  const rowHeight = 15;
  const maxFirstPageRows = 9;
  const maxOtherPageRows = 13;
  const headers = ['Pos.', 'Bezeichnung', 'Produkt-Nr.', 'Visualisierung', 'Menge', 'Länge'];

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 15;
  const marginRight = 15;

  let y = startY;
  let currentPageRowCount = 0;
  let currentPosition = 1;
  let isFirstPage = true;

  drawTableHeader(doc, y, colX, headers, rowHeight, marginLeft, pageWidth, marginRight);
  y += rowHeight;

  const profileRows = document.querySelectorAll(".profile-row");

  for (const row of profileRows) {
    const profileData = extractProfileData(row);
    if (!profileData) continue;

    const maxRowsAllowed = isFirstPage ? maxFirstPageRows : maxOtherPageRows;
    if (currentPageRowCount >= maxRowsAllowed || y + rowHeight > 280) {
      doc.addPage();
      y = 20;
      currentPageRowCount = 0;
      isFirstPage = false;
      drawTableHeader(doc, y, colX, headers, rowHeight, marginLeft, pageWidth, marginRight);
      y += rowHeight;
    }

    drawProfileRow(doc, profileData, currentPosition, colX, y);
    y += rowHeight;
    currentPageRowCount++;
    currentPosition++;
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawFooter(doc, i, pageCount);
  }
}

function drawTableHeader(doc, y, colX, headers, rowHeight, marginLeft, pageWidth, marginRight) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);

  doc.line(marginLeft, y, pageWidth - marginRight + 2, y);
  headers.forEach((text, i) => {
    let xPos = colX[i];
    if (text === 'Menge' || text === 'Länge/Stück') {
      xPos -= 5;
    }
    doc.text(text, xPos, y + rowHeight / 2 - 2);
  });
  doc.line(marginLeft, y + 9, pageWidth - marginRight + 2, y + 9);
}

function extractProfileData(row) {
  const select = row.querySelector(".profile-select");
  const quantity = row.querySelector(".profile-anzahl")?.value;
  const length = row.querySelector(".profile-laenge")?.value;
  const unit = row.querySelector(".profile-unit")?.value;
  const productID = select?.value;

  if (!productID) return null;

  const index = productIDs.indexOf(productID);
  if (index === -1) return null;

  const bezeichnung = profile_descriptions[index];
  const imageData = productIDsPictures[productID] || null;

  return { productID, bezeichnung, quantity, length, unit, imageData };
}

function drawProfileRow(doc, data, position, colX, y) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  doc.text(`${position}.`, colX[0], y);
  doc.text(data.bezeichnung, colX[1], y);
  doc.text(data.productID, colX[2], y);

  if (data.imageData) {
    doc.addImage(data.imageData, 'PNG', colX[3], y - 5, 30, 10);
  } else {
    doc.text('Kein Bild', colX[3], y);
  }

  doc.text(data.quantity, colX[4], y);
  doc.text(`${data.length} ${data.unit}`, colX[5], y);
}

function drawFooter(doc, pageNum, pageCount) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const footerText = `Seite ${pageNum} von ${pageCount}`;
  doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
}

function drawFooter(doc, currentPage, totalPages) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 15;

  doc.setFontSize(8);
  doc.setTextColor(0);
  doc.text(`Seite ${currentPage} von ${totalPages}`, pageWidth - 20, pageHeight - 10, { align: "right" });

  doc.setFontSize(7);
  doc.text("Aluterr GmbH | An der Knippenburg 107 | 46238 Bottrop | Tel: +49 2041 7529132",
    marginLeft, pageHeight - 5);
}
