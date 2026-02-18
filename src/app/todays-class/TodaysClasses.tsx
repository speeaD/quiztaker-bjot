/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { studentApi } from '../../lib/api/attendance-client';
import { SessionWithAttendanceStatus } from '../../types/global';
import {
  formatTime,
  formatDate,
  getTodayDate,
  getTimeRemaining,
  getRelativeTime,
  isSessionActive,
} from '@/lib/utils/attendance-utils';

export default function TodaysClassesClient({
  initialClasses,
  initialError
}: {
  initialClasses: SessionWithAttendanceStatus[];
  initialError?: string | null;
}) {
  const [classes, setClasses] = useState<SessionWithAttendanceStatus[]>(initialClasses);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(initialError || '');
  const [successMessage, setSuccessMessage] = useState('');
  const [markingAttendance, setMarkingAttendance] = useState<string | null>(null);

  useEffect(() => {
    loadTodaysClasses();
  }, []);

  // Poll for updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadTodaysClasses();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadTodaysClasses = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await studentApi.getTodaysClasses();
      console.log("Response from getTodaysClasses API:", response);
      setClasses(response?.classes || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load classes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAttendance = async (sessionId: string) => {
    setMarkingAttendance(sessionId);
    setError('');
    setSuccessMessage('');

    try {
      await studentApi.markAttendance(sessionId);
      setSuccessMessage('Attendance marked successfully!');
      loadTodaysClasses();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to mark attendance');
    } finally {
      setMarkingAttendance(null);
    }
  };

  const ClassCard = ({ session }: { session: SessionWithAttendanceStatus }) => {
    const isWindowOpen = session.attendanceWindow.isOpen;
    const isActive = isSessionActive(session.scheduledStartTime, session.scheduledEndTime);
    const hasMarkedAttendance = session.attendanceMarked;
    
    const timeRemaining = isWindowOpen && session.attendanceWindow.openedAt
      ? getTimeRemaining(session.attendanceWindow.openedAt, session.attendanceWindow.durationMinutes)
      : null;

    const canMarkAttendance = isWindowOpen && !hasMarkedAttendance && (!timeRemaining || !timeRemaining.isExpired);

    return (
      <div className={`border rounded-lg p-6 transition-all ${
        isActive ? 'border-blue-500 shadow-lg' : 'border-gray-200'
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {session.questionSetTitle}
            </h3>
            <p className="text-sm text-gray-600">
              {formatTime(session.scheduledStartTime)} - {formatTime(session.scheduledEndTime)}
            </p>
          </div>
          
          {isActive && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Ongoing</span>
            </div>
          )}
        </div>

        {/* Attendance Window Status */}
        <div className="mb-4">
          {isWindowOpen ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-green-900">Attendance Window Open</span>
                </div>
                {timeRemaining && !timeRemaining.isExpired && (
                  <span className="text-sm text-green-700 font-mono bg-green-100 px-2 py-1 rounded">
                    {timeRemaining.displayText} left
                  </span>
                )}
              </div>
              <p className="text-sm text-green-700">
                You can mark your attendance now
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <div className="h-3 w-3 bg-gray-400 rounded-full"></div>
                <span className="font-medium text-gray-700">Attendance Window Closed</span>
              </div>
              <p className="text-sm text-gray-600">
                Wait for your instructor to open the attendance window
              </p>
            </div>
          )}
        </div>

        {/* Attendance Status */}
        {hasMarkedAttendance && (
          <div className={`mb-4 rounded-lg p-4 ${
            session.attendanceStatus === 'present'
              ? 'bg-green-50 border border-green-200'
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg
                  className={`w-5 h-5 ${
                    session.attendanceStatus === 'present' ? 'text-green-600' : 'text-yellow-600'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className={`font-medium ${
                  session.attendanceStatus === 'present' ? 'text-green-900' : 'text-yellow-900'
                }`}>
                  Attendance Marked
                </span>
              </div>
              <div className="text-right">
                <div className={`text-sm ${
                  session.attendanceStatus === 'present' ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {session.markedAt && getRelativeTime(session.markedAt)}
                </div>
                {session.isLate && (
                  <span className="text-xs text-orange-600 font-medium">Late</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => handleMarkAttendance(session._id)}
          disabled={!canMarkAttendance || markingAttendance === session._id}
          className={`w-full py-3 rounded-lg font-medium transition-all ${
            canMarkAttendance
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {markingAttendance === session._id
            ? 'Marking...'
            : hasMarkedAttendance
            ? 'Attendance Already Marked'
            : canMarkAttendance
            ? 'Mark Attendance'
            : 'Window Closed'}
        </button>

        {/* Session Info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Status:</span>
              <span className={`ml-2 font-medium ${
                session.status === 'ongoing' ? 'text-green-600' : 'text-gray-900'
              }`}>
                {session.status}
              </span>
            </div>
            <div className="text-right">
              <span className="text-gray-600">Students Present:</span>
              <span className="ml-2 font-medium text-gray-900">
                {session.presentCount}/{session.totalStudents}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Today&apos;s Classes</h1>
        <p className="text-gray-600">{formatDate(getTodayDate())}</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-start">
          <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 flex items-start">
          <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {successMessage}
        </div>
      )}

      {/* Classes List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your classes...</p>
        </div>
      ) : classes?.length === 0 || !classes ? (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Today</h3>
          <p className="text-gray-600">You don&apos;t have any scheduled classes for today.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {classes.map((session) => (
            <ClassCard key={session._id} session={session} />
          ))}
        </div>
      )}

      {/* Refresh Button */}
      {!isLoading && classes?.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={loadTodaysClasses}
            className="px-6 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
          >
            Refresh Classes
          </button>
        </div>
      )}
    </div>
  );
}