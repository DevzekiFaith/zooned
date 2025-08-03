"use client";

import { useState } from "react";
import { FaCalendarPlus, FaCalendarAlt, FaClock, FaCalendarCheck, FaCopy } from "react-icons/fa";

interface Meeting {
  id: string;
  title: string;
  roomId: string;
  scheduledFor: Date;
  participants: string[];
  status: 'scheduled' | 'ongoing' | 'completed';
  description?: string;
  duration?: number;
}

interface CalendarTabProps {
  userData: any;
  meetings: Meeting[];
  onCreateMeeting: (title: string, participants: string[]) => void;
}

export default function CalendarTab({ userData, meetings, onCreateMeeting }: CalendarTabProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [participantEmail, setParticipantEmail] = useState("");

  const handleCreateMeeting = () => {
    if (meetingTitle && participantEmail) {
      onCreateMeeting(meetingTitle, [participantEmail]);
      setMeetingTitle("");
      setParticipantEmail("");
      setShowCreateForm(false);
    }
  };

  const todayMeetings = meetings.filter((meeting: Meeting) => {
    const meetingDate = new Date(meeting.scheduledFor);
    const today = new Date();
    return meetingDate.toDateString() === today.toDateString();
  });

  const upcomingMeetings = meetings.filter((meeting: Meeting) => {
    const meetingDate = new Date(meeting.scheduledFor);
    const today = new Date();
    return meetingDate > today;
  }).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Meeting Calendar</h2>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <FaCalendarPlus />
          <span>Schedule Meeting</span>
        </button>
      </div>

      {/* Create Meeting Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Schedule New Meeting</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Meeting title"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            />
            <input
              type="email"
              placeholder="Participant email"
              value={participantEmail}
              onChange={(e) => setParticipantEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            />
            <div className="flex space-x-3">
              <button onClick={handleCreateMeeting} className="btn-primary">
                Create Meeting
              </button>
              <button 
                onClick={() => setShowCreateForm(false)}
                className="btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Today's Meetings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaCalendarCheck className="text-green-600" />
            Today's Meetings
          </h3>
          {todayMeetings.length === 0 ? (
            <div className="text-center py-8">
              <FaCalendarAlt className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No meetings scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayMeetings.map((meeting: Meeting) => (
                <div key={meeting.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <h4 className="font-medium">{meeting.title}</h4>
                  <p className="text-sm text-gray-500">
                    {meeting.scheduledFor?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => window.open(`https://meet.jit.si/${meeting.roomId}`, '_blank')}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Join Now
                    </button>
                    <button 
                      onClick={() => navigator.clipboard.writeText(`https://meet.jit.si/${meeting.roomId}`)}
                      className="text-xs bg-gray-600 text-white px-3 py-1 rounded flex items-center gap-1"
                    >
                      <FaCopy className="text-xs" /> Copy Link
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Meetings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaClock className="text-blue-600" />
            Upcoming Meetings
          </h3>
          {upcomingMeetings.length === 0 ? (
            <div className="text-center py-8">
              <FaCalendarAlt className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No upcoming meetings</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingMeetings.map((meeting: Meeting) => (
                <div key={meeting.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <h4 className="font-medium">{meeting.title}</h4>
                  <p className="text-sm text-gray-500">
                    {meeting.scheduledFor?.toLocaleDateString()} at {meeting.scheduledFor?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => window.open(`https://meet.jit.si/${meeting.roomId}`, '_blank')}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Join
                    </button>
                    <button 
                      onClick={() => navigator.clipboard.writeText(`https://meet.jit.si/${meeting.roomId}`)}
                      className="text-xs bg-gray-600 text-white px-3 py-1 rounded flex items-center gap-1"
                    >
                      <FaCopy className="text-xs" /> Copy Link
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
