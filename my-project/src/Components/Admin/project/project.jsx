import { useParams,Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useUserDataContext } from '../../../Context/UserDataContext';
import { useDataContext } from '../../../Context/DataContext';

const Project = () => {
  const { id } = useParams();
  const { user } = useUserDataContext();
  const { projects } = useDataContext();
  const [project, setProject] = useState(null);

  useEffect(() => {
    if (projects) {
      const foundProject = projects.find(p => p.id === parseInt(id));
      setProject(foundProject);
    }
  }, [id, projects]);
console.log("Project data:", project);

  return (
    <div className="p-6 bg-gradient-to-b from-zinc-900 to-zinc-600 min-h-screen text-white">
      {project && (
        <div className="p-6 bg-zinc-800 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold text-white">{project.project_name}</h3>
          <p className="text-zinc-300 mt-2">{project.description}</p>
          <p className="text-zinc-400 mt-2">Due Date: {project.due_date}</p>
          <p className="text-zinc-400 mt-2">Members: {project.members}</p>
          <Link to={`/projects/${project.id}/features`} className="text-blue-400 text-sm hover:underline">Go To Features</Link>
        </div>
      )}
    </div>
  )
}

export default Project

