import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Dashboard from './Components/dashboard'
import Signin from './Components/signin'
import Signup from './Components/signup'
import Header from './Components/header'
import Footer from './Components/footer'
import Project from './Components/projects'
import Status from './Components/status'
import Navbar from './Components/navbar'

function App() {

  let router = createBrowserRouter([
    {
      path: "/",
      element: <><Header /><Signin /><Footer /></>
    },
    {
      path: "/login",
      element: <><Header /><Signin /><Footer /></>
    },
    {
      path: "/register",
      element: <><Header /><Signup /><Footer /></>
    },
    {
      path: "/dashboard",
      element: <><Navbar /><Dashboard /><Footer /></>
    },
    {
      path: "/projects",
      element: <><Navbar /><Project /><Footer /></>
    },
    {
      path: "/status",
      element: <><Navbar /><Status /><Footer /></>
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

