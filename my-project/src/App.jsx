import { useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Dashboard from './Components/dashboard'
import Signin from './Components/signin'
import Signup from './Components/signup'
import Header from './Components/header'
import Footer from './Components/footer'
import Project from './Components/projects'
import Status from './Components/status'

function App() {

  let router = createBrowserRouter([
    {
      path: "/login",
      element: <Signin />
    },
    {
      path: "/register",
      element: <Signup />
    },
    {
      path: "/",
      element: <><Header /><Dashboard /><Footer /></>
    },
    {
      path: "/projects",
      element: <><Header /><Project /><Footer /></>
    },
    {
      path: "/status",
      element: <><Header /><Status /><Footer /></>
    },
    {
      path: "/project",
      element: <Project />
    }
  ])

  return (
    <>
      <div>
        <RouterProvider router={router} />
      </div>
    </>
  )
}

export default App
