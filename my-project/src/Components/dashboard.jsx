import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {

  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3000/dashboard', {
      method: 'GET',

      headers: {
        'Authorization': `Bearer ${localStorage.getItem('appToken')}`,
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (!localStorage.getItem('appToken')) {
          alert("Please login to access the dashboard!");
          navigate('/login');
        }
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        return response.json();
      })
      .then(data => {
        console.log("Dashboard data:", data);
      })
      .catch(error => {
        console.error("Error fetching dashboard data:", error);
      });
  }, [navigate]);

  return (
    <div className='bg-gray-700 h-screen'>
      <div className='max-w-350 mx-auto'>
        <h2 className='text-2xl font-bold text-white py-4'>Welcome to the Dashboard</h2>



      </div>
    </div>
  )
}

export default Dashboard

