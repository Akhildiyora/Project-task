import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useUserDataContext } from '../../Context/UserDataContext';
import { useDataContext } from '../../Context/DataContext.jsx'
import { TbCopy, TbCopyCheckFilled } from "react-icons/tb";
import { IoMdOpen } from "react-icons/io";
import formatDateManually from '../dateFormater.jsx';
import { MdOutlineDateRange } from "react-icons/md";


const Projects = () => {
  const [copiedId, setCopiedId] = useState(null)
  const navigate = useNavigate();
  const { user } = useUserDataContext();
  const { projects, dataLoading } = useDataContext();

  const CopyUrl = async (id) => {
    const currentUrl = `http://localhost:5173/public/projects/${id}/features`;
    await navigator.clipboard.writeText(currentUrl);
    setCopiedId(id);

    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  }

  return (
    <div className="p-6 mt-18 bg-gradient-to-b from-zinc-900 to-zinc-600 min-h-screen text-white">
      <div className="max-w-320 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Projects</h1>
            <span className='text-sm text-gray-400'>Manage and Track your new Projects</span>
          </div>
          {user.role === 'admin' && <Link to="/projects/create" className="bg-zinc-700 px-4 py-2 rounded-md hover:bg-zinc-500 transition">Create Project</Link>}
        </div>

        {dataLoading ? (
          <p>Loading projects...</p>
        ) : projects.length === 0 ? (
          <div className="bg-zinc-800 p-8 rounded-lg text-center">
            <p className="text-zinc-400 mb-4">No projects found.</p>
            {user.role === 'admin' && <Link to="/projects/create" className="text-blue-400 underline">Create your first project</Link>}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {projects.map(project => (
              <div key={project.id} className="bg-zinc-800 hover:bg-zinc-700/40 p-6 rounded-2xl shadow hover:bg-zinc-750 transition border border-zinc-600">
                <div className='flex justify-between items-center'>
                  <h3 onClick={() => navigate(`/projects/${project.id}`)} className="text-xl font-semibold cursor-pointer">{project.project_name}</h3>
                  <div className='flex items-center '>
                    <button className='cursor-pointer hover:bg-zinc-700 p-2 rounded-full' onClick={() => CopyUrl(project.id)}>{copiedId === project.id ? <TbCopyCheckFilled /> : <TbCopy />}</button>
                    <button className='cursor-pointer hover:bg-zinc-700 p-2 rounded-full' onClick={() => window.open(`http://localhost:5173/projects/${project.id}`, '_blank')}><IoMdOpen /></button>
                  </div>
                </div>
                <p className="text-zinc-400 text-sm mt-1 mb-4">{project.description}</p>

                <div className='border-zinc-600 border-t'></div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-zinc-500 flex items-center gap-2"><MdOutlineDateRange className="size-4" /><span className='text-sm'>{formatDateManually(project.due_date)}</span></span>
                  <button onClick={(e) => { e.stopPropagation(); navigate(`/projects/${project.id}/features`); }} className="text-white text-sm hover:text-blue-300 bg-zinc-700 p-1 px-2 rounded-md">Features</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Projects

