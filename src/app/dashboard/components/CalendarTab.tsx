import React, { useState } from 'react';
// Using native Date methods instead of date-fns to avoid dependency
const formatDate = (date: Date, options: Intl.DateTimeFormatOptions) => {
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

const startOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const isSameDay = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

const isSameMonth = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth();
};

const isSameYear = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear();
};
import { UserData, Meeting } from './types';
import { FaChevronLeft, FaChevronRight, FaPlus, FaVideo } from 'react-icons/fa';

interface CalendarTabProps {
  userData: UserData;
  meetings?: Meeting[];
  onCreateMeeting?: (meeting: Omit<Meeting, 'id' | 'roomId'>) => void;
}

const CalendarTab: React.FC<CalendarTabProps> = ({ userData, meetings, onCreateMeeting }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventForm, setShowEventForm] = useState(false);
  
  const [newEvent, setNewEvent] = useState<Omit<Meeting, 'id' | 'roomId'>>({
    title: '',
    description: '',
    scheduledFor: new Date(),
    participants: []
  });

  const nextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const prevWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
  };

  const onDateClick = (day: Date) => {
    setSelectedDate(day);
    setNewEvent(prev => ({
      ...prev,
      scheduledFor: day
    }));
  };

  const handleCreateEvent = () => {
    if (newEvent.title.trim() && newEvent.scheduledFor) {
      if (onCreateMeeting) {
        onCreateMeeting({
          ...newEvent,
          createdBy: userData.email || '',
          status: 'scheduled' as const
        });
      }
      setShowEventForm(false);
      setNewEvent({
        title: '',
        description: '',
        scheduledFor: new Date(),
        participants: []
      });
    }
  };

  const renderHeader = () => {
    const monthName = formatDate(currentDate, { month: 'long', year: 'numeric' });
    return (
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">
            {formatDate(currentDate, { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={prevWeek}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FaChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setCurrentDate(new Date());
              setSelectedDate(new Date());
            }}
            className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Today
          </button>
          <button
            onClick={nextWeek}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FaChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentDate);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="text-center font-medium text-sm text-gray-500 dark:text-gray-400" key={i}>
          {formatDate(addDays(startDate, i), { weekday: 'short' })}
        </div>
      );
    }

    return <div className="grid grid-cols-7 gap-1 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const startDate = startOfWeek(currentDate);
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    for (let i = 0; i < 7; i++) {
      formattedDate = formatDate(day, { day: 'numeric' });
      const cloneDay = day;
      const dayMeetings = (meetings || []).filter(meeting => 
        isSameDay(new Date(meeting.scheduledFor), day)
      );

      days.push(
        <div
          className={`min-h-24 p-2 border border-gray-200 dark:border-gray-700 ${
            !isSameMonth(day, currentDate)
              ? 'bg-gray-50 dark:bg-gray-800 text-gray-400'
              : 'bg-white dark:bg-gray-800'
          } ${
            isSameDay(day, selectedDate) 
              ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700' 
              : ''
          }`}
          key={day.toString()}
          onClick={() => onDateClick(cloneDay)}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm ${
              isSameDay(day, new Date()) 
                ? 'flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white' 
                : ''
            }`}>
              {formattedDate}
            </span>
            {isSameDay(day, selectedDate) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEventForm(true);
                  setNewEvent(prev => ({
                    ...prev,
                    scheduledFor: cloneDay
                  }));
                }}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <FaPlus className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="mt-1 space-y-1 max-h-24 overflow-y-auto">
            {dayMeetings.map((meeting, idx) => (
              <div 
                key={idx}
                className="text-xs p-1 bg-blue-100 dark:bg-blue-900/50 rounded truncate cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800/70"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle meeting click (e.g., show details)
                }}
              >
                <div className="font-medium truncate">{meeting.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {formatDate(new Date(meeting.scheduledFor), { hour: 'numeric', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    
    rows.push(
      <div className="grid grid-cols-7 gap-1" key={day.toString()}>
        {days}
      </div>
    );
    
    return <div className="mb-4">{rows}</div>;
  };

  const renderSelectedDateEvents = () => {
    const selectedDateMeetings = (meetings || []).filter(meeting => {
      const meetingDate = new Date(meeting.scheduledFor);
      return isSameDay(meetingDate, selectedDate);
    });

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {formatDate(selectedDate, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          <button
            onClick={() => setShowEventForm(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <FaPlus /> Add Event
          </button>
        </div>
        
        {selectedDateMeetings.length > 0 ? (
          <div className="space-y-3">
            {selectedDateMeetings.map((meeting, idx) => (
              <div 
                key={idx}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{meeting.title}</h4>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(new Date(meeting.scheduledFor), { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </div>
                    {meeting.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {meeting.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      // Join meeting logic
                      if (meeting.roomId) {
                      window.open(`/meeting/${meeting.roomId}`, '_blank');
                    }
                    }}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <FaVideo className="h-3.5 w-3.5" />
                    Join
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <p>No events scheduled for this day.</p>
            <button
              onClick={() => setShowEventForm(true)}
              className="mt-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              Schedule an event
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold">Calendar</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={prevWeek}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FaChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setCurrentDate(new Date());
              setSelectedDate(new Date());
            }}
            className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Today
          </button>
          <button
            onClick={nextWeek}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FaChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>

      {renderSelectedDateEvents()}

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {newEvent.title ? 'Edit Event' : 'New Event'}
              </h3>
              <button
                onClick={() => setShowEventForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="Event title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                    value={newEvent.scheduledFor ? newEvent.scheduledFor.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : new Date();
                      const time = newEvent.scheduledFor || new Date();
                      date.setHours(time.getHours(), time.getMinutes());
                      setNewEvent({...newEvent, scheduledFor: date});
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time *</label>
                  <input
                    type="time"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                    value={newEvent.scheduledFor ? 
                      `${newEvent.scheduledFor.getHours().toString().padStart(2, '0')}:${newEvent.scheduledFor.getMinutes().toString().padStart(2, '0')}` 
                      : ''}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':').map(Number);
                      const date = new Date(newEvent.scheduledFor || new Date());
                      date.setHours(hours, minutes);
                      setNewEvent({...newEvent, scheduledFor: date});
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  rows={3}
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  placeholder="Event description"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEventForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {newEvent.title ? 'Update' : 'Create'} Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarTab;
