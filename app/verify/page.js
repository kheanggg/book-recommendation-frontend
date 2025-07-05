'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthCard from '@/components/AuthCard';

export default function VerifyPage() {
  // Initialize router
  const router = useRouter();

  // Get the URL search parameters object (query params)
  const searchParams = useSearchParams();

  // Extract the 'email' parameter from the URL query string, If 'email' is not present, default to an empty string to avoid null
  const email = searchParams.get('email') || '';

  const [resendUrl, setResendUrl] = useState(null);
  const [verifyUrl, setVerifyUrl] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      router.push('/home'); // or wherever they should go
      return;
    }

    const resendUrl = sessionStorage.getItem('resendUrl');
    const verifyUrl = sessionStorage.getItem('verifyUrl');
    setResendUrl(resendUrl);
    setVerifyUrl(verifyUrl)
  }, []);

  const [code, setCode] = useState(['', '', '', '']);
  const [errors, setErrors] = useState(null);
  const [message, setMessage] = useState(null);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Only digits or empty

    // Create a copy of the current code array to maintain immutability
    const newCode = [...code];
    // Update the digit at the current index with the new value
    newCode[index] = value;
    // Update the state with the new code array
    setCode(newCode);

     // If a digit was entered and this is not the last input box
    if (value && index < 3) {
      // Find the next input element by its ID (e.g., 'code-1', 'code-2', ...)
      const nextInput = document.getElementById(`code-${index + 1}`);
       // If the next input exists, move the focus to it automatically
      if (nextInput) nextInput.focus();
    } 
  };

  // Submit verification code
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors(null);
    setMessage(null);

    const verificationCode = code.join('');
    
    if (verificationCode.length !== 4) {
      setErrors('Please enter the 4-digit verification code.');
      return;
    }

    if (!email) {
      setErrors('Email is missing from the URL.');
      return;
    }

    try {
      // Make API call to verify the code
      if (!verifyUrl) {
        setErrors('Verify URL is missing. Please register again.');
        return;
      }

      const res = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email: email, code: verificationCode }),
      });

      // Parse the response
      const data = await res.json();

      // Store token if present
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      // Check if the response is not ok
      if (!res.ok) {
        // Handle specific error cases
        if (res.status === 500) {
          throw new Error(data.message || 'Internel server error');
        }

        if (data.message === 'Email already verified.') {
          router.push('/login');
          return;
        }
        setErrors(data.message || 'Verification failed');
        return;
      }

      setMessage('Email verified successfully!');
      setTimeout(() => router.push('/choose-preferences'), 1500);

    } catch (err) {

      // Set the error message to be displayed
      setMessage(err.message);
    }

  };

  // Handle resend code
  const handleResend = async () => {
    setErrors(null);
    setMessage(null);

    try {
      if (!resendUrl) {
        setErrors('Resend URL is missing. Please register again.');
        return;
      }

      const res = await fetch(resendUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors(data.message || 'Failed to resend code.');
        return;
      }

      setMessage('Verification code resent! Please check your email.');

    } catch (err) {
      setErrors('Network error. Please try again.');
    }
  };


  return (
    <AuthCard title="Verify Your Email">
      <p className="mb-4 text-center text-gray-700">
        Enter the 4-digit code sent to <strong>{email}</strong>
      </p>

      <form>
        <div className="flex gap-3 justify-center mb-4">
          {code.map((digit, idx) => (
            <input
              key={idx}
              id={`code-${idx}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              className="w-12 h-12 text-center text-xl border rounded border-gray-700 focus:outline-yellow-400"
              autoComplete="one-time-code"
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          type="submit"
          className="w-full py-2 rounded text-white bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50"
          onClick={handleSubmit}
        >
          Verify
        </button>

        {/* Resend Button */}
        <div className='mt-4 text-end text-sm text-gray-600'>
          <button
            type="button"
            className="ml-1 text-yellow-400 hover:text-yellow-500"
            onClick={handleResend}
          >
            Resend Code
          </button>
        </div>

        {errors && <p className="text-red-500 mt-2 text-center">{errors}</p>}
        {message && <p className="text-green-600 mt-2 text-center">{message}</p>}
      </form>

    </AuthCard>
  );
}