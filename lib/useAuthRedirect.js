'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function useAuthRedirect({ shouldBeAuthed, redirectTo }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isAuthed = !!token;

    if (shouldBeAuthed && !isAuthed) {
      // User must be logged in, but isn't
      router.replace(redirectTo); // e.g., '/login'
    } else if (!shouldBeAuthed && isAuthed) {
      // User is already logged in, redirect them away from auth pages
      router.replace(redirectTo); // e.g., '/home'
    }
  }, [router, shouldBeAuthed, redirectTo]);
}
