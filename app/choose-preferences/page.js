'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChoosePreferences() {
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const [token, setToken] = useState(null);

  // Fetch genres when component mounts
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    setToken(storedToken);

    fetch('http://localhost:8000/api/genres')
      .then(res => res.json())
      .then(data => setGenres(data))
      .catch(() => setError('Failed to load genres.'));
  }, []);

  // Toggle genre selection
  function toggleGenre(genreId) {
    setSelectedGenres(prev =>
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  }

  async function handleSubmit() {
    if (selectedGenres.length === 0) {
      setError('Please select at least one genre.');
      return;
    }

    if (!token) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call your Laravel API endpoint to save user preferences
      const res = await fetch('http://localhost:8000/api/user-preferences', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,  // add this!
        },
        body: JSON.stringify({ genres: selectedGenres }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to save preferences');
      }

      // On success, redirect to home page
      router.push('/home');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Choose Your Preferred Genres</h1>

      {error && (
        <p className="text-red-600 mb-4 text-center">{error}</p>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        {genres.map(genre => (
          <button
            key={genre.genre_id}
            type="button"
            onClick={() => toggleGenre(genre.genre_id)}
            className={`border rounded py-2 px-4 text-center 
              ${selectedGenres.includes(genre.genre_id) ? 'bg-yellow-400 text-white' : 'bg-white text-black'}
              hover:bg-yellow-300`}
          >
            {genre.name}
          </button>
        ))}
      </div>

      <button
        disabled={loading}
        onClick={handleSubmit}
        className="w-full bg-yellow-400 hover:bg-yellow-300 text-white font-semibold py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
}
