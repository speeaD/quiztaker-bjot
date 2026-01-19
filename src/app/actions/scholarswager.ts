/* eslint-disable @typescript-eslint/no-explicit-any */
// app/actions/scholarswager.ts
'use server';

import instance from '@/lib/axios';
import { revalidatePath } from 'next/cache';

// Types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// DEBUG: Test if cookie is accessible
// async function debugCookie() {
//   const cookieStore = await cookies();
//   const authToken = cookieStore.get('auth-token')?.value;
//   console.log('🔍 Debug Cookie Info:');
//   console.log('- Auth Token:', authToken ? '✅ Found' : '❌ Not found');
//   console.log('- Token Length:', authToken?.length || 0);
//   console.log('- Token Preview:', authToken?.substring(0, 20) + '...');
//   console.log('- All Cookies:', cookieStore.getAll().map(c => c.name));
//   return authToken;
// }

// Get available subjects
export async function getSubjects(): Promise<ApiResponse> {
  try {
    console.log('📡 Making request to:', '/games/scholarswager/subjects');
    const { data } = await instance.get('/games/scholarswager/subjects');
    
    console.log('📦 Raw response data:', data);
    console.log('📦 Data type:', typeof data);
    console.log('📦 Data.subjects:', data.subjects);
    
    // Handle different response formats
    let subjects;
    if (Array.isArray(data)) {
      // Response is directly an array
      subjects = data;
    } else if (data.subjects && Array.isArray(data.subjects)) {
      // Response has subjects property
      subjects = data.subjects;
    } else if (data.data && Array.isArray(data.data)) {
      // Response has data property
      subjects = data.data;
    } else {
      console.error('❌ Unexpected response format:', data);
      return {
        success: false,
        error: 'Unexpected response format from server'
      };
    }
    
    console.log('✅ Subjects loaded successfully:', subjects.length);
    return { success: true, data: subjects };
  } catch (error: any) {
    console.error('❌ Error fetching subjects:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
      data: error.response?.data,
    });
    
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to load subjects' 
    };
  }
}

// Start a new game
export async function startGame(questionSetId: string, userId: string): Promise<ApiResponse> {
  try {
    console.log('🎮 Starting game with questionSetId:', questionSetId);
    
    const { data } = await instance.post('/games/scholarswager/start', { 
      questionSetId,
      userId
    });
    
    console.log('📦 Start game response:', data);
    
    // Handle different response formats
    const session = data.session || data.data || data;
    
    revalidatePath('/scholars-wager');
    return { success: true, data: session };
  } catch (error: any) {
    console.error('❌ Error starting game:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to start game',
      data: error.response?.data?.sessionId
    };
  }
}

// Get next question
export async function getQuestion(sessionId: string, userId: string): Promise<ApiResponse> {
  try {
    const { data } = await instance.get(`/games/scholarswager/session/${sessionId}/question`, {
      params: { userId }
    });
    console.log('📦 Question response:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('❌ Error getting question:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to load question' 
    };
  }
}

// Submit answer
export async function submitAnswer(
  sessionId: string,
  questionId: string,
  selectedAnswer: string,
  wager: number,
  userId: string
): Promise<ApiResponse> {
  try {
    const { data } = await instance.post(`/games/scholarswager/session/${sessionId}/answer`, {
      questionId,
      selectedAnswer,
      wager,
      userId,
    });
    console.log('📦 Submit answer response:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('❌ Error submitting answer:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to submit answer' 
    };
  }
}

// Get session details
export async function getSession(sessionId: string): Promise<ApiResponse> {
  try {
    const { data } = await instance.get(`/games/scholarswager/session/${sessionId}`);
    console.log('📦 Session response:', data);
    
    // Handle different response formats
    const session = data.session || data.data || data;
    return { success: true, data: session };
  } catch (error: any) {
    console.error('❌ Error getting session:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to load session' 
    };
  }
}

// Quit game
export async function quitGame(sessionId: string): Promise<ApiResponse> {
  try {
    const { data } = await instance.post(`/games/scholarswager/session/${sessionId}/quit`);
    console.log('📦 Quit game response:', data);
    revalidatePath('/scholars-wager');
    return { success: true, data };
  } catch (error: any) {
    console.error('❌ Error quitting game:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to quit game' 
    };
  }
}

// Get leaderboard
export async function getLeaderboard(
  limit: number = 10,
  subject?: string
): Promise<ApiResponse> {
  try {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (subject) params.append('subject', subject);
    
    const { data } = await instance.get(`/games/scholarswager/leaderboard?${params}`);
    console.log('📦 Leaderboard response:', data);
    
    // Handle different response formats
    const leaderboard = data.leaderboard || data.data || data;
    return { success: true, data: leaderboard };
  } catch (error: any) {
    console.error('❌ Error getting leaderboard:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to load leaderboard' 
    };
  }
}

// Get game history
export async function getHistory(
  limit: number = 10,
  status?: string
): Promise<ApiResponse> {
  try {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (status) params.append('status', status);
    
    const { data } = await instance.get(`/games/scholarswager/history?${params}`);
    console.log('📦 History response:', data);
    
    // Handle different response formats
    const history = data.history || data.data || data;
    return { success: true, data: history };
  } catch (error: any) {
    console.error('❌ Error getting history:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to load history' 
    };
  }
}