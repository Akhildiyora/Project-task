import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import GoogleLoginBtn from './googleLoginBtn';

const Signin = () => {

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: e.target.email.value,
          password: e.target.password.value
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed!");
        return;
      }

      alert("Login successful!");
      navigate('/dashboard');
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred during login");
    }
    console.log("Email:", e.target.email.value, "Password:", e.target.password.value);
  }
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-100">
      <form className='login-form flex flex-col gap-4 border border-gray-700 p-6 rounded-lg bg-gray-800 min-w-sm' onSubmit={handleLogin}>
        <h2 className="text-xl font-bold">Login</h2>
        <div className="flex flex-col gap-2">
          <label htmlFor="email">email ID:</label>
          <input type="text" id="email" name="email" className="focus:bg-gray-600 bg-gray-700 text-white p-2 rounded border  border-gray-600" required />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" className="focus:bg-gray-600 bg-gray-700 text-white p-2 rounded border  border-gray-600" required />
        </div>
        <button className='flex-none px-4 py-2 border border-gray-500 rounded-lg cursor-pointer' type="submit">Login</button>
        <div className='flex items-center justify-center gap-2'><div className="w-full border-b border-gray-600"></div>OR<div className="w-full border-b border-gray-600"></div></div>
        <GoogleLoginBtn />
        <div className="text-sm text-gray-400 flex items-center justify-center">
          <p>Don't have an account? <Link to="/register" className="text-sm text-blue-400 hover:underline">Register</Link></p>
        </div>
      </form>
    </div>
  )
}

export default Signin

