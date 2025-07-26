"use client";

import { useEffect, useState, useCallback, ChangeEvent } from "react";
import {
  FaFileDownload,
  FaPlus,
  FaCheckCircle,
  FaExclamationCircle,
  FaWhatsapp,
  FaEnvelope,
  FaEye,
  FaTrash,
  FaSearch,
  FaSortAlphaDown,
  FaSortNumericDown,
  FaFilter,
  FaDollarSign,
} from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";

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
  tag?: string;
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

  const [history, setHistory] = useState<Invoice[]>(() => {
    const h = localStorage.getItem("invoice-history");
    return h ? JSON.parse(h) : [];
  });

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [filterPayment, setFilterPayment] = useState<"all" | "paid" | "unpaid">("all");
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingHistoryIndex, setPendingHistoryIndex] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);

  const handleViewHistory = (index: number) => {
    setShowConfirm(true);
    setPendingHistoryIndex(index);
  };

  const confirmViewHistory = () => {
    if (pendingHistoryIndex !== null) {
      const selected = history[pendingHistoryIndex];
      setInvoice(selected);
      setSelectedHistoryIndex(pendingHistoryIndex);
      localStorage.setItem("invoice-data", JSON.stringify(selected));
      setShowConfirm(false);
      setPendingHistoryIndex(null);
      setEditMode(true);
    }
  };

  const generateTag = (baseName: string, historyList: Invoice[]) => {
    const versionCount = historyList.filter(h => h.clientName === baseName).length;
    return versionCount > 0 ? `v${versionCount + 1}` : undefined;
  };

  const handleSaveAsNew = () => {
    const newTag = generateTag(invoice.clientName, history);
    const updatedInvoice = { ...invoice, tag: newTag };
    const updatedHistory = [...history, updatedInvoice];
    setHistory(updatedHistory);
    localStorage.setItem("invoice-history", JSON.stringify(updatedHistory));
    localStorage.setItem("invoice-data", JSON.stringify(updatedInvoice));
    setInvoice(updatedInvoice);
    setEditMode(false);
  };

  const filteredHistory = [...history]
    .filter((item) => {
      const matchesQuery =
        item.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.clientEmail.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPayment =
        filterPayment === "all" ||
        (filterPayment === "paid" && item.completePayment) ||
        (filterPayment === "unpaid" && !item.completePayment);
      return matchesQuery && matchesPayment;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.clientName.localeCompare(b.clientName);
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const calculateTotal = (inv: Invoice) => {
    const sub = inv.items.reduce((sum, i) => sum + i.quantity * i.rate, 0);
    return sub + inv.tax - inv.discount;
  };

  return (
    <div>
      {/* History List */}
      {history.length > 0 && (
        <div className="mb-6 bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Invoice History</h3>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <FaSearch className="text-gray-500" />
            <input
              type="text"
              placeholder="Search by client name or email"
              className="border px-2 py-1 rounded w-full sm:w-auto flex-grow"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              onClick={() => setSortBy(sortBy === "name" ? "date" : "name")}
              className="text-gray-600 hover:text-gray-900"
              title="Toggle Sort"
            >
              {sortBy === "name" ? <FaSortAlphaDown /> : <FaSortNumericDown />}
            </button>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value as any)}
              className="border px-2 py-1 rounded"
              title="Filter by Payment"
            >
              <option value="all">All</option>
              <option value="paid">Complete</option>
              <option value="unpaid">Partial</option>
            </select>
          </div>

          <ul className="space-y-2 max-h-60 overflow-auto">
            {filteredHistory.map((item, index) => (
              <li
                key={index}
                className="flex justify-between items-center bg-gray-50 p-3 rounded hover:bg-gray-100"
              >
                <div className="text-sm">
                  <p className="font-medium">{item.clientName} {item.tag && <span className="text-xs text-gray-500">({item.tag})</span>}</p>
                  <p className="text-gray-500 text-xs">{item.date}</p>
                  <p className="text-blue-700 font-semibold">${calculateTotal(item).toFixed(2)}</p>
                </div>
                <button
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                  onClick={() => handleViewHistory(index)}
                >
                  <FaEye /> View
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {editMode && (
        <div className="mb-6 text-right">
          <button
            onClick={handleSaveAsNew}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Save as New Invoice
          </button>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-xl text-center">
            <h4 className="text-lg font-semibold mb-3">Overwrite current invoice?</h4>
            <p className="text-sm text-gray-600 mb-4">
              This will replace your current invoice form with the selected history item.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmViewHistory}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Yes, Load
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
