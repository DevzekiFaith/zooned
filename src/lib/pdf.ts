// lib/pdf.ts
import jsPDF from "jspdf";

export function generateInvoicePDF(invoice: any, clientName: string) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Invoice", 90, 20);
  doc.setFontSize(12);
  doc.text(`Client: ${clientName}`, 20, 30);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 40);
  doc.text(`Issued: ${invoice.issuedAt}`, 20, 50);
  doc.text(`Due: ${invoice.dueDate}`, 20, 60);

  let y = 70;
  invoice.items.forEach((item: any, idx: number) => {
    doc.text(`${idx + 1}. ${item.description} - ${item.quantity} x $${item.rate}`, 20, y);
    y += 10;
  });

  doc.text(`Total: $${invoice.total}`, 20, y + 10);
  return doc.output("blob");
}
