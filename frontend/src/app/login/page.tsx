"use client";

import { useState } from 'react';
import { apiRequest } from '../api';
import { useRouter } from 'next/navigation';
import { LucideLock, LucideMail, LucideEye, LucideEyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await apiRequest('/api/auth/local', {
        method: 'POST',
        body: JSON.stringify({ identifier: email, password }),
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
        alert('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black">
      <div className="w-full max-w-md p-10 bg-white rounded-lg shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-900">Sign In</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Welcome back! Please enter your credentials to continue.
        </p>
        <div className="mt-8 space-y-6">
          <div className="relative">
            <LucideMail className="absolute top-3 left-3 text-gray-400" size={20} />
            <input
              type="email"
              className="w-full px-10 py-3 text-gray-900 placeholder-gray-500 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <LucideLock className="absolute top-3 left-3 text-gray-400" size={20} />
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full px-10 py-3 text-gray-900 placeholder-gray-500 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <button
            className="w-full py-3 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
            onClick={handleLogin}
          >
            Sign In
          </button>
          <p className="mt-4 text-center text-sm text-gray-600">
            Don’t have an account?{' '}
            <a href="/register" className="font-medium text-blue-600 hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
