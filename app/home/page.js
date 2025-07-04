'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("authToken");
    let logoutMessage = "Logged out successfully"; // fallback

    if (token) {
      try {
        const res = await fetch("http://localhost:8000/api/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          const data = await res.json();
          setMessage(data.message || "Logout failed.");
          return;
        } else {
          const data = await res.json();
          if (data.message) {
            logoutMessage = data.message;
          }
        }
      } catch (error) {
        setMessage("Logout API error: " + error.message);
        return;
      }
    }

    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    setMessage(logoutMessage);

    // Redirect after 2 seconds, keeping message visible
    setTimeout(() => {
      router.push("/home");
    }, 2000);
  };

  return (
    <div className="p-4">
      <h1>Hello, world!</h1>

      {isLoggedIn && (
        <button
          onClick={handleLogout}
          className="mt-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
        >
          Logout
        </button>
      )}

      {message && <p className="text-center text-red-500 mt-2">{message}</p>}
    </div>
  );
}
