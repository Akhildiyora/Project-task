import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

const PublicView = () => {
    const { id: projectId } = useParams();
    const [columns, setColumns] = useState({
        done: { name: "Done", items: [] },
    })
    const [project, setProject] = useState(null);

    useEffect(() => {
        if (projectId) {
            fetchProject();
            fetchfeatures();
        }
    }, [projectId]);

    const fetchProject = async () => {
        try {
            const response = await fetch(`http://localhost:3000/public/projects/${projectId}`, { credentials: 'include' });
            const data = await response.json();
            setProject(data);
        } catch (error) {
            console.error("Error fetching project:", error);
        }
    };
    const fetchfeatures = async () => {
        try {
            const response = await fetch(`http://localhost:3000/public/features?projectId=${projectId}`, { credentials: 'include' });
            if (!response.ok) {
                throw new Error(`Failed to fetch features: ${response.status}`);
            }
            const data = await response.json();
            const newColumns = {
                done: { name: "Done", items: data.filter(t => t.status === 'done') },
            };
            setColumns(newColumns);
        } catch (error) {
            console.error("Error fetching features:", error);
        }
    };

    if (!project) {
        return <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">Loading project details...</div>;
    }

    return (
        <div>
            <div className='p-6 w-full min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-600 flex items-start justify-center'>
                <div className='flex items-start justify-between gap-4 w-full max-w-6xl'>
                    <div className='text-2xl text-nowrap'>
                        {project.project_name}
                        <div>Project Details</div>

                        {project.due_date}
                        {project.description}

                    </div>
                    <div className="flex gap-6 overflow-x-auto pb-6 w-full items-start justify-center">
                        {Object.keys(columns).map((columnId) => (
                            <div key={columnId} className={`flex-shrink-0 w-80 bg-zinc-800 rounded-lg shadow-x-lg border-t-4 border-green-700`}>
                                <div className={`p-4 text-white font-bold text-xl rounded-t-md bg-gradient-to-r from-green-900 to-green-700`}>
                                    {columns[columnId].name}
                                    <span className="ml-2 px-2 py-1 bg-zinc-800 bg-opacity-30 rounded-full text-sm">{columns[columnId].items.length}</span>
                                </div>
                                <div className="p-3 min-h-64 ">
                                    {columns[columnId].items.map((item) => (
                                        <div key={item.id} className={`p-4 mb-3 bg-zinc-700 text-white shadow-md flex items-center justify-between transform transition-all duration-200 hover:scale-105 hover:shadow-lg`}
                                        >
                                            <div className='flex flex-col justify-center'>
                                                <span className='mr-2'>{item.feature}</span>
                                                <div className="flex gap-5 text-sm">
                                                    <span className='text-sm text-zinc-400'>Due On: {item.due_date}</span>
                                                    <span className='text-sm text-zinc-400'>{item.assign}</span>
                                                </div>
                                                <span className='text-sm text-zinc-400'>{item.desc}</span>
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PublicView

