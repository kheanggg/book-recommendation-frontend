"use client";

import { useEffect, useState, useRef } from "react";
import BookCard from "./BookCard";
import { Mic, X } from "lucide-react";

export default function SearchBooksWithPagination() {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [filters, setFilters] = useState({ title: "", genre: "" });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showVoiceBox, setShowVoiceBox] = useState(false);
  const [recording, setRecording] = useState(false);

  const backendURL = process.env.NEXT_PUBLIC_API_URL;
  const recognitionRef = useRef(null);

  // Fetch genres on mount
  useEffect(() => {
    fetch(`${backendURL}/api/genres`)
      .then((res) => res.json())
      .then((data) => setGenres(data))
      .catch((err) => console.error("Error loading genres:", err));
  }, []);

  // Fetch books
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ ...filters, page });
        const res = await fetch(`${backendURL}/api/books?${params.toString()}`);
        const data = await res.json();

        if (page === 1) {
          setBooks(data.data);
        } else {
          setBooks((prev) => [...prev, ...data.data]);
        }

        setHasMore(data.next_page_url !== null);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [filters, page]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setPage(1);
  };

  const loadMore = () => {
    if (hasMore) setPage((prev) => prev + 1);
  };

  // Voice Functions
  const startRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setRecording(true);
    recognition.onend = () => setRecording(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setFilters((prev) => ({ ...prev, title: transcript }));
      setPage(1);
      setShowVoiceBox(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 p-4 relative">
      {/* Search and Filter UI */}
      <div className="flex gap-4 mb-6 items-center">
        <div className="relative flex-grow">
          <input
            name="title"
            placeholder="Search by title"
            value={filters.title}
            onChange={handleFilterChange}
            className="border px-4 py-2 pr-10 rounded w-full"
          />
          <button
            type="button"
            onClick={() => setShowVoiceBox(true)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
            title="Voice Search"
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Voice Box */}
          {showVoiceBox && (
            <div className="absolute top-full mt-2 right-0 bg-white shadow-md border rounded w-72 p-4 z-50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700">Voice Search</span>
                <button onClick={() => setShowVoiceBox(false)}>
                  <X className="w-4 h-4 text-gray-500 hover:text-black" />
                </button>
              </div>
              <button
                onMouseDown={startRecognition}
                onMouseUp={stopRecognition}
                onTouchStart={startRecognition}
                onTouchEnd={stopRecognition}
                className={`w-full py-2 text-white rounded ${
                  recording ? "bg-red-500" : "bg-yellow-500"
                }`}
              >
                {recording ? "Listening..." : "Hold to Record"}
              </button>
            </div>
          )}
        </div>

        <select
          name="genre"
          value={filters.genre}
          onChange={handleFilterChange}
          className="w-40 border px-4 py-2 rounded"
        >
          <option value="">All Genres</option>
          {genres.map((genre) => (
            <option key={genre.genre_id} value={genre.name}>
              {genre.name}
            </option>
          ))}
        </select>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center my-8">
          <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* No Result */}
      {!loading && books.length === 0 && page === 1 && (
        <p className="text-center text-gray-500 my-8">
          No books found matching your criteria.
        </p>
      )}

      {/* Book Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((book) => (
          <BookCard key={book.book_id} book={book} />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && books.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMore}
            className="bg-yellow-500 hover:bg-yellow-400 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
            disabled={loading}
            aria-busy={loading}
            aria-label={loading ? "Loading" : "Load More"}
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            ) : (
              "See More"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
