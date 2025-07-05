'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export default function PreferencesPage() {
  const router = useRouter();

  // State to store all genres from backend
  const [allGenres, setAllGenres] = useState([]);

  // User preferences: array of { genre_id, name, score, selected }
  const [userPreferences, setUserPreferences] = useState([]);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user preferences and all genres on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch all genres (assume GET /api/genres)
        const genresRes = await fetch('http://localhost:8000/api/genres', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!genresRes.ok) throw new Error('Failed to fetch genres');
        const genresData = await genresRes.json();
        setAllGenres(genresData);

        // Fetch user preferences with scores (assume GET /api/user-preferences)
        const prefsRes = await fetch('http://localhost:8000/api/user-preferences', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!prefsRes.ok) throw new Error('Failed to fetch user preferences');
        const prefsData = await prefsRes.json();

        // Map genres with user scores and selection state
        // prefsData expected: [{ genre_id, score }]
        // Map genresData and prefsData together:
        const merged = genresData.map((genre) => {
          const userPref = prefsData.find((p) => p.genre_id === genre.genre_id);
          return {
            ...genre,
            score: userPref ? userPref.score : 0,
            selected: Boolean(userPref),
          };
        });

        setUserPreferences(merged);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Toggle genre selection checkbox
  const toggleGenre = (genreId) => {
    setUserPreferences((prev) =>
      prev.map((g) =>
        g.genre_id === genreId ? { ...g, selected: !g.selected } : g
      )
    );
  };

  // Submit updated preferences to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const selectedGenreIds = userPreferences
        .filter((g) => g.selected)
        .map((g) => g.genre_id);

      if (selectedGenreIds.length === 0) {
        setError('Please select at least one genre.');
        return;
      }

      const res = await fetch('http://localhost:8000/api/user-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ genres: selectedGenreIds }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update preferences');
      }

      alert('Preferences updated successfully!');
      router.push('/home');
    } catch (err) {
      setError(err.message);
    }
  };

  // Colors for the chart slices
  const COLORS = [
    '#FFBB28', '#0088FE', '#00C49F', '#FF8042', '#AA47BC',
    '#FF5252', '#40C4FF', '#69F0AE', '#FFD740', '#FF4081',
  ];

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  // Data for the donut chart: only selected genres with score > 0
  const chartData = userPreferences
    .filter((g) => g.selected && g.score > 0)
    .map((g) => ({ name: g.name, value: g.score }));

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Your Preferences</h1>

      <div className="flex items-center justify-center w-full">
        {/* Donut Chart */}
        {chartData.length > 0 ? (
          <PieChart width={300} height={300}>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              fill="#8884d8"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        ) : (
          <p className="mb-4">No preferences to display yet.</p>
        )}
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => router.push('/choose-preferences')}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-white rounded shadow"
        >
          Reselect Preferences
        </button>
      </div>
    </div>

    
  );
}
