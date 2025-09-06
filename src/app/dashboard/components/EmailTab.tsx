import React, { useState } from 'react';
import { 
  FaEnvelope, 
  FaPaperclip, 
  FaSearch, 
  FaInbox, 
  FaStar, 
  FaRegStar, 
  FaTrash, 
  FaReply, 
  FaReplyAll, 
  FaForward, 
  FaEllipsisV, 
  FaFileAlt, 
  FaFilePdf, 
  FaDownload 
} from 'react-icons/fa';

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  time: string;
  read: boolean;
  starred: boolean;
  hasAttachment: boolean;
  labels?: string[];
}

const EmailTab: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>([
    {
      id: '1',
      from: 'john.doe@example.com',
      subject: 'Project Update: Q3 Marketing Campaign',
      preview: 'Here are the latest updates on our Q3 marketing campaign...',
      time: '10:30 AM',
      read: false,
      starred: true,
      hasAttachment: true,
      labels: ['Work', 'Important']
    },
    {
      id: '2',
      from: 'sarah.smith@example.com',
      subject: 'Meeting Notes from Yesterday',
      preview: 'As discussed in our meeting yesterday, here are the action items...',
      time: 'Yesterday',
      read: true,
      starred: false,
      hasAttachment: false,
      labels: ['Work', 'Meetings']
    },
    {
      id: '3',
      from: 'notifications@github.com',
      subject: 'Pull Request: Feature/user-authentication',
      preview: 'A new pull request has been opened in your repository...',
      time: 'Mar 15',
      read: true,
      starred: false,
      hasAttachment: false,
      labels: ['GitHub', 'Development']
    },
    {
      id: '4',
      from: 'support@stripe.com',
      subject: 'Your monthly invoice is ready',
      preview: 'Your monthly invoice for March 2023 is now available...',
      time: 'Mar 14',
      read: true,
      starred: false,
      hasAttachment: true,
      labels: ['Finance', 'Billing']
    },
    {
      id: '5',
      from: 'newsletter@medium.com',
      subject: 'Top stories for you this week',
      preview: 'Check out the most popular stories in your network this week...',
      time: 'Mar 12',
      read: true,
      starred: false,
      hasAttachment: false,
      labels: ['Newsletter']
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<'inbox' | 'starred' | 'sent' | 'drafts' | 'trash'>('inbox');
  const [showCompose, setShowCompose] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emailContent, setEmailContent] = useState({
    to: '',
    subject: '',
    body: ''
  });

  const filteredEmails = emails.filter(email => {
    const matchesSearch = 
      email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.preview.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (currentView === 'starred') {
      return matchesSearch && email.starred;
    }
    
    return matchesSearch;
  });

  const handleSelectEmail = (id: string) => {
    setSelectedEmails(prev => 
      prev.includes(id) 
        ? prev.filter(emailId => emailId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedEmails(emails.map(email => email.id));
    } else {
      setSelectedEmails([]);
    }
  };

  const handleStarEmail = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEmails(emails.map(email => 
      email.id === id ? { ...email, starred: !email.starred } : email
    ));
  };

  const handleDeleteSelected = () => {
    if (currentView === 'trash') {
      setEmails(emails.filter(email => !selectedEmails.includes(email.id)));
    } else {
      // Move to trash
      setEmails(emails.map(email => 
        selectedEmails.includes(email.id) 
          ? { ...email, labels: [...(email.labels || []), 'Trash'] } 
          : email
      ));
    }
    setSelectedEmails([]);
  };

  const handleMarkAsRead = () => {
    setEmails(emails.map(email => 
      selectedEmails.includes(email.id) ? { ...email, read: true } : email
    ));
    setSelectedEmails([]);
  };

  const handleComposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the email
    alert('Email sent successfully!');
    setShowCompose(false);
    setEmailContent({ to: '', subject: '', body: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold">Email</h2>
        <button
          onClick={() => setShowCompose(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FaEnvelope /> Compose
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-56 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-1">
            <button 
              onClick={() => setCurrentView('inbox')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${currentView === 'inbox' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <FaInbox className="text-gray-500" />
              <span>Inbox</span>
              <span className="ml-auto bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 text-xs font-medium px-2 py-0.5 rounded-full">
                {emails.filter(e => !e.read).length}
              </span>
            </button>
            <button 
              onClick={() => setCurrentView('starred')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${currentView === 'starred' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <FaStar className="text-yellow-400" />
              <span>Starred</span>
            </button>
            <button 
              onClick={() => setCurrentView('sent')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${currentView === 'sent' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <FaPaperclip className="text-gray-500" />
              <span>Sent</span>
            </button>
            <button 
              onClick={() => setCurrentView('drafts')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${currentView === 'drafts' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <FaFileAlt className="text-gray-500" />
              <span>Drafts</span>
            </button>
            <button 
              onClick={() => setCurrentView('trash')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${currentView === 'trash' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <FaTrash className="text-gray-500" />
              <span>Trash</span>
            </button>
          </div>

          <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Labels</h3>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span>Important</span>
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span>Work</span>
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span>Personal</span>
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span>Finance</span>
              </button>
            </div>
          </div>
        </div>

        {/* Email List */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Email List Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={selectedEmails.length > 0 && selectedEmails.length === filteredEmails.length}
                  onChange={handleSelectAll}
                />
                {selectedEmails.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleMarkAsRead}
                      className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      title="Mark as read"
                    >
                      <FaEnvelope className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={handleDeleteSelected}
                      className="p-1.5 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                      title="Delete"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Search emails..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Email List */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[calc(100vh-300px)] overflow-y-auto">
            {filteredEmails.length > 0 ? (
              filteredEmails.map((email) => (
                <div 
                  key={email.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer ${!email.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                  onClick={() => setSelectedEmail(email)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedEmails.includes(email.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectEmail(email.id);
                        }}
                      />
                      <button 
                        onClick={(e) => handleStarEmail(email.id, e)}
                        className="text-gray-400 hover:text-yellow-400"
                      >
                        {email.starred ? (
                          <FaStar className="h-4 w-4 text-yellow-400" />
                        ) : (
                          <FaRegStar className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-medium ${!email.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'} truncate`}>
                          {email.from}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {email.time}
                        </span>
                      </div>
                      <h4 className={`text-sm ${!email.read ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'} truncate`}>
                        {email.subject}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {email.preview}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        {email.labels?.map((label, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          >
                            {label}
                          </span>
                        ))}
                        {email.hasAttachment && (
                          <span className="text-gray-400">
                            <FaPaperclip className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <FaInbox className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p>No emails found</p>
              </div>
            )}
          </div>
        </div>

        {/* Email Detail View */}
        {selectedEmail && (
          <div className="hidden lg:block w-2/3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold">{selectedEmail.subject}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium">{selectedEmail.from}</span>
                    <span className="text-xs text-gray-500">&lt;{selectedEmail.from}&gt;</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <FaReply className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <FaReplyAll className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <FaForward className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400">
                    <FaTrash className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setSelectedEmail(null)}
                    className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <p>To: me@example.com</p>
                <p>Date: {new Date().toLocaleString()}</p>
              </div>
            </div>
            <div className="p-6">
              <div className="prose dark:prose-invert max-w-none">
                <p>Hello,</p>
                <p>This is a sample email content. In a real application, this would display the actual email content.</p>
                <p>Best regards,<br />The Sender</p>
              </div>
              
              {selectedEmail.hasAttachment && (
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-medium mb-3">Attachments</h4>
                  <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded">
                      <FaFilePdf className="h-6 w-6 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">Document.pdf</p>
                      <p className="text-xs text-gray-500">2.4 MB</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                      <FaDownload className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
              
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <FaReply className="inline mr-2" /> Reply
                </button>
                <button className="ml-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <FaForward className="inline mr-2" /> Forward
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compose Email Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl shadow-xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">New Message</h3>
                <button
                  onClick={() => setShowCompose(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
            </div>
            <form onSubmit={handleComposeSubmit}>
              <div className="p-4 space-y-4">
                <div>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border-b border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:border-blue-500"
                    placeholder="To"
                    value={emailContent.to}
                    onChange={(e) => setEmailContent({...emailContent, to: e.target.value})}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border-b border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:border-blue-500"
                    placeholder="Subject"
                    value={emailContent.subject}
                    onChange={(e) => setEmailContent({...emailContent, subject: e.target.value})}
                  />
                </div>
                <div>
                  <textarea
                    className="w-full h-64 px-3 py-2 border-0 dark:bg-gray-800 focus:outline-none resize-none"
                    placeholder="Compose email..."
                    value={emailContent.body}
                    onChange={(e) => setEmailContent({...emailContent, body: e.target.value})}
                  ></textarea>
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Send
                  </button>
                  <button
                    type="button"
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FaPaperclip className="h-5 w-5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Discard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTab;
