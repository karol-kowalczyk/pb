const footerMarginBottom = 10; 

function drawFooter(doc) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();

  const footerBottomMargin = 10;
  const footerHeight = 30; 
  const footerY = pageHeight - footerBottomMargin - footerHeight;

  doc.setLineWidth(0.3);
  doc.setDrawColor(0);
  doc.line(10, footerY, pageWidth - 10, footerY);

  doc.setFontSize(9);
  doc.setTextColor(0);

  doc.setFont("helvetica", "bold");
  doc.text("Aluterr GmbH", 10, footerY + 7);
  doc.setFont("helvetica", "normal");
  doc.text("GF: Sabina Holda", 10, footerY + 12);
  doc.text("St-Nr.: 308/5800/2120", 10, footerY + 17);
  doc.text("USt-IdNr.: DE325778611", 10, footerY + 22);
  doc.text("Amtsgericht Gelsenkirchen:", 10, footerY + 27);
  doc.text("HRB 15272", 10, footerY + 32);

  const centerX = pageWidth / 2;
  doc.setFont("helvetica", "bold");
  doc.text("www.aluterr.de", centerX, footerY + 7, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.text("+49 2041 75291 20", centerX, footerY + 12, { align: "center" });
  doc.text("info@aluterr.de", centerX, footerY + 17, { align: "center" });
  doc.text("An der Knippenburg 107", centerX, footerY + 22, { align: "center" });
  doc.text("46238 Bottrop, Deutschland", centerX, footerY + 27, { align: "center" });
  doc.text("Mo.-Fr.: 08:00 - 17:00 Uhr", centerX, footerY + 32, { align: "center" });

  const rightX = pageWidth - 10;
  doc.setFont("helvetica", "bold");
  doc.text("Bankverbindung", rightX, footerY + 7, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.text("GENO BANK ESSEN eG", rightX, footerY + 12, { align: "right" });
  doc.text("DE38 3606 0488 0124 0788 00", rightX, footerY + 17, { align: "right" });
  doc.text("GENODEM1GBE", rightX, footerY + 22, { align: "right" });
}
