import React, { useState } from 'react';
import { IdCardIcon } from './Icons';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: Ensure fields are filled
    if (!email || !password) {
      setError('Please fill in both email and password fields.');
      return;
    }

    // Validation: Check for correct credentials
    if (email === '23cs078@nandhaengg.org' && password === '12345678'|| email==='barathvr385@gmail.com' && password==='12345678') {
      setError('');
      alert('Login successful!');
      onLogin(); // proceed to next page or dashboard
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col items-center justify-center font-sans p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-primary-100/50 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -top-40 -right-40 w-[40rem] h-[40rem] bg-indigo-100/50 rounded-full blur-3xl animate-pulse delay-500"></div>
      <div className="absolute -bottom-40 -left-40 w-[40rem] h-[40rem] bg-pink-100/50 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <header className="absolute top-0 left-0 p-6 z-10">
        <div className="flex items-center space-x-3">
          <IdCardIcon className="w-8 h-8 text-primary-600" />
          <span className="text-xl font-bold text-slate-800">CampusID Pro</span>
        </div>
      </header>

      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-2xl shadow-2xl border border-slate-200/50 z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Login</h1>
          <p className="text-slate-500 mt-2">Access the secure admin dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Username or Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="e.g., admin@university.edu"
              className="w-full bg-white/50 border border-slate-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              className="w-full bg-white/50 border border-slate-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center font-medium">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                Forgot password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 focus:ring-primary-500 transition-transform hover:scale-105"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>

      <footer className="absolute bottom-0 p-6 text-center text-sm text-slate-500 z-10">
        &copy; {new Date().getFullYear()} CampusID Pro. All rights reserved.
      </footer>
    </div>
  );
};

export default Login;
