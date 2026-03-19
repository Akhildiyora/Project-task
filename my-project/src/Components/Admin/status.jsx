import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUserDataContext } from '../../Context/UserDataContext'
import formatDateManually from '../dateFormater';
import { MdOutlineDateRange } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";

import { useDataContext } from '../../Context/DataContext';
const API = import.meta.env.VITE_BACKEND_API;

const Status = () => {
  const navigate = useNavigate();
  const { user } = useUserDataContext();
  const { projects, refetchProjects } = useDataContext()
  const [columns, setColumns] = useState({
    upcoming: { name: "Upcoming", items: [] },
    inProgress: { name: "In Progress", items: [] },
    completed: { name: "Completed", items: [] },
  })
  const [draggedItem, setDraggedItem] = useState(null)
  console.log('projects', projects)
  useEffect(() => {
    const newColumns = {
      upcoming: { name: "Upcoming", items: projects.filter(p => !p.status || p.status === 'upcoming') },
      inProgress: { name: "In Progress", items: projects.filter(p => p.status === 'inProgress') },
      completed: { name: "Completed", items: projects.filter(p => p.status === 'completed') },
    };
    setColumns(newColumns);
  }, [projects]);
  
  const handleDragStart = (columnId, item) => {
    setDraggedItem({ columnId, item })
  }
  
  const handleDragOver = (e) => {
    e.preventDefault()
  }
  
  const handleDrop = async (e, columnId) => {
    e.preventDefault()
    if (!draggedItem) return;
    const { columnId: sourceColumnId, item } = draggedItem;
    if (sourceColumnId === columnId) return;
    
    try {
      await fetch(`${API}/projects/${item.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: columnId })
      });
      await refetchProjects();
    } catch (error) {
      console.error("Error moving project:", error);
      alert(error.message);
    }
    setDraggedItem(null)
  }

  const columnStyles = {
    upcoming: {
      header: "bg-gradient-to-r from-blue-600 to-blue-400",
      border: "border-blue-400 bg-gradient-to-r from-zinc-800 to-blue-800/20",
    },
    inProgress: {
      header: "bg-gradient-to-r from-yellow-600 to-yellow-400",
      border: "border-yellow-400 bg-gradient-to-r from-zinc-800 to-yellow-800/20",
    },
    completed: {
      header: "bg-gradient-to-r from-green-600 to-green-400",
      border: "border-green-400 bg-gradient-to-r from-zinc-800 to-green-800/20",
    }
  }

  return (
    <div>
      <div className='p-6 mt-18 w-full min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-600 flex items-start justify-center'>
        <div className='flex items-start flex-col gap-4 w-full max-w-6xl'>
          <button onClick={() => navigate('/projects')} className="flex ml-20 items-center gap-2 mb-4 cursor-pointer text-zinc-400 hover:text-white"><IoArrowBack className="text-xl" />Back to Projects</button>
          <div className='flex items-center justify-between w-full px-20 gap-4'>
            <h1 className='text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-blue-500/80 via-blue-400/80 to-sky-400'>Projects Status</h1>
          </div>
          <div className="flex flex-wrap gap-6 overflow-x-auto pb-6 w-full items-start justify-center">
            {Object.keys(columns).map((columnId) => (
              <div key={columnId} className={`flex-shrink-0 w-80 bg-zinc-800 rounded-lg shadow-x-lg border-t-4 ${columnStyles[columnId].border}`}
                onDragOver={user?.role === 'admin' ? (e) => handleDragOver(e) : undefined}
                onDrop={user?.role === 'admin' ? (e) => handleDrop(e, columnId) : undefined}
              >
                <div className={`p-4 text-white font-bold text-xl rounded-t-md ${columnStyles[columnId].header}`}>
                  {columns[columnId].name}
                  <span className="ml-2 px-2 py-1 bg-zinc-800/50 bg-opacity-30 rounded-lg text-sm">{columns[columnId].items.length}</span>
                </div>
                <div className="p-3 min-h-64 ">
                  {columns[columnId].items.length === 0 ? (
                    <div className="text-center text-zinc-500 italic text-sm ">No Projects Here</div>
                  ) : (
                    columns[columnId].items.map((item) => (
                      <div key={item.id} className={`px-4 py-2 mb-3 bg-zinc-700/20 hover:bg-zinc-700/50 text-white border border-zinc-500 shadow-md rounded-md flex items-center justify-between transform transition-all duration-200 hover:scale-105 hover:shadow-lg ${user?.role === 'admin' ? 'cursor-move' : 'cursor-default'}`}
                        draggable={user?.role === 'admin'}
                        onDragStart={user?.role === 'admin' ? () => handleDragStart(columnId, item) : undefined}>
                        <div className='flex flex-col justify-center w-full'>
                          <div className='flex items-center gap-2'>
                            <img src={item.logo} className='h-8 w-8 ' onError={(e)=>e.target.src='./logo.jpg'}/>
                            <div className="flex flex-col items-start justify-center text-sm w-full ">
                              <span className='font-semibold text-lg text-blue-300'>{item.project_name}</span>
                            </div>
                          </div>
                          <span className='text-sm text-zinc-400 px-1 line-clamp-2 truncate'>{item.description}</span>
                          
                          <div className='mt-2 flex items-center w-full justify-between border-t border-zinc-500'>
                            <Link to={`/projects/${item.id}`} className='text-xs px-3 mt-2 py-1 bg-transparent text-zinc-400 hover:text-blue-300 hover:bg-blue-500/40 rounded transition-colors text-center'>
                              Details
                            </Link>
                            <span className='text-sm text-zinc-400 flex items-center gap-2 mt-2'><MdOutlineDateRange className="" /> {formatDateManually(item.due_date)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Status
