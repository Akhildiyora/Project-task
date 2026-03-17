import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GrGallery } from "react-icons/gr";
import { IoMdOpen } from "react-icons/io";
import { FaCheck } from "react-icons/fa6";
const API = import.meta.env.VITE_BACKEND_API;

const PublicView = () => {
    const { id: projectId } = useParams();
    const [columns, setColumns] = useState({
        done: { name: "Done", items: [] },
    })
    const [project, setProject] = useState(null);
    const [images, setImages] = useState([])

    useEffect(() => {
        if (projectId) {
            fetchProject();
            fetchfeatures();
        }
    }, [projectId]);

    const fetchProject = async () => {
        try {
            const response = await fetch(`${API}/public/projects/${projectId}`, { credentials: 'include' });
            const data = await response.json();
            setProject(data);

            const extractUrls = (imgData) => {
                if (typeof imgData === 'string') {
                    try {
                        if (imgData.trim().startsWith('[') || imgData.trim().startsWith('"')) {
                            const parsed = JSON.parse(imgData);
                            return extractUrls(parsed);
                        }
                        return [imgData];
                    } catch (e) {
                        return [imgData];
                    }
                }
                if (Array.isArray(imgData)) {
                    return imgData.flatMap(extractUrls);
                }
                return [];
            };

            const parsedImages = extractUrls(data.images).filter(url => typeof url === 'string' && url.startsWith('http'));
            setImages(parsedImages);
        } catch (error) {
            console.error("Error fetching project:", error);
        }
    };
    const fetchfeatures = async () => {
        try {
            const response = await fetch(`${API}/public/features?projectId=${projectId}`, { credentials: 'include' });
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
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 rounded-full border-2 border-zinc-500 border-t-transparent animate-spin"></div>
                <p className="text-zinc-500 text-[14px]">Loading project details...</p>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gradient-to-b from-zinc-900 from-80% to-zinc-600 text-zinc-100 font-sans selection:bg-blue-500/30 overflow-x-hidden'>
            <div className='max-w-320 mx-auto px-6 py-12'>

                <div className="mb-12 pb-8 border-b border-zinc-800/80">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <img src={project.logo} alt="" className='size-12' />
                                <div>
                                    <h1 className='text-3xl font-semibold tracking-tight text-white leading-tight'>{project.project_name}</h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20 flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                            Public View
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {project.description && (
                                <p className='text-base text-zinc-400 max-w-2xl leading-relaxed mb-2'>{project.description}</p>
                            )}
                            
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-10 items-start">
                    
                    <div className='flex-1 lg:max-w-3xl w-full'>
                        <h3 className='text-md font-medium text-white mb-6 flex items-center gap-2'>
                            <GrGallery />
                            Project Gallery
                        </h3>
                        
                        {images.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {images.map((imgUrl, id) => (
                                    <div key={id} className="group relative aspect-video rounded-xl overflow-hidden bg-zinc-800/50 border border-zinc-800 shadow-sm transition-all hover:border-zinc-700 hover:shadow-md">
                                        <img src={imgUrl} alt={`Gallery ${id}`} className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-115" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-start p-4">
                                            <button onClick={() => window.open(imgUrl, '_blank')} className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-2 rounded-lg transition-colors border border-white/10" title="View full size">
                                                <IoMdOpen />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="border border-dashed border-zinc-800 rounded-xl p-12 text-center bg-zinc-900/50">
                                <p className="text-sm text-zinc-500">No images have been shared for this project.</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="w-full lg:w-[380px] shrink-0">
                        {Object.keys(columns).map((columnId) => (
                            <div key={columnId} className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-lg sticky top-6">
                                <div className="px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/30">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg"></div>
                                        <h3 className="text-sm font-medium text-emerald-100">
                                            Completed Features
                                        </h3>
                                        <span className="ml-auto px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[11px] font-mono border border-emerald-500/20">
                                            {columns[columnId].items.length}
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-500 mt-1 ml-4.5">Features successfully delivered</p>
                                </div>
                                
                                <div className="p-4 max-h-[600px] overflow-y-auto custom-scrollbar flex flex-col gap-3">
                                    {columns[columnId].items.length === 0 ? (
                                        <div className="text-center p-6 border border-dashed border-zinc-800/50 rounded-xl">
                                            <p className="text-[13px] text-zinc-500">No completed features to show yet.</p>
                                        </div>
                                    ) : (
                                        columns[columnId].items.map((item) => (
                                            <div key={item.id} className="bg-zinc-900 border border-zinc-800/80 p-4 rounded-xl shadow-sm hover:border-zinc-700 transition-colors">
                                                <div className='flex items-start gap-3 mb-2'>
                                                    <div className="mt-0.5 shrink-0 text-emerald-500">
                                                        <FaCheck />
                                                    </div>
                                                    <div>
                                                        <h4 className='text-sm font-medium text-zinc-200'>{item.feature}</h4>
                                                    </div>
                                                </div>
                                                {item.desc && (
                                                    <p className='text-xs text-zinc-500 pl-6'>{item.desc}</p>
                                                )}
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

export default PublicView

