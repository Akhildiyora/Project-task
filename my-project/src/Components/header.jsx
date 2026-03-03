import { useNavigate } from 'react-router-dom';
import { AiOutlineProject } from "react-icons/ai";

const Header = () => {
  const navigate = useNavigate();


  return (
    <div className="bg-gray-800 text-white w-full">
      <div className="flex justify-between items-center p-4 max-w-350 mx-auto ">
        <div><AiOutlineProject className="h-10 w-10" /></div>
        <div className="space-x-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => navigate('/login')} >Login</button>
          <button className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded" onClick={() => navigate('/register')} >Register</button>
        </div>
      </div>
    </div>
  )
}

export default Header

