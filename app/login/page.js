"use client";

import { useState, useEffect } from "react";
import AuthCard from "@/components/AuthCard";
import { useRouter } from "next/navigation";
import useAuthRedirect from "@/lib/useAuthRedirect";
import Loader from "@/components/Loader";

export default function LoginPage() {
  // State to manage form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // State to manage errors
  const [errors, setErrors] = useState({});

  // State to manage success or error messages
  const [message, setMessage] = useState(null);

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const checking = useAuthRedirect({
    shouldBeAuthed: false,
    redirectTo: "/home",
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      router.push('/home'); // or wherever they should go
      return;
    }
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null });
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setErrors({});
    setLoading(true);

    try {
      // Make API call to login user
      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      // Parse the response
      const data = await res.json();

      // Check if the response is not ok
      if (!res.ok) {
        // Handle specific error cases
        if (res.status === 500) {
          throw new Error(data.message || "Internel server error");
        }

        // If there are validation errors, set them in state
        if (data.errors) {
          setErrors(data.errors);
          throw new Error();
        }

        throw new Error(data.message || "Login failed");
      }

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }

      setMessage("Login successful!");

      // Reset form data after successful login
      setFormData({
        email: "",
        password: "",
      });

      // Redirect to home
      router.push("/home");
    } catch (err) {
      // Set the error message to be displayed
      setMessage(err.message);
    } finally {
      setLoading(false); // End loading
    }
  };

  if (loading) return <Loader />;


  return (
    
    <AuthCard title="Login">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Input for email */}
        <div>
          <label className="text-black text-md">Email</label>
          <input
            name="email"
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={`border rounded px-4 py-2 w-full mt-1
              ${errors.email ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>
          )}
        </div>

        {/* Input for password */}
        <div>
          <label className="text-black text-md">Password</label>
          <input
            name="password"
            placeholder="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            className={`border rounded px-4 py-2 w-full mt-1
              ${errors.password ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>
          )}
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="bg-yellow-400 hover:bg-yellow-300 text-white py-2 rounded"
          disabled={loading}
        >
          Login
        </button>
        {message && <p className="text-center text-red-500">{message}</p>}
      </form>

      {/* Don't have an account? */}
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>
          Don't have an account?
          <a
            href="/register"
            className="ml-1 text-yellow-400 hover:text-yellow-500"
          >
            Register here
          </a>
        </p>
      </div>
    </AuthCard>
  );
}
