import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { useUserDataContext } from '../../Context/UserDataContext';
import { useDataContext } from '../../Context/DataContext';

const Dashboard = () => {
  const { user } = useUserDataContext();
  const { projects } = useDataContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3000/dashboard', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Unauthorized');
        }
        return response.json();
      })
      .then(data => {
        console.log("Dashboard data:", data);
      })
      .catch(error => {
        console.error("Error fetching dashboard data:", error);
        navigate('/login');
      });
  }, [navigate]);

  return (
    <div className='p-6 bg-gradient-to-b from-zinc-900 to-zinc-600 min-h-screen'>
      <div className='max-w-350 mx-auto'>
        <h2 className='text-2xl font-bold text-white py-4'>Welcome {user?.name || 'User'} to the Dashboard</h2>
        <div className='bg-zinc-800 p-6 rounded-lg shadow-lg'>
          <h3 className='text-xl font-semibold text-white mb-4'>Your Projects</h3>
          {projects && projects.length > 0 ? (
            <ul className='list-disc list-inside text-gray-300'>
              {projects.slice(0, 5).map(project => (
                <li key={project.id} className='mb-2'>
                  <span className='font-medium text-white'>{project.project_name}</span>: {project.description}
                </li>
              ))}
            </ul>
          ) : (
            <p className='text-gray-400'>No projects found. Create a new project to get started!</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

