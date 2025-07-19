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
import { FaPlus, FaFilePdf, FaTrash } from "react-icons/fa";
import jsPDF from "jspdf";

type InvoiceItem = {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

interface InvoiceData {
  id?: string;
  clientId: string;
  invoiceNumber: string;
  issuedAt: Timestamp;
  dueDate: Timestamp;
  items: InvoiceItem[];
  total: number;
  paymentType: "Full" | "Part";
  paidAmount: number;
  company: string;
  clientName: string;
  clientEmail: string;
  clientContact: string;
  pdfUrl: string;
}

function generateInvoicePDF(invoice: InvoiceData) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Invoice Receipt", 20, 20);
  doc.setFontSize(12);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 30);
  doc.text(`Company: ${invoice.company}`, 20, 38);
  doc.text(`Client: ${invoice.clientName}`, 20, 46);
  doc.text(`Email: ${invoice.clientEmail}`, 20, 54);
  doc.text(`Contact: ${invoice.clientContact}`, 20, 62);
  doc.text(
    `Issued: ${
      invoice.issuedAt instanceof Timestamp
        ? invoice.issuedAt.toDate().toLocaleDateString()
        : ""
    }`,
    20,
    70
  );
  doc.text(
    `Due: ${
      invoice.dueDate instanceof Timestamp
        ? invoice.dueDate.toDate().toLocaleDateString()
        : ""
    }`,
    20,
    78
  );

  doc.text("Items:", 20, 88);
  let y = 96;
  invoice.items.forEach((item, idx) => {
    doc.text(
      `${idx + 1}. ${item.description} | Qty: ${item.quantity} | Rate: $${
        item.rate
      } | Amount: $${item.amount}`,
      20,
      y
    );
    y += 8;
  });

  doc.text(`Total: $${invoice.total}`, 20, y + 8);
  doc.text(`Payment Type: ${invoice.paymentType}`, 20, y + 16);
  doc.text(`Paid Amount: $${invoice.paidAmount}`, 20, y + 24);

  return doc.output("blob");
}

