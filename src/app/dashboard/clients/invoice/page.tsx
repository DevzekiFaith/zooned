'use client'
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, getDocs, serverTimestamp, Timestamp } from "firebase/firestore";
import { generateInvoicePDF } from "@/lib/pdf";

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
}

export default function InvoicePage() {
  const { clientId } = useParams();
  const user = auth.currentUser!;
  const [items, setItems] = useState<InvoiceItem[]>([{ description: "", quantity: 1, rate: 0 }]);
  const [dueDate, setDueDate] = useState("");
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);

  const storage = getStorage();

  const addInvoiceItem = () => setItems([...items, { description: "", quantity: 1, rate: 0 }]);

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
    if (!dueDate) return alert("Please select a due date.");
    const total = items.reduce((acc, i) => acc + i.quantity * i.rate, 0);
    const invoiceNumber = `INV-${Date.now()}`;
    const issuedAt = serverTimestamp();
    const dueDateTimestamp = Timestamp.fromDate(new Date(dueDate));

    const invoiceData = {
      clientId: String(clientId),
      invoiceNumber,
      issuedAt, // Firestore serverTimestamp
      dueDate: dueDateTimestamp,
      items,
      total,
      pdfUrl: "",
    };

    // Generate PDF (should return a Blob)
    const pdfBlob = generateInvoicePDF(
      { ...invoiceData, issuedAt: new Date(), dueDate: new Date(dueDate) },
      "Client"
    );

    const storageRef = ref(storage, `invoices/${user.uid}/${clientId}/${invoiceNumber}.pdf`);
    await uploadBytes(storageRef, pdfBlob);
    const pdfUrl = await getDownloadURL(storageRef);

    // Save invoice to Firestore
    await addDoc(collection(db, "users", user.uid, "clients", String(clientId), "invoices"), {
      ...invoiceData,
      pdfUrl,
      issuedAt: serverTimestamp(), // Overwrite with Firestore timestamp
    });

    setItems([{ description: "", quantity: 1, rate: 0 }]);
    setDueDate("");
    fetchInvoices();
  };

  const fetchInvoices = async () => {
    const snapshot = await getDocs(
      collection(db, "users", user.uid, "clients", String(clientId), "invoices")
    );
    setInvoices(
      snapshot.docs.map(doc => ({
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
            onChange={e => updateItem(i, "description", e.target.value)}
          />
          <input
            className="border p-1"
            type="number"
            placeholder="Qty"
            value={item.quantity}
            min={1}
            onChange={e => updateItem(i, "quantity", e.target.value)}
          />
          <input
            className="border p-1"
            type="number"
            placeholder="Rate"
            value={item.rate}
            min={0}
            onChange={e => updateItem(i, "rate", e.target.value)}
          />
        </div>
      ))}
      <button onClick={addInvoiceItem} className="text-blue-500">+ Add Item</button>
      <label htmlFor="due-date" className="block font-medium mb-1">Due Date</label>
      <input
        id="due-date"
        type="date"
        className="border p-1 w-full"
        value={dueDate}
        onChange={e => setDueDate(e.target.value)}
        title="Select due date"
        placeholder="Select due date"
      />
      <button className="bg-green-600 text-white p-2 w-full" onClick={generateAndUploadInvoice}>
        Generate PDF Invoice
      </button>

      <h3 className="text-lg font-semibold mt-6">Past Invoices</h3>
      <ul className="space-y-2">
        {invoices.map(inv => (
          <li key={inv.invoiceNumber} className="border p-2 flex justify-between">
            <span>{inv.invoiceNumber}</span>
            <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              View PDF
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
