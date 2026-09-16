export async function logoutQuizTaker(): Promise<void> {
  const response = await fetch('/api/auth/set-cookie', { method: 'DELETE' });

  if (!response.ok) {
    throw new Error('Unable to end your session');
  }

  localStorage.removeItem('quizTaker');
  localStorage.removeItem('quizTakerEmail');
  sessionStorage.removeItem('quizSubmitReason');
}
