import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useUserDataContext } from '../../Context/UserDataContext';
import { useDataContext } from '../../Context/DataContext.jsx'
import { TbCopy, TbCopyCheckFilled } from "react-icons/tb";
import { IoMdOpen } from "react-icons/io";

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
    <div className="p-6 bg-gradient-to-b from-zinc-900 to-zinc-600 min-h-screen text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Projects</h1>
          {user.role === 'admin' && <Link to="/projects/create" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500 transition">Create New</Link>}
        </div>

        {dataLoading ? (
          <p>Loading projects...</p>
        ) : projects.length === 0 ? (
          <div className="bg-zinc-800 p-8 rounded-lg text-center">
            <p className="text-zinc-400 mb-4">No projects found.</p>
            {user.role === 'admin' && <Link to="/projects/create" className="text-blue-400 underline">Create your first project</Link>}
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map(project => (
              <div key={project.id} className="bg-zinc-800 p-4 rounded-lg shadow hover:bg-zinc-750 transition ">
                <div className='flex justify-between items-center'>
                  <h3 onClick={() => navigate(`/projects/${project.id}`)} className="text-xl font-semibold cursor-pointer">{project.project_name}</h3>
                  <div className='flex items-center gap-4'>
                    <button className='cursor-pointer hover:bg-zinc-700 p-2 rounded-full' onClick={() => CopyUrl(project.id)}>{copiedId === project.id ? <TbCopyCheckFilled /> : <TbCopy />}</button>
                    <button className='cursor-pointer hover:bg-zinc-700 p-2 rounded-full' onClick={() => window.open(`http://localhost:5173/projects/${project.id}`, '_blank')}><IoMdOpen /></button>
                  </div>
                </div>
                <p className="text-zinc-400 text-sm mt-1">{project.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-zinc-500">Due: {project.due_date}</span>
                  <button onClick={(e) => { e.stopPropagation(); navigate(`/projects/${project.id}/features`); }} className="text-blue-400 text-sm hover:underline">Features</button>
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

