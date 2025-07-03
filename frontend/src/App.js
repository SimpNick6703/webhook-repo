import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { 
  FaSun,
  FaMoon,
  FaExternalLinkAlt,
  FaCodeBranch,
  FaArrowRight,
  FaUserCircle
} from 'react-icons/fa';
import {
  SiGithub,
  SiReact,
  SiFlask,
  SiMongodb,
  SiTailwindcss,
  SiPython,
  SiDocker,
  SiNginx
} from 'react-icons/si';

function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    // Set dark mode as default
    document.documentElement.classList.add('dark');
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/events');
      setEvents(response.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to fetch events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // Poll every 15 seconds
    const interval = setInterval(fetchEvents, 15000);
    return () => clearInterval(interval);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  const formatEventMessage = (event) => {
    // Convert ISO timestamp to user's local timezone with readable format
    const formatTimestamp = (isoString) => {
      try {
        console.log('DEBUG: formatTimestamp input:', isoString);
        const date = new Date(isoString);
        console.log('DEBUG: parsed date object:', date);
        
        // Check if the date is valid
        if (isNaN(date.getTime())) {
          console.warn('Invalid date:', isoString);
          return isoString; // fallback to original string
        }
        
        // Format as "Jul 2, 2025 at 8:00 PM" in user's local timezone (shorter format)
        const formatted = date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        console.log('DEBUG: formatted timestamp:', formatted);
        return formatted;
      } catch (e) {
        console.error('Error formatting timestamp:', e);
        return isoString; // fallback to original string
      }
    };
    
    const timestamp = formatTimestamp(event.timestamp);
    
    switch (event.action) {
      case 'PUSH':
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <FaUserCircle className="text-blue-500" />
            <span className="font-semibold text-blue-600 dark:text-blue-400">{event.author}</span>
            <span>pushed to</span>
            <span className="font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm">
              {event.to_branch}
            </span>
            <span>on {timestamp}</span>
          </div>
        );
      case 'PULL_REQUEST':
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <FaUserCircle className="text-purple-500" />
            <span className="font-semibold text-purple-600 dark:text-purple-400">{event.author}</span>
            <span>submitted a pull request from</span>
            <span className="font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm">
              {event.from_branch}
            </span>
            <FaArrowRight className="text-gray-400" />
            <span className="font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm">
              {event.to_branch}
            </span>
            <span>on {timestamp}</span>
          </div>
        );
      case 'MERGE':
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <FaUserCircle className="text-green-500" />
            <span className="font-semibold text-green-600 dark:text-green-400">{event.author}</span>
            <span>merged branch</span>
            <span className="font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm">
              {event.from_branch}
            </span>
            <span>to</span>
            <span className="font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm">
              {event.to_branch}
            </span>
            <span>on {timestamp}</span>
          </div>
        );
      default:
        return <span>Unknown action</span>;
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'PUSH':
        return <FaCodeBranch className="text-blue-500" />;
      case 'PULL_REQUEST':
        return <FaArrowRight className="text-purple-500" />;
      case 'MERGE':
        return <FaCodeBranch className="text-green-500" />;
      default:
        return <FaCodeBranch className="text-gray-500" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'PUSH':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'PULL_REQUEST':
        return 'border-l-purple-500 bg-purple-50 dark:bg-purple-900/20';
      case 'MERGE':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SiGithub className="text-3xl text-gray-800 dark:text-white" />
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                GitHub Webhook Logger
              </h1>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {darkMode ? (
                <FaSun className="text-yellow-500" />
              ) : (
                <FaMoon className="text-blue-500" />
              )}
            </button>
          </div>
          {lastUpdated && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Last updated: {moment(lastUpdated).format('h:mm:ss A')} (Updates every 15s)
            </p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-4 text-gray-600 dark:text-gray-400">Loading events...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={fetchEvents}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 text-center">
            <SiGithub className="text-6xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No Events Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Waiting for GitHub webhook events. Push, create pull requests, or merge branches to see them here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
              Recent Activity ({events.length} events)
            </h2>
            {events.map((event, index) => (
              <div
                key={event._id}
                className={`border-l-4 p-6 rounded-r-lg shadow-sm hover:shadow-md transition-shadow ${getActionColor(event.action)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(event.action)}
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-800 dark:text-gray-200">
                      {formatEventMessage(event)}
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Request ID: {event.request_id}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Built with
            </h3>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                <SiGithub className="text-2xl" />
                <span>GitHub</span>
                <FaExternalLinkAlt className="text-xs" />
              </a>
              <a
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
              >
                <SiReact className="text-2xl" />
                <span>React</span>
                <FaExternalLinkAlt className="text-xs" />
              </a>
              <a
                href="https://flask.palletsprojects.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors"
              >
                <SiFlask className="text-2xl" />
                <span>Flask</span>
                <FaExternalLinkAlt className="text-xs" />
              </a>
              <a
                href="https://www.mongodb.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors"
              >
                <SiMongodb className="text-2xl" />
                <span>MongoDB</span>
                <FaExternalLinkAlt className="text-xs" />
              </a>
              <a
                href="https://tailwindcss.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-cyan-500 transition-colors"
              >
                <SiTailwindcss className="text-2xl" />
                <span>Tailwind CSS</span>
                <FaExternalLinkAlt className="text-xs" />
              </a>
              <a
                href="https://www.python.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-yellow-500 transition-colors"
              >
                <SiPython className="text-2xl" />
                <span>Python</span>
                <FaExternalLinkAlt className="text-xs" />
              </a>
              <a
                href="https://www.docker.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
              >
                <SiDocker className="text-2xl" />
                <span>Docker</span>
                <FaExternalLinkAlt className="text-xs" />
              </a>
              <a
                href="https://nginx.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors"
              >
                <SiNginx className="text-2xl" />
                <span>Nginx</span>
                <FaExternalLinkAlt className="text-xs" />
              </a>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
              © 2025 GitHub Webhook Logger. Built for monitoring repository activities.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
