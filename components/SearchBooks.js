"use client";

import { useEffect, useState } from "react";
import BookCard from "./BookCard";

export default function SearchBooksWithPagination() {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [filters, setFilters] = useState({ title: "", genre: "" });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const backendURL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetch(`${backendURL}/api/genres`)
      .then((res) => res.json())
      .then((data) => setGenres(data))
      .catch((err) => console.error("Error loading genres:", err));
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          ...filters,
          page,
        });

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

  return (
    <div className="max-w-7xl mx-auto px-6 p-4">
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
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
            title="Voice Search"
          >
            🎤
          </button>
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

      {/* Show loading spinner */}
      {loading && (
        <div className="flex justify-center my-8">
          <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Show no books message */}
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
              // SVG spinner
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
