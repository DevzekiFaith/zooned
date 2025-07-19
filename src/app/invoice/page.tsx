"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { generateInvoicePDF } from "@/lib/pdf";
import { saveAs } from "file-saver"; // npm install file-saver
import { jsPDF } from "jspdf"; // npm install jspdf

type InvoiceItem = { description: string; quantity: number; rate: number };

interface InvoiceData {
  id?: string;
  clientId: string;
  invoiceNumber: string;
  issuedAt: Timestamp;
  dueDate: Timestamp;
  items: InvoiceItem[];
  total: number;
  pdfUrl: string;
  paymentType: string;
  paidAmount: number;
  company: string;
  clientName: string;
  clientEmail: string;
  clientContact: string;
}

export default function InvoicePage() {
  const { clientId } = useParams();
  const user = auth.currentUser!;
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, rate: 0 },
  ]);
  const [dueDate, setDueDate] = useState("");
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [company, setCompany] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const storage = getStorage();

  const addInvoiceItem = () =>
    setItems([...items, { description: "", quantity: 1, rate: 0 }]);

  const updateItem = (i: number, key: keyof InvoiceItem, val: any) => {
    const newItems = [...items];
    if (key === "description") {
      newItems[i][key] = val as InvoiceItem["description"];
    } else {
      newItems[i][key] = Number(val) as InvoiceItem["quantity" | "rate"];
    }
    setItems(newItems);
  };

  const generateAndUploadInvoice = async () => {
    if (!dueDate || !clientName || !clientEmail || !clientContact || !company) {
      alert("Please fill all required fields.");
      return;
    }
    setLoading(true);
    const total = items.reduce((acc, i) => acc + i.quantity * i.rate, 0);
    const invoiceNumber = `INV-${Date.now()}`;
    const dueDateTimestamp = Timestamp.fromDate(new Date(dueDate));

    const invoiceData: InvoiceData = {
      clientId: String(clientId),
      invoiceNumber,
      issuedAt: Timestamp.now(),
      dueDate: dueDateTimestamp,
      items,
      total,
      paymentType,
      paidAmount,
      company,
      clientName,
      clientEmail,
      clientContact,
      pdfUrl: "",
    };

    // Generate PDF
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Invoice Receipt", 20, 20);
    doc.setFontSize(12);
    doc.text(`Invoice #: ${invoiceData.invoiceNumber}`, 20, 30);
    doc.text(`Company: ${invoiceData.company}`, 20, 38);
    doc.text(`Client: ${invoiceData.clientName}`, 20, 46);
    doc.text(`Email: ${invoiceData.clientEmail}`, 20, 54);
    doc.text(`Contact: ${invoiceData.clientContact}`, 20, 62);
    doc.text(`Due: ${dueDate}`, 20, 70);
    doc.text("Items:", 20, 80);
    let y = 88;
    invoiceData.items.forEach((item, idx) => {
      doc.text(
        `${idx + 1}. ${item.description} | Qty: ${item.quantity} | Rate: $${
          item.rate
        } | Amount: $${item.quantity * item.rate}`,
        20,
        y
      );
      y += 8;
    });
    doc.text(`Total: $${invoiceData.total}`, 20, y + 8);
    doc.text(`Payment Type: ${invoiceData.paymentType}`, 20, y + 16);
    doc.text(`Paid Amount: $${invoiceData.paidAmount}`, 20, y + 24);

    // Download PDF
    doc.save(`${invoiceData.invoiceNumber}.pdf`);

    // Optionally, send to client email
    const pdfBlob = doc.output("blob");
    const formData = new FormData();
    formData.append("email", clientEmail);
    formData.append("name", clientName);
    formData.append("invoiceNumber", invoiceNumber);
    formData.append("pdf", pdfBlob, `${invoiceNumber}.pdf`);

    await fetch("/api/send-invoice", {
      method: "POST",
      body: formData,
    });

    setLoading(false);
    alert("Invoice generated, downloaded, and sent to client email!");
  };

  const fetchInvoices = async () => {
    const snapshot = await getDocs(
      collection(db, "users", user.uid, "clients", String(clientId), "invoices")
    );
    setInvoices(
      snapshot.docs.map((doc) => ({
        ...(doc.data() as Omit<InvoiceData, "id">),
        id: doc.id,
      }))
    );
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-10 space-y-4">
      <h2 className="text-xl font-bold">Generate Invoice</h2>
      {items.map((item, i) => (
        <div key={i} className="grid grid-cols-3 gap-2">
          <input
            className="border p-1"
            placeholder="Description"
            value={item.description}
            onChange={(e) => updateItem(i, "description", e.target.value)}
          />
          <input
            className="border p-1"
            type="number"
            placeholder="Qty"
            value={item.quantity}
            min={1}
            onChange={(e) => updateItem(i, "quantity", e.target.value)}
          />
          <input
            className="border p-1"
            type="number"
            placeholder="Rate"
            value={item.rate}
            min={0}
            onChange={(e) => updateItem(i, "rate", e.target.value)}
          />
        </div>
      ))}
      <button onClick={addInvoiceItem} className="text-blue-500">
        + Add Item
      </button>
      <label htmlFor="due-date" className="block font-medium mb-1">
        Due Date
      </label>
      <input
        id="due-date"
        type="date"
        className="border p-1 w-full"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        title="Select due date"
        placeholder="Select due date"
      />
      <button
        className="bg-green-600 text-white p-2 w-full"
        onClick={generateAndUploadInvoice}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate PDF Invoice"}
      </button>

      <h3 className="text-lg font-semibold mt-6">Past Invoices</h3>
      <ul className="space-y-2">
        {invoices.map((inv) => (
          <li
            key={inv.invoiceNumber}
            className="border p-2 flex justify-between"
          >
            <span>{inv.invoiceNumber}</span>
            <a
              href={inv.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View PDF
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
