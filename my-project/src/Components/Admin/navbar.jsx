import { Link, useNavigate } from 'react-router-dom'
import { useUserDataContext } from '../../Context/UserDataContext';
import Popup from 'reactjs-popup';
import { AiOutlineProject } from "react-icons/ai";
import { FiLogOut } from "react-icons/fi";
const API=import.meta.env.VITE_BACKEND_API;

const Navbar = () => {
  const { user, setUser } = useUserDataContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${API}/logout`, {
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
    <div className="fixed top-0 bg-gradient-to-r from-zinc-800 via-zinc-700 to-gray-900 text-white w-full z-50">
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
            <Link className="bg-gradient-to-l from-gray-700 via-zinc-700/50 to-gray-800/30 hover:from-gray-800/50 hover:to-gray-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200" to="/projects/create">+ New Project</Link>
          )}
          <Popup
            trigger={
              <button className="flex items-center bg-gradient-to-r from-gray-700/80 via-zinc-700/70 to-gray-900/30 hover:from-gray-800/20 hover:to-gray-700/50 text-white font-bold py-2 px-4 rounded-md cursor-pointer gap-2"><div className='size-6 bg-gray-900 rounded-lg text-sm flex justify-center items-center'>A</div> {user.name}</button>
            }
            position="bottom right"
            closeOnDocumentClick
          >
            <div className='flex flex-col mt-2 border border-zinc-700/50 rounded-xl p-1 bg-zinc-800/50 min-w-[220px] shadow-xl z-[100]'>
              <span className='text-zinc-400 px-4 py-1'>{user.email}</span>
              <button className='flex items-center gap-2 px-4 py-2 text-red-500 hover:text-red-400 border-t  mt-2 pt-2 border-zinc-700/50 w-full' onClick={handleLogout} ><FiLogOut />Logout</button>
            </div>
          </Popup>
        </div>
      </div>
    </div>
  )
}

export default Navbar

