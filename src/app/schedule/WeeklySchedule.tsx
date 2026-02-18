/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, JSXElementConstructor, ReactElement, ReactNode, ReactPortal } from 'react';
import { studentApi } from '../../lib/api/attendance-client';
import { ClassSession, DayOfWeek, Schedule } from '../../types/global';
import { formatTime, getDayName, getCurrentDayOfWeek } from '@/lib/utils/attendance-utils';

const DAYS: { value: DayOfWeek; label: string }[] = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' },
];

export default function WeeklyScheduleClient({
  initialSchedule,
  initialError
}: {
  initialSchedule: ClassSession[];
  initialError?: string | null;
}) {
  const [schedule, setSchedule] = useState<ClassSession[]>(initialSchedule);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(initialError || '');
  const currentDay = getCurrentDayOfWeek();

  useEffect(() => {
    loadWeeklySchedule();
  }, []);

  const loadWeeklySchedule = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await studentApi.getWeeklySchedule();
      setSchedule(response);
    } catch (err: any) {
      setError(err.message || 'Failed to load schedule');
    } finally {
      setIsLoading(false);
    }
  };

  // Group classes by day
  const groupedSchedule = schedule.reduce((acc, cls) => {
    if (!acc[cls.dayOfWeek]) {
      acc[cls.dayOfWeek] = [];
    }
    acc[cls.dayOfWeek].push(cls);
    return acc;
  }, {} as Record<DayOfWeek, ClassSession[]>);

  // Sort classes by start time within each day
  Object.keys(groupedSchedule).forEach((day) => {
    groupedSchedule[Number(day) as DayOfWeek].sort((a: { startTime: string; }, b: { startTime: any; }) => 
      a.startTime.localeCompare(b.startTime)
    );
  });

  const DaySchedule = ({ day }: { day: { value: DayOfWeek; label: string } }) => {
    const classes = groupedSchedule[day.value] || [];
    const isToday = day.value === currentDay;

    return (
      <div className={`border rounded-lg overflow-hidden transition-all ${
        isToday ? 'border-blue-500 shadow-lg' : 'border-gray-200'
      }`}>
        <div className={`px-4 py-3 font-semibold flex items-center justify-between ${
          isToday ? 'bg-blue-50 text-blue-900' : 'bg-gray-50 text-gray-900'
        }`}>
          <span>{day.label}</span>
          {isToday && (
            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
              Today
            </span>
          )}
        </div>
        
        <div className="p-4 bg-white">
          {classes.length > 0 ? (
            <div className="space-y-3">
              {classes.map((cls: { _id: any; questionSetTitle: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; startTime: string; endTime: string; }, index: any) => (
                <div
                  key={`${cls._id}-${index}`}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="font-medium text-gray-900 mb-1">
                    {cls.questionSetTitle}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 text-sm">
              <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              No classes scheduled
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Weekly Schedule</h1>
        <p className="text-gray-600">Your class schedule for the week</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {/* Summary Card */}
      <div className="mb-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">This Week&apos;s Overview</h2>
            <p className="text-blue-100">
              You have {schedule.length} {schedule.length === 1 ? 'class' : 'classes'} scheduled this week
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg px-6 py-4">
            <div className="text-4xl font-bold text-blue-600">{schedule.length}</div>
            <div className="text-sm text-blue-600">Classes</div>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : schedule.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Schedule Available</h3>
          <p className="text-gray-600">
            Your weekly class schedule hasn&apos;t been set up yet. Please contact your administrator.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DAYS.map((day) => (
            <DaySchedule key={day.value} day={day} />
          ))}
        </div>
      )}

      {/* Legend */}
      {!isLoading && schedule.length > 0 && (
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Check &quot;Today&apos;s Classes&quot; to mark attendance when windows are open</span>
            </div>
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>Be on time to avoid being marked as late</span>
            </div>
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span>View your attendance history to track your performance</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}