export default function InvoicePage() {
  const { clientId } = useParams();
  const user = auth.currentUser!;
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, rate: 0, amount: 0 },
  ]);
  const [dueDate, setDueDate] = useState("");
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(false);

  // New fields
  const [company, setCompany] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [paymentType, setPaymentType] = useState<"Full" | "Part">("Full");
  const [paidAmount, setPaidAmount] = useState(0);

  const storage = getStorage();

  const addInvoiceItem = () =>
    setItems([...items, { description: "", quantity: 1, rate: 0, amount: 0 }]);

  const updateItem = (i: number, key: keyof InvoiceItem, val: any) => {
    const newItems = [...items];
    if (key === "description") {
      newItems[i][key] = val as InvoiceItem["description"];
    } else {
      newItems[i][key] = Number(val) as InvoiceItem[
        | "quantity"
        | "rate"
        | "amount"];
    }
    // Auto-calculate amount
    newItems[i].amount = newItems[i].quantity * newItems[i].rate;
    setItems(newItems);
  };

  const generateAndUploadInvoice = async () => {
    if (!dueDate || !clientName || !clientEmail || !clientContact || !company) {
      alert("Please fill all required fields.");
      return;
    }
    setLoading(true);
    const total = items.reduce((acc, i) => acc + i.amount, 0);
    const invoiceNumber = `INV-${Date.now()}`;
    const issuedAt = serverTimestamp();
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
    const pdfBlob = generateInvoicePDF(invoiceData);

    // Upload PDF to Firebase Storage
    const storageRef = ref(
      storage,
      `invoices/${user.uid}/${clientId}/${invoiceNumber}.pdf`
    );
    await uploadBytes(storageRef, pdfBlob);
    const pdfUrl = await getDownloadURL(storageRef);

    // Save invoice to Firestore
    await addDoc(
      collection(
        db,
        "users",
        user.uid,
        "clients",
        String(clientId),
        "invoices"
      ),
      {
        ...invoiceData,
        pdfUrl,
        issuedAt: serverTimestamp(),
      }
    );

    setItems([{ description: "", quantity: 1, rate: 0, amount: 0 }]);
    setDueDate("");
    setCompany("");
    setClientName("");
    setClientEmail("");
    setClientContact("");
    setPaymentType("Full");
    setPaidAmount(0);
    setLoading(false);
    fetchInvoices();
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
    <div className="max-w-2xl mx-auto mt-10 space-y-6">
      <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
        <FaFilePdf className="text-red-600" /> Generate Invoice Receipt
      </h2>
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            className="border p-2 rounded"
            placeholder="Company Name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />
          <input
            className="border p-2 rounded"
            placeholder="Client Name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
          />
          <input
            className="border p-2 rounded"
            type="email"
            placeholder="Client Email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            required
          />
          <input
            className="border p-2 rounded"
            placeholder="Contact Number"
            value={clientContact}
            onChange={(e) => setClientContact(e.target.value)}
            required
          />
        </div>
        <div className="mt-4">
          <label className="block font-medium mb-1">Invoice Items</label>
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-4 gap-2 mb-2">
              <input
                className="border p-2 rounded"
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateItem(i, "description", e.target.value)}
              />
              <input
                className="border p-2 rounded"
                type="number"
                placeholder="Qty"
                value={item.quantity}
                min={1}
                onChange={(e) => updateItem(i, "quantity", e.target.value)}
              />
              <input
                className="border p-2 rounded"
                type="number"
                placeholder="Rate"
                value={item.rate}
                min={0}
                onChange={(e) => updateItem(i, "rate", e.target.value)}
              />
              <input
                className="border p-2 rounded bg-gray-50"
                type="number"
                placeholder="Amount"
                value={item.amount}
                readOnly
                tabIndex={-1}
              />
            </div>
          ))}
          <button
            onClick={addInvoiceItem}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold mt-2"
          >
            <FaPlus /> Add Item
          </button>
        </div>
        <label htmlFor="due-date" className="block font-medium mt-4 mb-1">
          Due Date
        </label>
        <input
          id="due-date"
          type="date"
          className="border p-2 rounded w-full"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          title="Select due date"
          placeholder="Select due date"
        />
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label htmlFor="payment-type" className="block font-medium mb-1">Payment Type</label>
            <select
              id="payment-type"
              className="border p-2 rounded w-full"
              value={paymentType}
              onChange={(e) =>
                setPaymentType(e.target.value as "Full" | "Part")
              }
              title="Select payment type"
            >
              <option value="Full">Full Payment</option>
              <option value="Part">Part Payment</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Paid Amount</label>
            <input
              className="border p-2 rounded w-full"
              type="number"
              min={0}
              value={paidAmount}
              onChange={(e) => setPaidAmount(Number(e.target.value))}
              placeholder="Amount Paid"
            />
          </div>
        </div>
        <div className="mt-4 font-bold text-lg text-blue-700">
          Total: ${items.reduce((acc, i) => acc + i.amount, 0)}
        </div>
        <button
          className={`bg-green-600 text-white p-2 w-full rounded font-bold mt-4 flex items-center justify-center gap-2 transition ${
            loading ? "opacity-60 cursor-not-allowed" : "hover:bg-green-700"
          }`}
          onClick={generateAndUploadInvoice}
          disabled={loading}
        >
          <FaFilePdf /> {loading ? "Generating..." : "Generate PDF Receipt"}
        </button>
      </div>

      <h3 className="text-lg font-semibold mt-8 mb-2">Past Invoices</h3>
      <div className="bg-white rounded-xl shadow p-4">
        {invoices.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            No invoices generated yet.
          </div>
        ) : (
          <ul className="space-y-2">
            {invoices.map((inv) => (
              <li
                key={inv.invoiceNumber}
                className="border p-2 flex justify-between items-center rounded"
              >
                <div>
                  <span className="font-semibold text-blue-700">
                    {inv.invoiceNumber}
                  </span>
                  <span className="ml-2 text-gray-500">
                    {inv.issuedAt instanceof Timestamp
                      ? inv.issuedAt.toDate().toLocaleDateString()
                      : ""}
                  </span>
                  <span className="ml-2 text-gray-500">
                    {inv.clientName} ({inv.company})
                  </span>
                </div>
                <a
                  href={inv.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 underline flex items-center gap-1"
                >
                  <FaFilePdf /> View PDF
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
