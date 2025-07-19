'use client'
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db, storage } from "../../../../firebase";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function DocumentsPage() {
  const { clientId } = useParams();
  const user = auth.currentUser!;
  const [file, setFile] = useState<File | null>(null);
  const [docs, setDocs] = useState<any[]>([]);

  const uploadDoc = async () => {
    if (!file) return;
    const storageRef = ref(storage, `docs/${user.uid}/${clientId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await addDoc(collection(db, "users", user.uid, "clients", String(clientId), "documents"), {
      fileName: file.name,
      fileUrl: url,
      uploadedAt: serverTimestamp()
    });
    setFile(null);
    fetchDocs(); // refresh
  };

  const fetchDocs = async () => {
    const snapshot = await getDocs(collection(db, "users", user.uid, "clients", String(clientId), "documents"));
    setDocs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Documents</h2>
      <label htmlFor="file-upload" className="block mb-2 font-medium">Select a document to upload:</label>
      <input
        id="file-upload"
        type="file"
        onChange={e => setFile(e.target.files?.[0] || null)}
        className="mb-2"
      />
      <button className="bg-blue-600 text-white px-4 py-2 mt-2" onClick={uploadDoc}>Upload</button>
      <ul className="mt-6 space-y-2">
        {docs.map(doc => (
          <li key={doc.id} className="flex justify-between items-center border p-2">
            <span>{doc.fileName}</span>
            <a href={doc.fileUrl} target="_blank" className="text-blue-500">Download</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
