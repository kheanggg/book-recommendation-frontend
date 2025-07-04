'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BookList from "@/components/BookList";
import SearchBooks from '@/components/SearchBooks';

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
    let logoutMessage = "Logged out successfully";

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

        const data = await res.json();
        if (!res.ok) {
          setMessage(data.message || "Logout failed.");
          return;
        }
        if (data.message) logoutMessage = data.message;
      } catch (error) {
        setMessage("Logout API error: " + error.message);
        return;
      }
    }

    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    setMessage(logoutMessage);

    setTimeout(() => {
      router.push("/home");
    }, 2000);
  };

  return (
    <div className="p-4">
      <SearchBooks />
    </div>
  );
}
