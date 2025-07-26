// pages/dashboard/clients/documents.tsx
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  FaUpload,
  FaDownload,
  FaShareAlt,
  FaFileAlt,
  FaArrowLeft,
} from "react-icons/fa";

export default function DocumentPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileList = Array.from(files);
      setUploadedFiles((prev) => [...prev, ...fileList]);
    }
  };

  const handleDownload = (file: File) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = (file: File) => {
    alert(
      `Pretend this link is shareable: https://yourapp.com/shared/${file.name}`
    );
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-100 via-white to-purple-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-extrabold text-blue-900">
            📂 Client Document Center
          </h1>
          <Link
            href="/"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            <FaArrowLeft /> Back to Dashboard
          </Link>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              placeholder="files"
              multiple
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-lg"
            >
              <FaUpload /> Upload New Files
            </button>
            <span className="text-sm text-gray-400 ml-auto">
              Total: {uploadedFiles.length} file
              {uploadedFiles.length !== 1 && "s"}
            </span>
          </div>

          {uploadedFiles.length === 0 ? (
            <div className="text-center py-24 border-dashed border-2 border-gray-300 rounded-2xl">
              <p className="text-gray-400 text-xl">📄 No files uploaded</p>
              <p className="text-gray-500 text-sm mt-2">
                Click the Upload button to add client documents
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="border border-gray-100 p-5 rounded-2xl bg-white shadow-md hover:shadow-lg transition duration-200 flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <FaFileAlt className="text-blue-500 text-2xl" />
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800 truncate max-w-[200px]">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {(file.size / 1024).toFixed(2)} KB
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <button
                      onClick={() => handleDownload(file)}
                      className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-1.5 rounded-md font-medium"
                    >
                      <FaDownload className="inline mr-1" /> Download
                    </button>
                    <button
                      onClick={() => handleShare(file)}
                      className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 py-1.5 rounded-md font-medium"
                    >
                      <FaShareAlt className="inline mr-1" /> Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
