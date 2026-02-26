import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import GoogleLoginBtn from './googleLoginBtn';

const Signup = () => {

  const navigate = useNavigate();

  const handleInputChange = async (e) => {

    if (!e.target.name.value) {
      alert("Please enter your name");
      return;
    }
    if (!e.target.email.value.includes('@')) {
      alert("Please enter a valid email address");
      return;
    }
    if (e.target.password.value.length < 6) {
      alert("Ensure password is at least 6 characters long");
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: e.target.name.value,
          email: e.target.email.value,
          password: e.target.password.value
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      console.log("Registration response:", data);
      alert("User registered successfully");
      navigate('/login');
    } catch (error) {
      console.error("Error during registration:", error);
      alert("An error occurred during registration");
    }

    console.log("Name:", e.target.name.value, "Email:", e.target.email.value, "Password:", e.target.password.value);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-100">
      <form className='signup-form flex flex-col gap-4 border border-gray-700 p-6 rounded-lg bg-gray-800 min-w-sm' onSubmit={(e) => {
        e.preventDefault();
        handleInputChange(e);
      }}>
        <h2 className="text-xl font-bold">Sign Up</h2>
        <div className="flex flex-col gap-2">
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" className="focus:bg-gray-600 bg-gray-700 text-white p-2 rounded border border-gray-600 " required />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" className="focus:bg-gray-600 bg-gray-700 text-white p-2 rounded border border-gray-600 " required />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" className="focus:bg-gray-600 bg-gray-700 text-white p-2 rounded border border-gray-600 " required />
        </div>
        <button className='flex-none px-4 py-2 border border-gray-500 rounded-lg cursor-pointer' type="submit">Signup</button>
        <div className='flex items-center justify-center gap-2'><div className="w-full border-b border-gray-600"></div>OR<div className="w-full border-b border-gray-600"></div></div>
        <GoogleLoginBtn />
        <div>
          <p className="text-sm text-gray-400 flex items-center justify-center">
            Already have an account? <Link to="/login" className="text-sm text-blue-400 hover:underline ml-1">Login</Link>
          </p>
        </div>
      </form>
    </div>
  )
}

export default Signup

