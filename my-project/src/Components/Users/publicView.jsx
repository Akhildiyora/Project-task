import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

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
            const response = await fetch(`http://localhost:3000/public/projects/${projectId}`, { credentials: 'include' });
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
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 rounded-full border-2 border-zinc-500 border-t-transparent animate-spin"></div>
                <p className="text-zinc-500 text-[14px]">Loading project details...</p>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-blue-500/30 overflow-x-hidden'>
            <div className='max-w-[1200px] mx-auto px-6 py-12'>
                
                {/* Header Section */}
                <div className="mb-12 pb-8 border-b border-zinc-800/80">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-[#111111] border border-zinc-800 rounded-xl flex items-center justify-center shadow-sm">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                                </div>
                                <div>
                                    <h1 className='text-3xl font-semibold tracking-tight text-white leading-tight'>{project.project_name}</h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[12px] font-medium border border-emerald-500/20 flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                            Public View
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {project.description && (
                                <p className='text-[15px] text-zinc-400 max-w-2xl leading-relaxed mb-6'>{project.description}</p>
                            )}
                            
                            <div className="flex flex-wrap items-center gap-6">
                                <div>
                                    <div className="flex items-center gap-2 text-[14px] text-zinc-300">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                                        <span className="text-zinc-500 mr-1 text-[13px]">Target:</span>
                                        {project.due_date ? new Date(project.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'No date set'}
                                    </div>
                                </div>
                                {project.members && (
                                    <div className="flex items-center gap-2 text-[14px] text-zinc-300 border-l border-zinc-800 pl-6">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                        <span className="text-zinc-500 mr-1 text-[13px]">Team:</span>
                                        {project.members}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-10 items-start">
                    
                    {/* Left Column - Gallery */}
                    <div className='flex-1 lg:max-w-3xl w-full'>
                        <h3 className='text-[16px] font-medium text-white mb-6 flex items-center gap-2'>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                            Project Gallery
                        </h3>
                        
                        {images.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {images.map((imgUrl, id) => (
                                    <div key={id} className="group relative aspect-video rounded-xl overflow-hidden bg-[#111111] border border-zinc-800 shadow-sm transition-all hover:border-zinc-700 hover:shadow-md">
                                        <img src={imgUrl} alt={`Gallery ${id}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-start p-4">
                                            <button onClick={() => window.open(imgUrl, '_blank')} className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-2 rounded-lg transition-colors border border-white/10" title="View full size">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="border border-dashed border-zinc-800 rounded-xl p-12 text-center bg-[#111111]/50">
                                <p className="text-[14px] text-zinc-500">No images have been shared for this project.</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Right Column - Status/Features */}
                    <div className="w-full lg:w-[380px] shrink-0">
                        {Object.keys(columns).map((columnId) => (
                            <div key={columnId} className="bg-[#111111] rounded-2xl border border-zinc-800 overflow-hidden shadow-lg sticky top-6">
                                {/* Header */}
                                <div className="px-5 py-4 border-b border-zinc-800/80 bg-[#0a0a0a]/30">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                        <h3 className="text-[14px] font-medium text-emerald-100">
                                            Completed Features
                                        </h3>
                                        <span className="ml-auto px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[11px] font-mono border border-emerald-500/20">
                                            {columns[columnId].items.length}
                                        </span>
                                    </div>
                                    <p className="text-[12px] text-zinc-500 mt-1 ml-4.5">Features successfully delivered</p>
                                </div>
                                
                                {/* Items */}
                                <div className="p-4 max-h-[600px] overflow-y-auto custom-scrollbar flex flex-col gap-3">
                                    {columns[columnId].items.length === 0 ? (
                                        <div className="text-center p-6 border border-dashed border-zinc-800/50 rounded-xl">
                                            <p className="text-[13px] text-zinc-500">No completed features to show yet.</p>
                                        </div>
                                    ) : (
                                        columns[columnId].items.map((item) => (
                                            <div key={item.id} className="bg-[#161616] border border-zinc-800/80 p-4 rounded-xl shadow-sm hover:border-zinc-700 transition-colors">
                                                <div className='flex items-start gap-3 mb-2'>
                                                    <div className="mt-0.5 shrink-0 text-emerald-500">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                                    </div>
                                                    <div>
                                                        <h4 className='text-[14px] font-medium text-zinc-200 leading-snug'>{item.feature}</h4>
                                                    </div>
                                                </div>
                                                {item.desc && (
                                                    <p className='text-[12px] text-zinc-500 pl-6 leading-relaxed'>{item.desc}</p>
                                                )}
                                                {item.due_date && (
                                                    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-zinc-800/50 text-[11px] text-zinc-600 pl-6">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                                                        Delivered {new Date(item.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
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

