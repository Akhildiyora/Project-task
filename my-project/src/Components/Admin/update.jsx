import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserDataContext } from '../../Context/UserDataContext';
import defaultLogo from '/logo.jpg'
import { useDataContext } from '../../Context/DataContext';
const API = import.meta.env.VITE_BACKEND_API;

const Create = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useUserDataContext();
    const { setDataLoading, projects, refetchProjects } = useDataContext();
    const project = projects?.find((p) => String(p.id) === id)
    const [logoUrl, setLogoUrl] = useState(defaultLogo)
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (project?.logo) {
            setLogoUrl(project.logo)
        }
    }, [project?.logo])

    if (!projects) {
        return (
            <div className="text-zinc-400 min-h-screen flex items-center justify-center text-lg ">
                Loading project...
            </div>
        )
    }

    if (!project) {
        return (
            <div className="text-red-400 min-h-screen flex items-center justify-center text-lg">
                Project not found
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true)
        setDataLoading(true)
        const membersInput = e.target.members.value?.trim() || "";
        const formData = {
            project_name: e.target.name.value,
            status: e.target.status.value,
            due_date: e.target.due_date.value,
            description: e.target.description.value,
            members: membersInput
                ? membersInput.split(',').map(email => email.trim()).filter(Boolean)
                : [],
            userId: user.id,
            logo: logoUrl !== defaultLogo ? logoUrl : null
        };

        try {
            const response = await fetch(`${API}/update/${id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                refetchProjects();
                alert("Project updated successfully!");
                navigate(`/projects/${id}`);
            } else {
                alert("Failed to update project");
            }
        } catch (error) {
            console.error("Error updating project:", error);
            alert(error.message);
        } finally {
            setDataLoading(false)
            setIsSubmitting(false)
        }
    };


    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API}/upload-logo`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            setLogoUrl(data.url);

        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload image.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div>
            <div className="p-2 py-20 w-full min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-600 flex flex-col items-center sm:justify-center" >
                <div className='sm:bg-zinc-900/50 w-full sm:w-auto py-4 px-0.5 sm:py-8 sm:px-16 flex flex-col items-center justify-center'>
                    <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-500 to-rose-400">Update Project</h2>
                    <div className="bg-zinc-900/80 p-4 sm:p-6 mt-6 sm:mt-8 rounded-lg shadow-2xl w-full sm:min-w-lg sm:max-w-2xl flex flex-col gap-4 border border-zinc-800">
                        <form onSubmit={handleSubmit} className='flex flex-col gap-3 sm:gap-4'>
                            <div>
                                <label className="text-sm sm:text-md text-zinc-400 ">Project Name</label>
                                <input required name='name' defaultValue={project?.project_name} placeholder="Enter project name" type="text" className="mx-1 bg-zinc-800/30 text-white text-sm sm:text-md py-1 px-2 sm:p-2 sm:px-4 rounded-lg border border-zinc-700/30 hover:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500/40  w-full"></input>
                            </div>
                            <div>
                                <label className="text-sm sm:text-md text-zinc-400">Status</label>
                                <select defaultValue={project?.status}
                                    name='status'
                                    className="mx-1 w-full bg-zinc-800/30 text-white text-sm sm:text-md py-1 px-2 sm:p-2 sm:px-4 rounded-lg border border-zinc-700/30 hover:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                                >
                                    <option className='w-full bg-zinc-800 text-white text-sm sm:text-md py-1 px-2 sm:p-2 sm:px-4 rounded-lg border border-zinc-700 hover:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500/40' value="upcoming" key="upcoming">Upcoming</option>
                                    <option className='w-full bg-zinc-800 text-white text-sm sm:text-md py-1 px-2 sm:p-2 sm:px-4 rounded-lg border border-zinc-700 hover:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500/40' value="inProgress" key="inProgress">InProgress</option>
                                    <option className='w-full bg-zinc-800 text-white text-sm sm:text-md py-1 px-2 sm:p-2 sm:px-4 rounded-lg border border-zinc-700 hover:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500/40' value="completed" key="completed">completed</option>
                                </select>
                            </div>
                            <div>
                                <label className='text-sm sm:text-md flex items-center justify-between text-zinc-400'>
                                    Upload New Logo
                                    <span className='text-xs text-zinc-600'>Size must be under 10MB</span>
                                </label>
                                <div className='mx-1 flex p-2 gap-2 items-center justify-between border border-zinc-700/30 rounded-lg bg-zinc-800/30'>
                                    {logoUrl && logoUrl !== defaultLogo && (
                                        <img src={logoUrl} alt="Logo Preview" className="h-12 w-12 object-contain rounded" />
                                    )}
                                    <div className='flex flex-col items-end gap-2'>

                                        <input
                                            type='file'
                                            accept="image/*"
                                            onChange={handleUpload}
                                            disabled={isUploading}
                                            className='text-xs sm:text-sm text-zinc-400 file:mr-4 file:py-1 file:px-2 sm:file:py-2 sm:file:px-4 file:rounded-full file:border file:border-zinc-700/50 hover:file:border-zinc-700 file:text-sm file:font-semibold file:bg-zinc-900/50 file:text-zinc-400 hover:file:bg-zinc-900 file:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60'
                                        />
                                        {isUploading && <span className="text-xs text-zinc-400">Uploading...</span>}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm sm:text-md text-zinc-400 mb-2">Add Members</label>
                                <input name='members' defaultValue={project?.members?.join(', ')} type="text" placeholder="Enter member email" className="mx-1 w-full bg-zinc-800/30 text-white text-sm sm:text-md py-1 px-2 sm:p-2 sm:px-4 rounded-lg border border-zinc-700/30 hover:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500/40" />
                            </div>
                            <div>
                                <label className="text-sm sm:text-md text-zinc-400 mb-2">Due Date</label>
                                <input required name='due_date' defaultValue={project?.due_date} min={new Date().toISOString().split("T")[0]} type="date" className="mx-1 scheme-light-dark bg-zinc-800/30 text-white text-sm sm:text-md py-1 px-2 sm:p-2 sm:px-4 rounded-lg border border-zinc-700/30 hover:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500/40 w-full" />
                            </div>
                            <div>
                                <label className="text-sm sm:text-md text-zinc-400 mb-2">Description</label>
                                <textarea name='description' defaultValue={project?.description} placeholder="Enter project description" className="mx-1 bg-zinc-800/30 text-white text-sm sm:text-md py-1 px-2 sm:p-2 sm:px-4 rounded-t-lg rounded-bl-lg rounded-br-none border border-zinc-700/30 hover:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500/40  w-full"></textarea>
                            </div>
                            <button type="submit" disabled={isUploading || isSubmitting} className="mx-1 text-sm sm:text-md bg-gradient-to-r from-blue-600/50 via-violet-400 to-blue-500/50 text-white font-medium py-1 sm:py-2 px-4 rounded-md hover:from-blue-500/80 hover:to-blue-400/80 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Updating..." : "Update Project"}</button>
                        </form>
                        <button onClick={() => navigate(`/projects/${id}`)} className="mx-1 text-sm sm:text-md bg-tranparent hover:bg-zinc-700/60 text-white font-medium py-1 sm:py-2 px-4 rounded-md transition-all duration-200 border border-zinc-500 cursor-pointer">Cancel Update</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Create

