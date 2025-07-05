'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import AuthCard from '@/components/AuthCard';
import useAuthRedirect from "@/lib/useAuthRedirect";
import Loader from "@/components/Loader";

export default function RegisterPage() {

  // State to manage form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })

  // Initialize router
  const router = useRouter();

  const checking = useAuthRedirect({
    shouldBeAuthed: false,
    redirectTo: "/home",
  });

  // State to manage errors
  const [errors, setErrors] = useState({});

  // State to manage success or error messages
  const [message, setMessage] = useState(null);

  const [loading, setLoading] = useState(false);

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
      // Make API call to register user
      const res = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(formData),
      });

      // Parse the response
      const data = await res.json();
      
      // Check if the response is not ok
      if (!res.ok) {
        // Handle specific error cases
        if (res.status === 500) {
          throw new Error(data.message || 'Internel server error');
        }
        
        // If there are validation errors, set them in state
        if (data.errors) {
          setErrors(data.errors);
          throw new Error();
        }

        throw new Error(data.message || 'Registration failed');
      }

      setMessage('Registration successful!');

      // Save resend and verify URL into sessionStorage
      sessionStorage.setItem('resendUrl', data.signed_resend_url);
      sessionStorage.setItem('verifyUrl', data.signed_verify_url);

      // Reset form data after successful registration
      setFormData({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
      });

      router.push(`/verify?email=${encodeURIComponent(formData.email)}`);

    } catch (err) {

      // Set the error message to be displayed
      setMessage(err.message);
    } finally {
      setLoading(false); // End loading
    }
  };

  if (loading) return <Loader />;

  return (
  <AuthCard title="Register">
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* Input for name */}
      <div>
        <label className="text-black text-md">Name</label>
        <input
          name="name" 
          placeholder="Name"
          type="text"
          value={formData.name} 
          onChange={handleChange} 
          required
          className={`border rounded px-4 py-2 w-full mt-1
            ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>
        )}
      </div>

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
            ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
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
            ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>
        )}
      </div>

      {/* Input for confirm password */}
      <div>
        <label className="text-black text-md">Confirm Password</label>
        <input
          name="password_confirmation"
          placeholder="Confirm Password"
          type="password"
          value={formData.password_confirmation}
          onChange={handleChange}
          required
          className={`border rounded px-4 py-2 w-full mt-1
            ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
        />
      </div>

      {/* Register Button */}
      <button
        type="submit"
        className={`py-2 rounded text-white bg-yellow-400 hover:bg-yellow-300`}
        disabled={loading}
      >
        Register
      </button>

      {message && <p className="text-center text-red-500">{message}</p>}
    </form>

    {/* Already have an account? */}
    <div className='mt-4 text-center text-sm text-gray-600'>
      <p>Already have an account?
        <a href="/login" className="ml-1 text-yellow-400 hover:text-yellow-500">
          Login here
        </a>
      </p>
      
    </div>

  </AuthCard>
  );
}