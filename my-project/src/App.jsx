import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom'
import Dashboard from './Components/Admin/dashboard'
import Signin from './Components/signin'
import Signup from './Components/signup'
import Header from './Components/header'
import Footer from './Components/footer'
import Projects from './Components/Admin/projects'
import Project from './Components/Admin/project/project'
import Status from './Components/Admin/status'
import Navbar from './Components/Admin/navbar'
import Kanban from './Components/Admin/project/kanban'
import Create from './Components/Admin/create'
import ProtectedRoute from './Components/ProtectedRoute'
import { UserProvider } from './Context/UserDataContext'
import { DataProvider } from './Context/DataContext'

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
      element: <><ProtectedRoute><Navbar /><Dashboard /><Footer /></ProtectedRoute></>
    },
    {
      path: "/projects/create",
      element: <><ProtectedRoute requiredRole="admin"><Navbar /><Create /><Footer /></ProtectedRoute></>
    },
    {
      path: "/projects",
      element: <><ProtectedRoute><Navbar /><Projects /><Footer /></ProtectedRoute></>
    },
    {
      path: "/status",
      element: <><ProtectedRoute requiredRole="admin"><Navbar /><Status /><Footer /></ProtectedRoute></>
    },
    {
      path: "/projects/:id",
      element: <><ProtectedRoute><Navbar /><Project /><Footer /></ProtectedRoute></>
    },
    {
      path: "/projects/:id/features",
      element: <><ProtectedRoute><Navbar /><Kanban /><Footer /></ProtectedRoute></>
    },
    {
      path: "*",
      element: <div className="h-screen bg-zinc-900 flex items-center justify-center text-white flex-col">
        <h1 className="text-4xl font-bold">404</h1>
        <p>Page Not Found</p>
        <Link to="/" className="text-blue-400 mt-4 underline">Go Home</Link>
      </div>
    }
  ])

  return (
    <>
      <div className='bg-zinc-900 text-white'>
        <DataProvider>
          <UserProvider>
            <RouterProvider router={router} />
          </UserProvider>
        </DataProvider>
      </div>
    </>
  )
}

export default App

