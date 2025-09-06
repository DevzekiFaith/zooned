import React, { useState } from 'react';
import { FaStar, FaRegStar, FaPaperPlane, FaCheckCircle, FaHistory } from 'react-icons/fa';

interface Feedback {
  id: string;
  title: string;
  rating: number;
  comment: string;
  date: string;
  status: 'pending' | 'reviewed' | 'resolved';
  response?: string;
  responseDate?: string;
}

const FeedbackTab: React.FC = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  
  const [feedbackHistory, setFeedbackHistory] = useState<Feedback[]>([
    {
      id: '1',
      title: 'Great experience overall',
      rating: 5,
      comment: 'The platform is very intuitive and easy to use. I was able to find everything I needed quickly.',
      date: '2023-05-15',
      status: 'reviewed',
      response: 'Thank you for your positive feedback! We\'re glad you\'re enjoying the platform.',
      responseDate: '2023-05-16'
    },
    {
      id: '2',
      title: 'Feature request: Dark mode',
      rating: 4,
      comment: 'The platform works well, but I would love to see a dark mode option for better visibility at night.',
      date: '2023-05-10',
      status: 'resolved',
      response: 'Great news! We\'ve added dark mode in the latest update. You can enable it in your account settings.',
      responseDate: '2023-05-12'
    },
    {
      id: '3',
      title: 'Issue with file uploads',
      rating: 2,
      comment: 'I\'m having trouble uploading files larger than 10MB. The error message is not very helpful.',
      date: '2023-05-05',
      status: 'pending'
    }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (title.trim() === '' || comment.trim() === '' || rating === 0) {
      alert('Please fill in all fields and provide a rating');
      return;
    }
    
    const newFeedback: Feedback = {
      id: Date.now().toString(),
      title,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    
    setFeedbackHistory([newFeedback, ...feedbackHistory]);
    setSubmitted(true);
    
    // Reset form
    setTitle('');
    setComment('');
    setRating(0);
  };

  const renderStars = (count: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    };
    
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="text-yellow-400">
            {star <= count ? (
              <FaStar className={sizeClasses[size]} />
            ) : (
              <FaRegStar className={sizeClasses[size]} />
            )}
          </span>
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold">Feedback</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('new')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'new' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
          >
            Submit Feedback
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
          >
            <FaHistory className="inline mr-2" /> History
          </button>
        </div>
      </div>

      {activeTab === 'new' ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          {submitted ? (
            <div className="text-center py-8">
              <FaCheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Thank You for Your Feedback!</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">We appreciate you taking the time to share your thoughts with us.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit Another Feedback
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">How would you rate your experience?</h3>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="text-3xl focus:outline-none"
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => setRating(star)}
                    >
                      {star <= (hover || rating) ? (
                        <FaStar className="text-yellow-400" />
                      ) : (
                        <FaRegStar className="text-gray-300 dark:text-gray-600" />
                      )}
                    </button>
                  ))}
                  <span className="ml-3 text-sm text-gray-500">
                    {rating === 0 ? 'Select a rating' : `${rating} star${rating > 1 ? 's' : ''}`}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Briefly describe your feedback"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Your Feedback
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us more about your experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaPaperPlane className="mr-2" /> Submit Feedback
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {feedbackHistory.length > 0 ? (
            feedbackHistory.map((feedback) => (
              <div 
                key={feedback.id} 
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{feedback.title}</h3>
                      <div className="mt-1">
                        {renderStars(feedback.rating, 'sm')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(feedback.status)}`}>
                        {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(feedback.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <p className="mt-3 text-gray-600 dark:text-gray-300">
                    {feedback.comment}
                  </p>
                  
                  {feedback.response && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
                        <span className="font-medium">Response from support</span>
                        <span className="text-xs text-blue-500 dark:text-blue-400">
                          {feedback.responseDate && new Date(feedback.responseDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-blue-800 dark:text-blue-200">
                        {feedback.response}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <FaHistory className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No feedback history</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Your submitted feedback will appear here</p>
              <button
                onClick={() => setActiveTab('new')}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Submit your first feedback
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackTab;
