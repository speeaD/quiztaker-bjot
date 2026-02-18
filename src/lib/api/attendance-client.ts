/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ApiResponse,
  AttendanceSession,
  CreateScheduleForm,
  Department,
  OpenWindowForm,
  Schedule,
  SessionAttendanceData,
  SessionWithAttendanceStatus,
  StudentAttendanceHistory,
} from "../../types/global";

const API_BASE_URL =
  process.env.BACKEND_URL || "https://bjot-backend.vercel.app/api";

async function fetchApiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  try {
    // Cookies are automatically sent with fetch requests from the browser
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",

        ...options.headers,
      },
      credentials: "include", // Important: Include cookies in requests
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }
    console.log("API Response from", endpoint, ":", data);
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

export const adminApi = {
  // Schedule Management
  async createOrUpdateSchedule(scheduleData: CreateScheduleForm) {
    const res = await fetch(`/api/attendance/schedules`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(scheduleData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.message || "Failed to create or update schedule",
      );
    }

    const data = await res.json();
    return data;
  },

  async getAllSchedules() {
    const data = await fetch(`/api/attendance/schedules`);
    if (!data.ok) {
      throw new Error("Failed to fetch all schedules");
    }
    const shchedulesData: Schedule = await data.json();
    return shchedulesData;
  },

  async getDepartmentSchedule(department: Department) {
    const res = await fetch(`/api/attendance/schedules/${department}`);
    if (!res.ok) {
      throw new Error("Failed to fetch department schedule");
    }

    const departmentSchedule = await res.json();
    console.log(`Fetched schedule for ${department}:`, departmentSchedule);
    const schedule = departmentSchedule.data;
    return schedule;
  },

  async addScheduleOverride(overrideData: {
    department: Department;
    date: string;
    classSession: any;
    reason: string;
  }) {
    return fetchApiClient<Schedule>("/attendance/admin/schedules/override", {
      method: "POST",
      body: JSON.stringify(overrideData),
    });
  },

  // Session Management
  async getSessionsForDate(date: string) {
    const data = await fetch(`/api/attendance/sessions/${date}`);
    if (!data.ok) {
      throw new Error("Failed to fetch sessions for date");
    }
    const sessionsData = await data.json();
    return sessionsData.data;
  },

  async createSessionsFromSchedule(department: Department, date: string) {
    const res = await fetch(`/api/attendance/sessions/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ department, date }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.message || "Failed to create sessions from schedule",
      );
    }

    const data = await res.json();
    return data;
  },

  async openAttendanceWindow(sessionId: string, windowConfig?: OpenWindowForm) {
    const res = await fetch(`/api/attendance/sessions/s/${sessionId}/open`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(windowConfig || {}),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Failed to open attendance window:", errorData);
      throw new Error(errorData.message || "Failed to open attendance window");
    }

    const data = await res.json();
    console.log("Attendance window opened successfully:", data);
    return data;
  },

  async closeAttendanceWindow(sessionId: string) {
    const res = await fetch(`/api/attendance/sessions/s/${sessionId}/close`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Failed to close attendance window:", errorData);
      throw new Error(errorData.message || "Failed to close attendance window");
    }

    const data = await res.json();
    console.log("Attendance window closed successfully:", data);
    return data;
  },

  // Attendance Records
  async getSessionAttendance(sessionId: string) {
    const res = await fetch(
      `/api/attendance/sessions/s/${sessionId}/attendance`,
    );
    if (!res.ok) {
      throw new Error("Failed to fetch session attendance");
    }
    const attendanceData = await res.json();
    return attendanceData.data as SessionAttendanceData;
  },

  async manuallyMarkAttendance(
    sessionId: string,
    studentId: string,
    status: "present" | "absent" | "excused",
    notes?: string,
  ) {
    return fetchApiClient(
      `/attendance/admin/sessions/${sessionId}/students/${studentId}/mark`,
      {
        method: "POST",
        body: JSON.stringify({ status, notes }),
      },
    );
  },

  // Reports
  async getStudentAttendanceReport(
    studentId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    return fetchApiClient(
      `/attendance/admin/students/${studentId}/attendance-report?${params.toString()}`,
    );
  },

  async getDepartmentSummary(
    department: Department,
    startDate?: string,
    endDate?: string,
  ) {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    return fetchApiClient(
      `/attendance/admin/departments/${department}/summary?${params.toString()}`,
    );
  },
};

export const studentApi = {
  async getTodaysClasses() {
    const res = await fetch('/api/attendance/classes');
    console.log("Raw response from today's classes API:", res);
    if (!res.ok) {
      throw new Error("Failed to fetch today's classes");
    }
    const data = await res.json();
    return data;
  },

  async markAttendance(sessionId: string) {
    const res = await fetch(`/api/attendance/session/${sessionId}`, {
      method: 'POST',
      body: JSON.stringify({  }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.message || "Failed to mark attendance for session",
      );
    }

    const data = await res.json();
    return data;
  },

  async getAttendanceHistory() {
    const res = await fetch('/api/attendance/history');
    console.log("Raw response from attendance history API:", res);
    if (!res.ok) {
      throw new Error("Failed to fetch attendance history");
    }
    const data = await res.json();
    return data as StudentAttendanceHistory;
  },

  async getWeeklySchedule() {
    const res = await fetch('/api/attendance/schedule');
    console.log("Raw response from weekly schedule API:", res);
    if (!res.ok) {
      throw new Error("Failed to fetch weekly schedule");
    }
    const data = await res.json();
    return data;
  },
};

export const serverApi = {
  student: {
    async getTodaysClasses() {
        const res = await fetch(`/api/attendance/classes`);
        console.log("Raw response from today's classes API:", res);
        if (!res.ok) {
          throw new Error("Failed to fetch today's classes");
        }
        const data = await res.json();
        return data;
    },

    async getAttendanceHistory() {
      const res = await fetch(`/api/attendance/history`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || "Failed to fetch attendance history",
        );
      }
      const data = await res.json();
      return data as StudentAttendanceHistory;
    },

    async getWeeklySchedule() {
        const res = await fetch(`/api/attendance/schedule`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.message || "Failed to fetch weekly schedule",
          );
        }
        const data = await res.json();
        return data;
      //   return fetchApiServer('/attendance/student/schedule/weekly');
    },
  },
};
