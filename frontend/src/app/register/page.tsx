"use client";

import { useState } from 'react';
import { apiRequest } from '../api';
import { useRouter } from 'next/navigation';
import { LucideUser, LucideMail, LucideLock, LucideEye, LucideEyeOff } from 'lucide-react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      const response = await apiRequest('/api/auth/local/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.jwt) {
        const userData = {
          id: response.user.id,
          username: response.user.username,
          email: response.user.email,
          jwt: response.jwt
        };

        localStorage.setItem('user', JSON.stringify(userData));

        router.push('/chat');
      } else {
        alert('Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black">
      <div className="w-full max-w-md p-10 bg-white rounded-lg shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-900">Create Account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join us today! Enter your details to get started.
        </p>
        <div className="mt-8 space-y-6">
          <div className="relative">
            <LucideUser className="absolute top-3 left-3 text-gray-400" size={20} />
            <input
              type="text"
              className="w-full px-10 py-3 text-gray-900 placeholder-gray-500 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="relative">
            <LucideMail className="absolute top-3 left-3 text-gray-400" size={20} />
            <input
              type="email"
              className="w-full px-10 py-3 text-gray-900 placeholder-gray-500 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <LucideLock className="absolute top-3 left-3 text-gray-400" size={20} />
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full px-10 py-3 text-gray-900 placeholder-gray-500 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute top-3 right-3 text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <LucideEyeOff size={20} /> : <LucideEye size={20} />}
            </button>
          </div>
          <div className="relative">
            <LucideLock className="absolute top-3 left-3 text-gray-400" size={20} />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              className="w-full px-10 py-3 text-gray-900 placeholder-gray-500 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute top-3 right-3 text-gray-400"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <LucideEyeOff size={20} /> : <LucideEye size={20} />}
            </button>
          </div>
          <button
            className="w-full py-3 font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300"
            onClick={handleRegister}
          >
            Sign Up
          </button>
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-purple-600 hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
