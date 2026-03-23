import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom';
import { useUserDataContext } from '../../Context/UserDataContext';
import { useDataContext } from '../../Context/DataContext';
import { FaAngleRight } from "react-icons/fa6";
const API = import.meta.env.VITE_BACKEND_API;

const Dashboard = () => {
  const { user } = useUserDataContext();
  const { projects } = useDataContext();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch(`${API}/dashboard`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Unauthorized');
        }
        const data = await response.json();
        console.log("Dashboard data:", data);
        if (!user) {
          navigate('/login');
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        navigate('/login');
      }
    }

    fetchDashboardData();
  }, [user, navigate]);

  return (
    <div className='p-6 mt-18 bg-gradient-to-b from-zinc-900 to-zinc-600 min-h-screen'>
      <div className='max-w-320 mx-auto'>
        <h2 className='text-xl sm:text-2xl font-bold text-white pt-4'>Welcome back, {user?.name || 'User'}</h2>
        <div className='text-xs sm:text-sm text-gray-400'>Here's an overview of Your Project</div>
        <div className='flex flex-col sm:flex-row items-start mt-8 gap-6'>
          <div className='order-2 sm:order-1 bg-zinc-900/50 p-6 rounded-xl shadow-lg w-full border border-zinc-700/50'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg sm:text-xl font-semibold text-white '>Recent Projects</h3>
              <Link to="/projects" className='text-sm sm:text-base text-blue-500 underline hover:text-white'>View all</Link>
            </div>
            {projects && projects.length > 0 ? (
              <div className='flex flex-col gap-2 items-start text-gray-300'>
                {projects.slice(0, 5).map(project => (
                  <Link to={`/projects/${project.id}`} key={project.id} className='flex items-center w-full bg-zinc-800 border border-zinc-700 hover:border-zinc-600 rounded-xl'>
                    <div className='flex flex-col p-2 w-full'>
                      <span className='font-semibold sm:font-medium text-base sm:text-lg text-white'>{project.project_name}</span>
                      <span className='text-xs sm:text-sm text-gray-400 line-clamp-2'>{project.description}</span>
                    </div>
                    <div className='p-2 px-4 font-light'><FaAngleRight />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className='text-gray-400'>No projects found. Create a new project to get started!</p>
            )}
          </div>
          {user?.role === 'admin' && <Link to="/projects/create" className='order-1 sm:order-2 h-[15vh] sm:h-[13vw] w-full sm:w-[25vw] bg-zinc-900/50 rounded-xl border border-zinc-700/50 hover:bg-zinc-900/20 cursor-pointer flex flex-col items-center justify-center'>
            <div className='text-2xl size-8 sm:size-10 bg-white rounded-full flex items-center justify-center text-black leading-none'>+</div>

            <span>Create project</span>
            <span className='text-sm text-gray-500'>Start tracking a new Initiative</span>
          </Link>
          }
        </div>
      </div>
    </div>
  )
}

export default Dashboard

