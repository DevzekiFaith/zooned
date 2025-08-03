"use client";

import { useState } from "react";
import { FaFileInvoiceDollar, FaDownload, FaShare, FaPlus, FaTrash } from "react-icons/fa";

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  clientName: string;
  clientEmail: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue";
}

export default function InvoiceComponent() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const createNewInvoice = () => {
    const newInvoice: Invoice = {
      id: Date.now().toString(),
      clientName: "",
      clientEmail: "",
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      status: "draft",
    };
    setSelectedInvoice(newInvoice);
    setShowCreateForm(true);
  };

  const downloadInvoice = (invoice: Invoice) => {
    // Simulate PDF download
    const content = `
      INVOICE
      
      Client: ${invoice.clientName}
      Email: ${invoice.clientEmail}
      Date: ${invoice.date}
      Due Date: ${invoice.dueDate}
      
      Items:
      ${invoice.items.map(item => 
        `${item.description} - ${item.quantity} x $${item.rate} = $${item.amount}`
      ).join('\n')}
      
      Subtotal: $${invoice.subtotal}
      Tax: $${invoice.tax}
      Total: $${invoice.total}
    `;
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${invoice.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareInvoice = (invoice: Invoice) => {
    const subject = encodeURIComponent(`Invoice from FreelanceHub - ${invoice.clientName}`);
    const body = encodeURIComponent(
      `Hi ${invoice.clientName},\n\nPlease find attached your invoice for $${invoice.total}.\n\nDue Date: ${invoice.dueDate}\n\nThank you!`
    );
    window.open(`mailto:${invoice.clientEmail}?subject=${subject}&body=${body}`);
  };

  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "sent": return "bg-blue-100 text-blue-800";
      case "paid": return "bg-green-100 text-green-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-purple-700">Invoices</h1>
        <button
          onClick={createNewInvoice}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <FaPlus />
          Create Invoice
        </button>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-12">
          <FaFileInvoiceDollar className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No invoices yet</h3>
          <p className="text-gray-500 mb-6">Create your first invoice to get started</p>
          <button
            onClick={createNewInvoice}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Create Your First Invoice
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Invoice #{invoice.id}
                  </h3>
                  <p className="text-gray-600">{invoice.clientName}</p>
                  <p className="text-sm text-gray-500">{invoice.clientEmail}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadInvoice(invoice)}
                      className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
                      title="Download invoice"
                    >
                      <FaDownload />
                    </button>
                    <button
                      onClick={() => shareInvoice(invoice)}
                      className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
                      title="Share invoice"
                    >
                      <FaShare />
                    </button>
                    <button
                      onClick={() => {
                        setInvoices(prev => prev.filter(inv => inv.id !== invoice.id));
                      }}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                      title="Delete invoice"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Date:</span>
                  <p className="font-medium">{invoice.date}</p>
                </div>
                <div>
                  <span className="text-gray-500">Due Date:</span>
                  <p className="font-medium">{invoice.dueDate}</p>
                </div>
                <div>
                  <span className="text-gray-500">Items:</span>
                  <p className="font-medium">{invoice.items.length}</p>
                </div>
                <div>
                  <span className="text-gray-500">Total:</span>
                  <p className="font-medium text-lg text-purple-600">${invoice.total}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateForm && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-purple-700 mb-6">Create New Invoice</h2>
              <p className="text-gray-600 mb-4">
                This is a demo form. In a real implementation, you would have a complete invoice creation form here.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setInvoices(prev => [...prev, selectedInvoice]);
                    setShowCreateForm(false);
                    setSelectedInvoice(null);
                  }}
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Create Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
