const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchBooks(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/api/books?${query}`);
  const data = await res.json();
  return data.data; // from Laravel pagination
}
