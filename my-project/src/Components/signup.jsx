import React, { useState } from 'react'
import { Link } from 'react-router-dom'



const signup = () => {

    const handleInputChange = (e) => {
        fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: e.target.name.value,
                email: e.target.email.value,
                password: e.target.password.value
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Registration response:", data);
        })
        .catch(error => {
            console.error("Error during registration:", error);
        });

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
            <input  type="text" id="name" name="name" className="bg-gray-700 text-white p-2 rounded" required/>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="email">Email:</label>
            <input  type="email" id="email" name="email" className="bg-gray-700 text-white p-2 rounded" required/>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password">Password:</label>
            <input type="password" id="password" name="password" className="bg-gray-700 text-white p-2 rounded" required/>
        </div>
        <button className='flex-none px-4 py-2 border rounded-2xl cursor-pointer' type="submit">Sign Up</button>
        <div>
        <p className="text-sm text-gray-400 flex items-center justify-center">
            Already have an account? <Link to="/login" className="text-sm text-blue-400 hover:underline ml-1">Login</Link>
            </p>
        </div>
      </form>
    </div>
  )
}

export default signup
