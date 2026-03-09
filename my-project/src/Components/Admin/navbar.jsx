import { Link, useNavigate } from 'react-router-dom'
import { useUserDataContext } from '../../Context/UserDataContext';
import Popup from 'reactjs-popup';
import { AiOutlineProject } from "react-icons/ai";

const Navbar = () => {
  const { user, setUser } = useUserDataContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/logout', {
        method: 'GET',
        credentials: 'include'
      });
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  if (!user) return null;

  return (
    <div className="fixed top-0 bg-gradient-to-r from-zinc-800 via-zinc-700 to-gray-900 text-white w-full">
      <div className="flex justify-between items-center p-4 max-w-350 mx-auto ">
        <div className='flex items-center gap-2 text-xl font-semibold'><AiOutlineProject className="h-10 w-10" />Projectify</div>
        <div className='border border-zinc-600 bg-zinc-800/80 p-2 px-6 rounded-full'>
          <div className="space-x-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-violet-400 to-blue-400">
            <Link className=' font-semibold hover:font-bold' to="/dashboard">Home</Link>
            <Link className=' font-semibold hover:font-bold' to="/projects">Projects</Link>
            <Link className=' font-semibold hover:font-bold' to="/status">Status</Link>
          </div>
        </div>
        <div className="flex space-x-4 ">
          {user.role === 'admin' && (
            <Link className="bg-gradient-to-r from-blue-600/50 via-violet-400/50 to-blue-500/50 text-white font-medium py-2 px-4 rounded-md hover:from-blue-500/50 hover:to-blue-400/50 transition-all duration-200" to="/projects/create">Create Project</Link>
          )}
          <Popup
            trigger={
              <button className="bg-gradient-to-r from-gray-850 via-zinc-700/50 to-gray-700/30 hover:from-gray-700/50 hover:to-gray-900/50 text-white font-bold py-2 px-4 rounded cursor-pointer">{user.name}</button>
            }
            position="bottom center"
            closeOnDocumentClick
          >
            <button className='text-white hover:text-red-400 bg-zinc-500 py-1 px-2 rounded' onClick={handleLogout} >Logout</button>
          </Popup>
        </div>
      </div>
    </div>
  )
}

export default Navbar

