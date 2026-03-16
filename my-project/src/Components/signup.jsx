import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import GoogleLoginBtn from './googleLoginBtn';
const API=import.meta.env.VITE_BACKEND_API;

const Signup = () => {

  const navigate = useNavigate();
  const [error, setError] = useState(null)

  const handleSignup = async (e) => {
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    if (!name) {
      alert("Please enter your name");
      return;
    }
    if (!email.includes('@')) {
      alert("Please enter a valid email address");
      return;
    }
    if (password.length < 6) {
      alert("Ensure password is at least 6 characters long");
      return;
    }

    try {
      const response = await fetch(`${API}/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      console.log("Registration response:", data);
      alert("User registered successfully");
      navigate('/login');
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "Something went wrong. Please try again.");
      alert(err.message || "An error occurred during registration");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-bl from-zinc-900 from-35% via-zinc-600 via-50% to-zinc-900 to-65% text-zinc-100">
      <form className='signup-form flex flex-col gap-4 border border-zinc-700 p-6 rounded-lg bg-zinc-800/40 min-w-sm' onSubmit={(e) => {
        e.preventDefault();
        handleSignup(e);
      }}>
        <h2 className="text-xl font-bold">Sign Up</h2>
        <div className="flex flex-col gap-2">
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" className="focus:bg-zinc-600 bg-zinc-700 text-white p-2 rounded border border-zinc-600 " required />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" className="focus:bg-zinc-600 bg-zinc-700 text-white p-2 rounded border border-zinc-600 " required />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" className="focus:bg-zinc-600 bg-zinc-700 text-white p-2 rounded border border-zinc-600 " required />
        </div>
        <button className='flex-none px-4 py-2 border border-zinc-500 rounded-lg cursor-pointer' type="submit">Signup</button>
        <div className='flex items-center justify-center gap-2'><div className="w-full border-b border-zinc-600"></div>OR<div className="w-full border-b border-zinc-600"></div></div>
        <GoogleLoginBtn />
        <div>
          <p className="text-sm text-zinc-400 flex items-center justify-center">
            Already have an account? <Link to="/login" className="text-sm text-blue-400 hover:underline ml-1">Login</Link>
          </p>
        </div>
      </form>
    </div>
  )
}

export default Signup

