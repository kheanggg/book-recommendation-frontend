'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import GenreTag from '@/components/GenreTag';
import BookCard from '@/components/BookCard';
import { LoaderCircle, ArrowLeft } from 'lucide-react';

const backendURL = process.env.NEXT_PUBLIC_API_URL;

export default function BookPage() {
  const { id } = useParams();
  const router = useRouter();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [similarBooks, setSimilarBooks] = useState([]);
  const [authorBooks, setAuthorBooks] = useState([]);

  useEffect(() => {
    async function fetchBook() {
      try {
        setLoading(true);
        const res = await fetch(`${backendURL}/api/books/${id}`);
        if (!res.ok) throw new Error('Failed to fetch book');
        const data = await res.json();
        setBook(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchBook();
  }, [id]);

  useEffect(() => {
    async function fetchExtras() {
      if (!book) return;

      // Genre-based books
      const genreNames = book.genres.map((g) => g.name);
      const genreResults = await Promise.all(
        genreNames.map((name) =>
          fetch(`${backendURL}/api/books?genre=${encodeURIComponent(name)}`)
            .then((res) => res.json())
            .then((data) => data.data)
            .catch(() => [])
        )
      );

      const combinedGenreBooks = genreResults.flat();
      const uniqueGenreBooks = Array.from(
        new Map(combinedGenreBooks.map((b) => [b.book_id, b])).values()
      ).filter((b) => b.book_id !== book.book_id);

      const shuffledGenreBooks = uniqueGenreBooks.sort(() => 0.5 - Math.random());
      setSimilarBooks(shuffledGenreBooks.slice(0, 4));

      // Author-based books
      const authorRes = await fetch(
        `${backendURL}/api/books?author=${encodeURIComponent(book.author)}`
      );
      const authorData = await authorRes.json();
      const filtered = authorData.data.filter((b) => b.book_id !== book.book_id);
      const shuffledAuthorBooks = filtered.sort(() => 0.5 - Math.random());
      setAuthorBooks(shuffledAuthorBooks.slice(0, 4));
    }

    fetchExtras();
  }, [book]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <LoaderCircle className="animate-spin w-12 h-12 text-yellow-600" />
      </div>
    );

  if (error)
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-red-600">
        <p>Error loading book: {error}</p>
      </div>
    );

  if (!book)
    return (
      <div className="max-w-4xl mx-auto p-6 text-center text-gray-600">
        <p>Book not found.</p>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">
      <button
        onClick={() => router.back()}
        className="flex items-center text-yellow-600 hover:text-yellow-800 transition mb-4"
      >
        <ArrowLeft className="mr-2 w-5 h-5" />
        <span className="font-medium">Back</span>
      </button>

      <div className="text-center bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{book.title}</h1>
        <p className="text-lg text-gray-600 mb-4 italic">by {book.author}</p>

        <img
          src={`${backendURL}/${book.book_cover}`}
          alt={book.title}
          className="w-64 h-auto mx-auto mb-6 rounded-lg shadow"
        />

        <p className="text-gray-800 mb-6 leading-relaxed">{book.description}</p>

        <div className="flex flex-wrap justify-center gap-2">
          {book.genres.map((genre) => (
            <GenreTag key={genre.genre_id} name={genre.name} />
          ))}
        </div>
      </div>

      {similarBooks.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-yellow-800 mb-4">Similar Books</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {similarBooks.map((b) => (
              <BookCard key={b.book_id} book={b} />
            ))}
          </div>
        </section>
      )}

      {authorBooks.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-yellow-800 mb-4">More by {book.author}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {authorBooks.map((b) => (
              <BookCard key={b.book_id} book={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
