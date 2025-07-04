'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("authToken");

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
          alert("Logout failed");
          return;
        }
      } catch (error) {
        alert("Logout error: " + error.message);
        return;
      }
    }

    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    router.push("/login"); // redirect to login or wherever you want
  };

  const goToPreferences = () => {
    router.push("/preferences"); // route to preferences page
  };

  return (
    <header className="bg-yellow-400 text-yellow-900 shadow-md">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-18">
        <h1
          className="text-xl font-extrabold cursor-pointer hover:text-yellow-800 transition-colors duration-300"
          onClick={() => router.push("/")}
        >
          MyBookApp
        </h1>

        <nav>
          {isLoggedIn ? (
            <div className="flex space-x-4">
              <button
                onClick={goToPreferences}
                className="bg-yellow-300 hover:bg-yellow-500 text-yellow-900 font-semibold px-3 py-1 rounded transition-colors duration-300"
              >
                Preferences
              </button>
              <button
                onClick={handleLogout}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-3 py-1 rounded transition-colors duration-300"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-3 py-1 rounded transition-colors duration-300"
            >
              Login
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
