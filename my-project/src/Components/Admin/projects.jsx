import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useUserDataContext } from '../../Context/UserDataContext';
import { useDataContext } from '../../Context/DataContext.jsx'
import { TbCopy, TbCopyCheckFilled } from "react-icons/tb";
import { IoMdOpen } from "react-icons/io";
import formatDateManually from '../dateFormater.jsx';
import { MdOutlineDateRange } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";
const FAPI = import.meta.env.VITE_FRONTEND_API;

const Projects = () => {
  const [copiedId, setCopiedId] = useState(null)
  const navigate = useNavigate();
  const { user } = useUserDataContext();
  const { projects, dataLoading } = useDataContext();
  const sortedProjects = [...projects].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
  const CopyUrl = async (id) => {
    const currentUrl = `${FAPI}/public/projects/${id}/features`;
    await navigator.clipboard.writeText(currentUrl);
    setCopiedId(id);

    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  }

  return (
    <div className="p-6 mt-18 bg-gradient-to-b from-zinc-900 to-zinc-600 min-h-screen text-white">
      <div className="max-w-320 mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 mb-4 text-sm sm:text-base cursor-pointer text-zinc-400 hover:text-white"><IoArrowBack className="text-xl" />Back to Dashboard</button>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Projects</h1>
            <span className='text-xs sm:text-sm text-gray-400'>Manage and Track your new Projects</span>
          </div>
          {user?.role === 'admin' && <Link to="/projects/create" className="text-sm sm:text-md bg-zinc-700 px-3 sm:px-4 py-2 rounded-md hover:bg-zinc-500 transition "><span className='sm:hidden mr-1'>+</span>Create Project</Link>}
        </div>

        {dataLoading ? (
          <p>Loading projects...</p>
        ) : sortedProjects.length === 0 ? (
          <div className="bg-zinc-800 p-8 rounded-lg text-center">
            <p className="text-zinc-400 mb-4">No projects found.</p>
            {user?.role === 'admin' && <Link to="/projects/create" className="text-blue-400 underline">Create your first project</Link>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedProjects.map(project => (
              <div key={project.id} onClick={() => navigate(`/projects/${project.id}`)} className="bg-zinc-800 hover:bg-zinc-700/40 px-4 py-2 sm:p-6 rounded-2xl shadow cursor-pointer transition border border-zinc-600">
                <div className='flex justify-between items-center'>
                  <h3 className="text-lg sm:text-xl font-medium ">{project.project_name}</h3>
                  <div className='flex items-center '>
                    <button className='cursor-pointer hover:bg-zinc-700 p-2 rounded-full' onClick={(e) => { e.stopPropagation(); CopyUrl(project.id); }}>{copiedId === project.id ? <TbCopyCheckFilled /> : <TbCopy />}</button>
                    <button className='cursor-pointer hover:bg-zinc-700 p-2 rounded-full' onClick={(e) => { e.stopPropagation(); window.open(`${FAPI}/projects/${project.id}`, '_blank'); }}><IoMdOpen /></button>
                  </div>
                </div>
                <p className="text-zinc-400 text-xs sm:text-sm sm:mt-1 mb-2 sm:mb-4 line-clamp-2">{project.description}</p>

                <div className='border-zinc-600 border-t'></div>
                <div className="flex justify-between items-center mt-2 sm:mt-4">
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

