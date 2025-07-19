'use client'
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { auth, db } from "@/firebase";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";

export default function BookingPage() {
  const { clientId } = useParams();
  const user = auth.currentUser!;
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);

  const addBooking = async () => {
    if (!date) return;
    await addDoc(collection(db, "users", user.uid, "clients", String(clientId), "bookings"), {
      note,
      date: new Date(date),
      createdAt: serverTimestamp()
    });
    setNote("");
    setDate("");
    fetchBookings(); // refresh
  };

  const fetchBookings = async () => {
    const snapshot = await getDocs(collection(db, "users", user.uid, "clients", String(clientId), "bookings"));
    setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="max-w-md mx-auto mt-10 space-y-4">
      <h2 className="text-xl font-bold">Book a Date</h2>
      <label htmlFor="booking-date" className="block font-medium mb-1">Date</label>
      <input
        id="booking-date"
        type="date"
        className="w-full border p-2"
        value={date}
        onChange={e => setDate(e.target.value)}
        placeholder="Select a date"
        title="Booking date"
      />
      <textarea className="w-full border p-2" rows={3} placeholder="Notes" value={note} onChange={e => setNote(e.target.value)} />
      <button className="bg-blue-600 text-white w-full p-2" onClick={addBooking}>Book</button>

      <h3 className="text-lg font-semibold mt-6">Previous Bookings</h3>
      <ul className="space-y-2">
        {bookings.map(b => (
          <li key={b.id} className="border p-2">
            <p><strong>Date:</strong> {new Date(b.date.seconds * 1000).toLocaleDateString()}</p>
            <p><strong>Note:</strong> {b.note}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
// This code defines a booking page for managing client bookings in a freelance client management application.