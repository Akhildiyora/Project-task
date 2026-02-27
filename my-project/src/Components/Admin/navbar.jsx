import { Link, useNavigate } from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate();

    const handleLogout = () => {
        fetch('http://localhost:3000/logout', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        localStorage.removeItem('appToken');
        alert("Logged out successfully!");
        navigate('/login');
    }

  return (
    <div className="bg-gradient-to-r from-zinc-800 via-zinc-700 to-gray-900 text-white w-full">
      <div className="flex justify-between items-center p-4 max-w-350 mx-auto ">
        <div><img src="./logo.png" alt="Logo" className="h-10 w-10" /></div>
        <div className="space-x-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-violet-400 to-blue-400">
          <Link className=' font-semibold hover:font-bold' to="/">Home</Link>
          <Link className=' font-semibold hover:font-bold' to="/projects">Projects</Link>
          <Link className=' font-semibold hover:font-bold' to="/status">Status</Link>
        </div>
        <div className="space-x-4">
          <button className="bg-gradient-to-r from-zinc-800 via-zinc-700 to-gray-700 hover:from-zinc-600 hover:to-gray-900 text-white font-bold py-2 px-4 rounded" onClick={handleLogout} >Logout</button>
        </div>
      </div>
    </div>
  )
}

export default Navbar

