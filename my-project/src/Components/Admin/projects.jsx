import { Link } from 'react-router-dom'

const Projects = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Projects</h1>
      <p>This is the projects page.</p>
      <Link to="/project/kanban" className="text-blue-500 hover:underline">
        Go to Kanban Board
      </Link>
    </div>
  )
}

export default Projects

