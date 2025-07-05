"use client";

import { useEffect, useState } from "react";
import BookCard from "./BookCard";

export default function RecommendedBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const backendURL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchRecommended = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Please login to see recommendations.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${backendURL}/api/books/recommended`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch recommendations");
        }

        const data = await res.json();
        setBooks(data.data || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommended();
  }, [backendURL]);

  // Handle loading state
  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle error
  if (error) {
    return <p className="text-red-500 text-center mt-6">{error}</p>;
  }

  // Handle empty result
  if (books.length === 0) {
    return (
      <p className="text-center text-gray-500 my-8">
        No books found matching your preferences.
      </p>
    );
  }

  // Render books
  return (
    <div className="max-w-7xl mx-auto px-6 p-4 relative">
      <h1 className="text-xl font-extrabold pb-5">Recommended Books</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((book) => (
          <BookCard key={book.book_id} book={book} />
        ))}
      </div>
    </div>
  );
}
