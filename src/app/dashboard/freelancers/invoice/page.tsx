"use client";

import { useEffect, useState, ChangeEvent } from "react";
import {
  FaFileDownload,
  FaPlus,
  FaTrash,
  FaExclamationCircle,
  FaEye,
  FaCheckCircle,
  FaWhatsapp,
  FaEnvelope,
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

interface Invoice {
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  date: string;
  partPayment: number;
  completePayment: boolean;
  tax: number;
  discount: number;
  items: InvoiceItem[];
  logo?: string;
}

export default function InvoicePage() {
  const [invoice, setInvoice] = useState<Invoice>(() => {
    const stored = localStorage.getItem("invoice-data");
    return stored
      ? JSON.parse(stored)
      : {
          clientName: "",
          clientEmail: "",
          clientAddress: "",
          date: new Date().toISOString().split("T")[0],
          partPayment: 0,
          completePayment: false,
          tax: 0,
          discount: 0,
          items: [{ description: "", quantity: 1, rate: 0 }],
          logo: "",
        };
  });

  const [error, setError] = useState<string | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("invoice-data", JSON.stringify(invoice));
  }, [invoice]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked, files } = e.target;
    if (name === "logo" && files?.[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInvoice((prev) => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(files[0]);
      return;
    }

    setInvoice((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : ["tax", "discount", "partPayment"].includes(name)
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const updated = [...invoice.items];
    updated[index] = {
      ...updated[index],
      [field]: field === "description" ? String(value) : Number(value),
    };
    setInvoice({ ...invoice, items: updated });
  };

  const addItem = () => {
    setInvoice({
      ...invoice,
      items: [...invoice.items, { description: "", quantity: 1, rate: 0 }],
    });
  };

  const removeItem = (index: number) => {
    const updated = invoice.items.filter((_, i) => i !== index);
    setInvoice({ ...invoice, items: updated });
  };

  const calculateTotal = (): number => {
    const subtotal = invoice.items.reduce(
      (acc, item) => acc + item.quantity * item.rate,
      0
    );
    return subtotal + invoice.tax - invoice.discount;
  };

  const isFormValid = () => {
    return (
      invoice.clientName.trim() !== "" &&
      invoice.clientEmail.trim() !== "" &&
      invoice.clientAddress.trim() !== "" &&
      invoice.items.every((i) => i.description.trim() !== "")
    );
  };

  const downloadPDF = () => {
    if (!isFormValid()) {
      setError("Please complete all required fields before downloading.");
      return;
    }

    const doc = new jsPDF();

    if (invoice.logo) {
      doc.addImage(invoice.logo, "JPEG", 150, 10, 40, 20);
    }

    doc.setFontSize(18).text("INVOICE", 14, 20);
    doc
      .setFontSize(12)
      .text(`Client: ${invoice.clientName}`, 14, 30)
      .text(`Email: ${invoice.clientEmail}`, 14, 36)
      .text(`Address: ${invoice.clientAddress}`, 14, 42)
      .text(`Date: ${invoice.date}`, 14, 48);

    autoTable(doc, {
      startY: 54,
      head: [["Description", "Quantity", "Rate", "Amount"]],
      body: invoice.items.map((item) => [
        item.description,
        item.quantity.toString(),
        item.rate.toFixed(2),
        (item.quantity * item.rate).toFixed(2),
      ]),
      theme: "striped",
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 70;
    doc
      .text(
        `Subtotal: $${invoice.items
          .reduce((s, i) => s + i.quantity * i.rate, 0)
          .toFixed(2)}`,
        14,
        finalY + 10
      )
      .text(`Tax: $${invoice.tax.toFixed(2)}`, 14, finalY + 16)
      .text(`Discount: $${invoice.discount.toFixed(2)}`, 14, finalY + 22)
      .text(`Total: $${calculateTotal().toFixed(2)}`, 14, finalY + 28);

    const blob = doc.output("bloburl");
    setPreviewURL(blob);
    doc.save(`Invoice-${invoice.clientName}.pdf`);
    setToast("Invoice downloaded successfully!");
    setTimeout(() => setToast(null), 3000);

    const history = JSON.parse(localStorage.getItem("invoice-history") || "[]");
    history.push(invoice);
    localStorage.setItem("invoice-history", JSON.stringify(history));
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Invoice for ${invoice.clientName}`);
    const body = encodeURIComponent(
      `Please find attached the invoice dated ${
        invoice.date
      }.\nTotal: $${calculateTotal().toFixed(2)}`
    );
    window.open(
      `mailto:${invoice.clientEmail}?subject=${subject}&body=${body}`
    );
  };

  const shareViaWhatsApp = () => {
    const text = `Invoice for ${
      invoice.clientName
    } - Total: $${calculateTotal().toFixed(2)}\nSent on: ${invoice.date}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create Invoice</h2>

      {error && (
        <div className="mb-4 text-red-600 flex items-center gap-2">
          <FaExclamationCircle /> {error}
        </div>
      )}
      {toast && (
        <div className="mb-4 text-green-600 flex items-center gap-2">
          <FaCheckCircle /> {toast}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <input
          name="clientName"
          placeholder="Client Name"
          value={invoice.clientName}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="email"
          name="clientEmail"
          placeholder="Client Email"
          value={invoice.clientEmail}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          name="clientAddress"
          placeholder="Client Address"
          value={invoice.clientAddress}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
        placeholder="Invoice Date"
          type="date"
          name="date"
          value={invoice.date}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          placeholder="Upload Logo"
          type="file"
          accept="image/*"
          name="logo"
          onChange={handleChange}
          className="border p-2 rounded"
        />
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Invoice Items</h3>
        {invoice.items.map((item, idx) => (
          <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-2">
            <input
              value={item.description}
              onChange={(e) => updateItem(idx, "description", e.target.value)}
              placeholder="Description"
              className="border p-2 rounded"
            />
            <input
              type="number"
              value={item.quantity}
              onChange={(e) =>
                updateItem(idx, "quantity", Number(e.target.value))
              }
              placeholder="Qty"
              className="border p-2 rounded"
            />
            <input
              type="number"
              value={item.rate}
              onChange={(e) => updateItem(idx, "rate", Number(e.target.value))}
              placeholder="Rate"
              className="border p-2 rounded"
            />
            <button
              title="Remove Item"
              onClick={() => removeItem(idx)}
              className="bg-red-100 text-red-700 rounded p-2 hover:bg-red-200"
            >
              <FaTrash />
            </button>
          </div>
        ))}
        <button
          onClick={addItem}
          className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
        >
          <FaPlus /> Add Item
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <input
          type="number"
          name="tax"
          value={invoice.tax}
          onChange={handleChange}
          className="border p-2 rounded"
          placeholder="Tax"
        />
        <input
          type="number"
          name="discount"
          value={invoice.discount}
          onChange={handleChange}
          className="border p-2 rounded"
          placeholder="Discount"
        />
        <input
          type="number"
          name="partPayment"
          value={invoice.partPayment}
          onChange={handleChange}
          className="border p-2 rounded"
          placeholder="Part Payment"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="completePayment"
            checked={invoice.completePayment}
            onChange={handleChange}
          />
          Complete Payment
        </label>
      </div>

      <div className="flex justify-between items-center mb-4">
        <p className="font-semibold text-lg">
          Total: ${calculateTotal().toFixed(2)}
        </p>
        <div className="flex gap-2">
          <button
            onClick={downloadPDF}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
          >
            <FaFileDownload /> Download PDF
          </button>
          <button
            onClick={shareViaEmail}
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <FaEnvelope /> Email
          </button>
          <button
            onClick={shareViaWhatsApp}
            className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 flex items-center gap-2"
          >
            <FaWhatsapp /> WhatsApp
          </button>
        </div>
      </div>

      {previewURL && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-xl max-w-3xl w-full relative">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
              <FaEye /> Invoice Preview
            </h3>
            <iframe
              src={previewURL}
              className="w-full h-[500px] border rounded"
              title="Invoice Preview"
            />
            <button
              onClick={() => setPreviewURL(null)}
              className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
