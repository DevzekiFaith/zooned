import React, { useState } from 'react';
import { UserData, Meeting } from './types';
import { FaVideo, FaPlus, FaEllipsisV, FaCalendarAlt, FaClock, FaUser, FaLink, FaCopy, FaCheck } from 'react-icons/fa';

interface MeetingsTabProps {
  userData?: UserData | null;
  meetings: Meeting[];
  onCreateMeeting: (meeting: Omit<Meeting, 'id' | 'roomId'>) => void;
}

const MeetingsTab: React.FC<MeetingsTabProps> = ({ userData, meetings, onCreateMeeting }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMeeting, setNewMeeting] = useState<Omit<Meeting, 'id' | 'roomId'>>({
    title: '',
    description: '',
    scheduledFor: new Date(),
    participants: [],
    status: 'scheduled',
    createdBy: userData?.email || '',
    jitsiUrl: ''
  });
  const [participantEmail, setParticipantEmail] = useState('');

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateMeeting(newMeeting);
    setShowCreateForm(false);
    setNewMeeting({
      title: '',
      description: '',
      scheduledFor: new Date(),
      participants: [],
      status: 'scheduled',
      createdBy: userData?.email || '',
      jitsiUrl: ''
    });
  };

  const handleAddParticipant = () => {
    if (participantEmail && !newMeeting.participants?.includes(participantEmail)) {
      setNewMeeting({
        ...newMeeting,
        participants: [...(newMeeting.participants || []), participantEmail],
      });
      setParticipantEmail('');
    }
  };

  const handleRemoveParticipant = (emailToRemove: string) => {
    setNewMeeting({
      ...newMeeting,
      participants: (newMeeting.participants || []).filter(email => email !== emailToRemove),
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold">Meetings</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FaVideo /> Schedule Meeting
        </button>
      </div>

      {/* Create Meeting Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-4">Schedule New Meeting</h3>
          <form onSubmit={handleCreateMeeting} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                value={newMeeting.title}
                onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                placeholder="Meeting with client"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date *</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  value={newMeeting.scheduledFor ? new Date(newMeeting.scheduledFor).toISOString().split('T')[0] : ''}
                  onChange={(e) => setNewMeeting({
                    ...newMeeting,
                    scheduledFor: e.target.value ? new Date(e.target.value) : new Date()
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time *</label>
                <input
                  type="time"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  value={newMeeting.scheduledFor ? new Date(newMeeting.scheduledFor).toTimeString().substring(0, 5) : ''}
                  onChange={(e) => {
                    try {
                      const [hours, minutes] = e.target.value.split(':');
                      if (hours && minutes) {
                        const date = new Date(newMeeting.scheduledFor || new Date());
                        date.setHours(parseInt(hours, 10));
                        date.setMinutes(parseInt(minutes, 10));
                        setNewMeeting({...newMeeting, scheduledFor: date});
                      }
                    } catch (error) {
                      console.error('Error updating time:', error);
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                rows={3}
                value={newMeeting.description}
                onChange={(e) => setNewMeeting({...newMeeting, description: e.target.value})}
                placeholder="Meeting agenda and notes..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Participants</label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  value={participantEmail}
                  onChange={(e) => setParticipantEmail(e.target.value)}
                  placeholder="Add participant email..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddParticipant();
                    }
                  }}
                />
                <button
                  type="button"
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  onClick={handleAddParticipant}
                >
                  <FaPlus />
                </button>
              </div>
              {newMeeting.participants.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {newMeeting.participants.map((email, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {email}
                      <button
                        type="button"
                        className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 dark:hover:bg-blue-800 dark:hover:text-blue-300"
                        onClick={() => handleRemoveParticipant(email)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Schedule Meeting
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Meetings List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {meetings.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{meeting.title}</h3>
                    {meeting.description && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{meeting.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center">
                        <FaCalendarAlt className="mr-1.5 h-3.5 w-3.5" />
                        {formatDate(meeting.scheduledFor)}
                      </span>
                      <span className="inline-flex items-center">
                        <FaClock className="mr-1.5 h-3.5 w-3.5" />
                        {formatTime(meeting.scheduledFor)}
                      </span>
                      {meeting.participants && meeting.participants.length > 0 && (
                        <span className="inline-flex items-center">
                          <FaUser className="mr-1.5 h-3.5 w-3.5" />
                          {meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative group">
                      <button
                        onClick={() => {
                          const meetingUrl = `${window.location.origin}/meeting/${meeting.roomId}`;
                          window.open(meetingUrl, '_blank');
                        }}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2"
                      >
                        <FaVideo className="h-4 w-4" />
                        Join Meeting
                      </button>
                      <div className="absolute z-10 left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 hidden group-hover:block">
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Meeting Link:</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/meeting/${meeting.roomId}`}
                            className="flex-1 text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const meetingUrl = `${window.location.origin}/meeting/${meeting.roomId}`;
                              navigator.clipboard.writeText(meetingUrl);
                              // Show copied feedback
                              const button = e.currentTarget;
                              const originalContent = button.innerHTML;
                              button.innerHTML = '<FaCheck />';
                              button.classList.add('text-green-500');
                              setTimeout(() => {
                                button.innerHTML = originalContent;
                                button.classList.remove('text-green-500');
                              }, 2000);
                            }}
                            className="p-1.5 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                            title="Copy meeting link"
                          >
                            <FaCopy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <FaVideo className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium">No upcoming meetings</h3>
            <p className="mt-1 text-sm">
              Schedule a meeting to get started.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaPlus className="-ml-1 mr-2 h-4 w-4" />
                Schedule Meeting
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingsTab;
