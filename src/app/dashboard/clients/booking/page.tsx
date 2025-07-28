'use client';

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { auth, db } from "@/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { toast } from "react-hot-toast";

interface Booking {
  id: string;
  date: { seconds: number };
  note: string;
}

export default function BookingPage() {
  const params = useParams();
  const clientId = Array.isArray(params?.clientId)
    ? params?.clientId[0]
    : params?.clientId || "default";

  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!auth.currentUser) return;
    const snapshot = await getDocs(
      collection(db, "users", auth.currentUser.uid, "clients", String(clientId), "bookings")
    );
    const list: Booking[] = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      return {
        id: doc.id,
        note: data.note,
        date: data.date,
      };
    });
    setBookings(list);
  }, [clientId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const addBooking = async () => {
    if (!date || !auth.currentUser) return;
    try {
      await addDoc(
        collection(db, "users", auth.currentUser.uid, "clients", String(clientId), "bookings"),
        {
          note,
          date: new Date(date),
          createdAt: serverTimestamp(),
        }
      );
      setNote("");
      setDate("");
      toast.success("Booking added");
      fetchBookings();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add booking");
    }
  };

  const deleteBooking = async (id: string) => {
    if (!auth.currentUser) return;
    try {
      await deleteDoc(
        doc(db, "users", auth.currentUser.uid, "clients", String(clientId), "bookings", id)
      );
      toast.success("Booking deleted");
      fetchBookings();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete booking");
    }
  };

  const saveEdit = async (id: string) => {
    if (!auth.currentUser) return;
    try {
      await updateDoc(
        doc(db, "users", auth.currentUser.uid, "clients", String(clientId), "bookings", id),
        { note }
      );
      toast.success("Booking updated");
      setEditingId(null);
      setNote("");
      setDate("");
      fetchBookings();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update booking");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-4">
      <h2 className="text-xl font-bold">Book a Date</h2>
      <label htmlFor="booking-date" className="block font-medium mb-1">
        Date
      </label>
      <input
        id="booking-date"
        type="date"
        className="w-full border p-2"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        placeholder="Select a date"
        title="Booking date"
      />
      <textarea
        className="w-full border p-2"
        rows={3}
        placeholder="Notes"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      {editingId ? (
        <button
          className="bg-green-600 text-white w-full p-2"
          onClick={() => saveEdit(editingId)}
        >
          Save Changes
        </button>
      ) : (
        <button
          className="bg-blue-600 text-white w-full p-2"
          onClick={addBooking}
        >
          Book
        </button>
      )}

      <h3 className="text-lg font-semibold mt-6">Previous Bookings</h3>
      <ul className="space-y-2">
        {bookings.map((b) => (
          <li key={b.id} className="border p-2 space-y-2">
            <p>
              <strong>Date:</strong> {new Date(b.date.seconds * 1000).toLocaleDateString()}
            </p>
            <p>
              <strong>Note:</strong> {b.note}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingId(b.id);
                  setNote(b.note);
                }}
                className="bg-yellow-500 text-white px-3 py-1 text-sm rounded"
              >
                Edit
              </button>
              <button
                onClick={() => deleteBooking(b.id)}
                className="bg-red-600 text-white px-3 py-1 text-sm rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
