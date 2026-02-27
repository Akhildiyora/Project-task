import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Dashboard from './Components/Admin/dashboard'
import Signin from './Components/signin'
import Signup from './Components/signup'
import Header from './Components/header'
import Footer from './Components/footer'
import Project from './Components/Admin/projects'
import Status from './Components/Admin/status'
import Navbar from './Components/Admin/navbar'
import Kanban from './Components/Admin/project/kanban'
import Create from './Components/Admin/create'

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
      path: "/projects/create",
      element: <><Navbar /><Create /><Footer /></>
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
      path: "/project/kanban",
      element: <><Navbar /><Kanban /><Footer /></>
    }
  ])

  return (
    <>
      <div className='bg-zinc-900 text-white'>
        <RouterProvider router={router} />
      </div>
    </>
  )
}

export default App

