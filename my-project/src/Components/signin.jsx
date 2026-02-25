import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import { FcGoogle } from "react-icons/fc";

const login = () => {

  const handleLogin = (e) => {
    e.preventDefault();

    fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: e.target.email.value,
        password: e.target.password.value
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log("Login response:", data);
    })
    .catch(error => {
      console.error("Error during login:", error);
    });
    console.log("Email:", e.target.email.value, "Password:", e.target.password.value);
  }
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-100">
      <form className='login-form flex flex-col gap-4 border border-gray-700 p-6 rounded-lg bg-gray-800 min-w-sm' onSubmit={handleLogin}>
        <h2 className="text-xl font-bold">Login</h2>
        <div className="flex flex-col gap-2">
          <label htmlFor="email">email ID:</label>
          <input type="text" id="email" name="email" className="bg-gray-700 text-white p-2 rounded" />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" className="bg-gray-700 text-white p-2 rounded" />
        </div>
        <button className='flex-none px-4 py-2 border rounded-2xl cursor-pointer' type="submit">Login</button>
          <div className="text-sm text-gray-400 flex items-center justify-center">
            <Link href="http://localhost:3000/auth/google" className="text-sm text-blue-400 hover:underline ml-1"> SignIn with Google</Link>
          </div>
        <div className="text-sm text-gray-400 flex items-center justify-center">
          <p>Don't have an account? <Link to="/register" className="text-sm text-blue-400 hover:underline">Register</Link></p>
        </div>
      </form>
    </div>
  )
}

export default login
