import React, { useState, useRef, useEffect } from 'react';
import { UserData } from './types';
import { FaFile, FaFilePdf, FaFileWord, FaFileExcel, FaFileImage, FaFileAlt, FaUpload, FaDownload, FaTrash, FaShare, FaEllipsisV, FaSearch, FaTimes } from 'react-icons/fa';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'xls' | 'img' | 'other';
  size: string;
  uploaded: string;
  shared: boolean;
}

const DocumentsTab: React.FC<{ userData: UserData }> = ({ userData }) => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Project_Proposal.pdf',
      type: 'pdf',
      size: '2.4 MB',
      uploaded: '2023-06-15',
      shared: true,
    },
    {
      id: '2',
      name: 'Contract_Agreement.docx',
      type: 'doc',
      size: '1.1 MB',
      uploaded: '2023-06-10',
      shared: false,
    },
    {
      id: '3',
      name: 'Budget_2023.xlsx',
      type: 'xls',
      size: '3.2 MB',
      uploaded: '2023-06-05',
      shared: true,
    },
    {
      id: '4',
      name: 'Screenshot.png',
      type: 'img',
      size: '850 KB',
      uploaded: '2023-05-28',
      shared: false,
    },
    {
      id: '5',
      name: 'Notes.txt',
      type: 'other',
      size: '15 KB',
      uploaded: '2023-05-20',
      shared: false,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<'view' | 'edit'>('view');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FaFilePdf className="text-red-500 text-xl" />;
      case 'doc':
        return <FaFileWord className="text-blue-500 text-xl" />;
      case 'xls':
        return <FaFileExcel className="text-green-500 text-xl" />;
      case 'img':
        return <FaFileImage className="text-yellow-500 text-xl" />;
      default:
        return <FaFileAlt className="text-gray-500 text-xl" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleFileSelect = (id: string) => {
    setSelectedDocuments(prev => 
      prev.includes(id) 
        ? prev.filter(docId => docId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedDocuments(documents.map(doc => doc.id));
    } else {
      setSelectedDocuments([]);
    }
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedDocuments.length} selected document(s)?`)) {
      setDocuments(docs => docs.filter(doc => !selectedDocuments.includes(doc.id)));
      setSelectedDocuments([]);
    }
  };

  const handleShareDocument = () => {
    if (selectedDocuments.length === 0) return;
    setShowShareModal(true);
  };

  const handleShareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Shared ${selectedDocuments.length} document(s) with ${shareEmail} (${sharePermission} access)`);
    setShowShareModal(false);
    setShareEmail('');
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold">Documents</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FaUpload /> Upload
          </button>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {selectedDocuments.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleShareDocument}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <FaShare /> Share
            </button>
            <button
              onClick={handleDeleteSelected}
              className="px-4 py-2 border border-red-200 dark:border-red-900 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2"
            >
              <FaTrash /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Documents List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedDocuments.length === documents.length && documents.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Size
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Uploaded
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedDocuments.includes(doc.id)}
                      onChange={() => handleFileSelect(doc.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                        {getFileIcon(doc.type)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {doc.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {doc.type.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {doc.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(doc.uploaded)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      doc.shared 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {doc.shared ? 'Shared' : 'Private'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative" ref={menuRef}>
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)}
                        className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label="Document options"
                      >
                        <FaEllipsisV className="h-4 w-4" />
                      </button>
                      {openMenuId === doc.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Add download functionality here
                              setOpenMenuId(null);
                            }}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <FaDownload className="mr-2" /> Download
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDocuments([doc.id]);
                              setShowShareModal(true);
                              setOpenMenuId(null);
                            }}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <FaShare className="mr-2" /> Share
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Are you sure you want to delete this document?')) {
                                setDocuments(docs => docs.filter(d => d.id !== doc.id));
                                setSelectedDocuments(prev => prev.filter(id => id !== doc.id));
                              }
                              setOpenMenuId(null);
                            }}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <FaTrash className="mr-2" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDocuments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    <FaFile className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p>No documents found</p>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="mt-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      Upload your first document
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Upload Document</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <FaUpload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="mb-2">Drag and drop files here or</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Browse Files
              </button>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                PDF, DOC, XLS, JPG, PNG up to 10MB
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle upload
                  setShowUploadModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Share Document</h3>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setShareEmail('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleShareSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                    placeholder="Enter email address"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Permission</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        checked={sharePermission === 'view'}
                        onChange={() => setSharePermission('view')}
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Can view</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        checked={sharePermission === 'edit'}
                        onChange={() => setSharePermission('edit')}
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Can edit</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowShareModal(false);
                    setShareEmail('');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Share
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsTab;
