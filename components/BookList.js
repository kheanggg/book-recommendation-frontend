'use client';

import { useEffect, useState } from "react";
import BookCard from "./BookCard";

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const backendURL = process.env.NEXT_PUBLIC_API_URL;

  const fetchBooks = async (pageNumber) => {
    setLoading(true);
    try {
      const res = await fetch(`${backendURL}/api/books?page=${pageNumber}`);
      const data = await res.json();

      setBooks(prev => [...prev, ...data.data]); // Append new books
      setHasMore(data.next_page_url !== null);
    } catch (error) {
      console.error("Failed to load books:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(page);
  }, [page]);

  const loadMore = () => {
    if (hasMore) setPage(prev => prev + 1);
  };

  return (
  <div className="max-w-7xl mx-auto px-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {books.map(book => (
        <BookCard key={book.book_id} book={book} />
      ))}
    </div>

    {hasMore && (
      <div className="flex justify-center mt-6">
        <button
          onClick={loadMore}
          className="bg-yellow-500 hover:bg-yellow-400 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Loading..." : "See More"}
        </button>
      </div>
    )}
  </div>
);
}
