import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useUserDataContext } from '../../Context/UserDataContext'

const Status = () => {
  const { user } = useUserDataContext();
  const [columns, setColumns] = useState({
    upcoming: { name: "Upcoming", items: [] },
    inProgress: { name: "In Progress", items: [] },
    completed: { name: "Completed", items: [] },
  })

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`http://localhost:3000/projects`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status}`);
      }
      const data = await response.json();
      const newColumns = {
        upcoming: { name: "Upcoming", items: data.filter(p => !p.status || p.status === 'upcoming') },
        inProgress: { name: "In Progress", items: data.filter(p => p.status === 'inProgress') },
        completed: { name: "Completed", items: data.filter(p => p.status === 'completed') },
      };
      setColumns(newColumns);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const [draggedItem, setDraggedItem] = useState(null)

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
      await fetch(`http://localhost:3000/projects/${item.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: columnId })
      });
      fetchProjects();
    } catch (error) {
      console.error("Error moving project:", error);
      alert(error.message);
    }
    setDraggedItem(null)
  }

  const columnStyles = {
    upcoming: {
      header: "bg-gradient-to-r from-blue-600 to-blue-400",
      border: "border-blue-400",
    },
    inProgress: {
      header: "bg-gradient-to-r from-yellow-600 to-yellow-400",
      border: "border-yellow-400",
    },
    completed: {
      header: "bg-gradient-to-r from-green-600 to-green-400",
      border: "border-green-400",
    }
  }

  return (
    <div>
      <div className='p-6 w-full min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-600 flex items-start justify-center'>
        <div className='flex items-center flex-col gap-4 w-full max-w-6xl'>
          <div className='flex items-center justify-between w-full px-20 gap-4'>
            <h1 className='text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-500 to-rose-400'>Projects Status</h1>
          </div>
          <div className="flex flex-wrap gap-6 overflow-x-auto pb-6 w-full items-start justify-center">
            {Object.keys(columns).map((columnId) => (
              <div key={columnId} className={`flex-shrink-0 w-80 bg-zinc-800 rounded-lg shadow-x-lg border-t-4 ${columnStyles[columnId].border}`}
                onDragOver={user?.role === 'admin' ? (e) => handleDragOver(e) : undefined}
                onDrop={user?.role === 'admin' ? (e) => handleDrop(e, columnId) : undefined}
              >
                <div className={`p-4 text-white font-bold text-xl rounded-t-md ${columnStyles[columnId].header}`}>
                  {columns[columnId].name}
                  <span className="ml-2 px-2 py-1 bg-zinc-800 bg-opacity-30 rounded-full text-sm">{columns[columnId].items.length}</span>
                </div>
                <div className="p-3 min-h-64 ">
                  {columns[columnId].items.length === 0 ? (
                    <div className="text-center text-zinc-500 italic text-sm ">No Projects Here</div>
                  ) : (
                    columns[columnId].items.map((item) => (
                      <div key={item.id} className={`p-4 mb-3 bg-zinc-700 text-white shadow-md flex items-center justify-between transform transition-all duration-200 hover:scale-105 hover:shadow-lg ${user?.role === 'admin' ? 'cursor-move' : 'cursor-default'}`}
                        draggable={user?.role === 'admin'}
                        onDragStart={user?.role === 'admin' ? () => handleDragStart(columnId, item) : undefined}>
                        <div className='flex flex-col justify-center w-full'>
                          <div className='flex items-center'>
                            <img src={`${item.logo}`} alt="logo" className='h-10 w-10 m-2' />
                          <div className="flex flex-col items-start justify-center text-sm mt-1 w-full ">
                            <span className='mr-2 font-semibold text-lg text-blue-300'>{item.project_name}</span>
                            <span className='text-sm text-zinc-400'>Deadline: {item.due_date}</span>
                          </div>
                          </div>
                          <span className='text-sm text-zinc-300 mt-2 line-clamp-2'>{item.description}</span>
                          <div className='mt-3 flex items-center w-full'>
                            <Link to={`/projects/${item.id}`} className='text-xs px-3 py-1 bg-blue-500/20 text-blue-300 hover:bg-blue-500/40 rounded transition-colors w-full text-center'>
                              View Project Details
                            </Link>
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
