import { useRouter } from "next/navigation";
import { useCallback } from "react";
import GenreTag from "./GenreTag";
import Link from "next/link";

const recordGenreInteraction = async (genre_id, book_id) => {
  const token = localStorage.getItem('authToken');
  if (!token) return;

  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/genre-interact`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ genre_id, book_id })
    });
  } catch (error) {
    console.error('Failed to record genre interaction:', error.message);
  }
};

export default function BookCard({ book }) {
  const backendURL = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();

  const handleClick = useCallback(async () => {
    for (const genre of book.genres) {
      await recordGenreInteraction(genre.genre_id, book.book_id);
    }
    router.push(`/book/${book.book_id}`);
  }, [book]);

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer block rounded p-4 shadow-md mb-4 bg-white items-center justify-center gap-6 hover:shadow-lg transition-shadow duration-200"
    >
      <div className="flex flex-col items-center text-center">
        <img
          src={`${backendURL}/${book.book_cover}`}
          alt={book.title}
          className="w-40 h-auto rounded"
        />
      </div>

      <div className="flex flex-col items-center text-center mt-4">
        <h2 className="text-xl font-bold text-gray-900">{book.title}</h2>
        <p className="text-gray-700 mb-2">by {book.author}</p>

        <div className="flex flex-wrap gap-1 justify-center max-w-full">
          {book.genres.map((genre) => (
            <GenreTag key={genre.genre_id} name={genre.name} />
          ))}
        </div>
      </div>
    </div>
  );
}
