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
    <div className="bg-gray-800 text-white w-full">
      <div className="flex justify-between items-center p-4 max-w-350 mx-auto ">
        <div><img src="./logo.png" alt="Logo" className="h-10 w-10" /></div>
        <div className="space-x-12">
          <Link to="/">Home</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/status">Status</Link>
        </div>
        <div className="space-x-4">
          <button className="bg-gray-500 hover:bg-gray-400 text-white font-bold py-2 px-4 rounded" onClick={handleLogout} >Logout</button>
        </div>
      </div>
    </div>
  )
}

export default Navbar

