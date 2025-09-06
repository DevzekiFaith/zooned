"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { 
  FaUpload, 
  FaDownload, 
  FaShareAlt, 
  FaFileAlt, 
  FaArrowLeft,
  FaTrash
} from "react-icons/fa";

type FileWithPreview = File & {
  preview: string;
  id: string;
};

export default function DocumentsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).map(file => ({
        ...file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9)
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDownload = (file: FileWithPreview) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async (file: FileWithPreview) => {
    const link = `https://yourapp.com/shared/${file.name}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedFile(file.id);
      setTimeout(() => setCopiedFile(null), 2000);
    } catch (err) {
      console.error('Failed to copy link: ', err);
    }
  };

  const handleDelete = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      uploadedFiles.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [uploadedFiles]);

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
              📂 Document Center
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage and share your files securely
            </p>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 neumorph hover:shadow-lg rounded-xl text-gray-700 dark:text-gray-200 transition-all"
          >
            <FaArrowLeft className="text-sm" /> Back to Dashboard
          </Link>
        </div>

        {/* Upload Section */}
        <div className="glass p-6 rounded-3xl mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              multiple
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg"
            >
              <FaUpload /> Upload Files
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded
            </span>
          </div>
        </div>

        {/* File List */}
        {uploadedFiles.length === 0 ? (
          <div className="glass p-12 text-center rounded-3xl">
            <div className="neumorph-inset p-6 inline-block rounded-2xl mb-4">
              <FaFileAlt className="text-4xl text-gray-400 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
              No files uploaded yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Drag and drop files here or click the upload button
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="neumorph p-5 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="neumorph-inset p-3 rounded-xl flex-shrink-0">
                    <FaFileAlt className="text-blue-500 text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 dark:text-gray-100 truncate">
                      {file.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleDownload(file)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                        title="Download"
                      >
                        <FaDownload size={14} />
                        <span>Download</span>
                      </button>
                      <button
                        onClick={() => handleShare(file)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm rounded-lg transition-colors"
                        title="Share"
                      >
                        <FaShareAlt size={14} />
                        <span>{copiedFile === file.id ? 'Copied!' : 'Share'}</span>
                      </button>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
