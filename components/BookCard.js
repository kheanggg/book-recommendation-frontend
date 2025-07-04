import GenreTag from "./GenreTag";

export default function BookCard({ book }) {
  const backendURL = process.env.NEXT_PUBLIC_API_URL;

  return (
    <div className="rounded p-4 shadow-md mb-4 bg-white items-center justify-center gap-6">
        <div className="flex flex-col items-center text-center">
            <img
                src={`${backendURL}/${book.book_cover}`}
                alt={book.title}
                className="w-40 h-auto rounded"
            />
        </div>

      {/* Text container */}
      <div className="flex flex-col items-center text-center">
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
