import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserDataContext } from '../../Context/UserDataContext';
import defaultLogo from '/logo.jpg'
import { useDataContext } from '../../Context/DataContext';
const API=import.meta.env.VITE_BACKEND_API;

const Create = () => {
  const [logoUrl, setLogoUrl] = useState(defaultLogo)
  const [IsSubmit, setIsSubmit] = useState(false)
  const { user } = useUserDataContext();
  const { setDataLoading, refetchProjects } = useDataContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmit(true)
    setDataLoading(true)
    const membersInput = e.target.members.value.trim();
    const formData = {
      name: e.target.name.value,
      due_date: e.target.due_date.value,
      description: e.target.description.value,
      members: membersInput
        ? membersInput.split(',').map(email => email.trim()).filter(Boolean)
        : [],
      userId: user.id,
      logo: logoUrl !== defaultLogo ? logoUrl : null
    };

    try {
      const response = await fetch(`${API}/projects`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await refetchProjects();
        alert("Project created successfully!");
        navigate('/projects');
      } else {
        alert("Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert(error.message);
    } finally {
      setDataLoading(false)
      setIsSubmit(false)
    }
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      console.log('form', formData)

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
      <div className="p-6 pt-16 w-full min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-600 flex flex-col items-center justify-center" >
        <div className='bg-zinc-900/50 py-8 px-16 flex flex-col items-center justify-center'>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-500 to-rose-400">Create New Project</h2>
          <span className='mb-8 text-sm text-zinc-400'>Set up a workspace for your next big idea.</span>
          <form onSubmit={handleSubmit} className="bg-zinc-900/80 p-6 rounded-lg shadow-2xl w-full min-w-lg max-w-2xl flex flex-col gap-4 border border-zinc-800">
            <div className="flex flex-col w-full ">
              <label className="text-zinc-400 mb-2" required>Project Name</label>
              <input required name='name' type="text" placeholder="Enter project name" className="bg-zinc-800/30 text-white p-2 px-4 rounded-lg border border-zinc-700/30 hover:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500/40" />
            </div>
            <div className='flex p-2 gap-2 items-center justify-between border border-zinc-700/30 rounded-lg bg-zinc-800/30'>
              <div className='flex flex-col text-zinc-400'>
                Upload Logo
                <span className='text-xs text-zinc-600'>Size must be under 10MB</span>
              </div>
              <div className='flex flex-col items-end gap-2'>

                <input
                  type='file'
                  accept="image/*"
                  onChange={(e) => handleUpload(e)}
                  disabled={isUploading || user?.role !== 'admin'}
                  className='text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border file:border-zinc-700/50 hover:file:border-zinc-700 file:text-sm file:font-semibold file:bg-zinc-900/50 file:text-zinc-400 hover:file:bg-zinc-900 file:cursor-pointer'
                />
                {isUploading && <span className="text-xs text-zinc-400">Uploading...</span>}
                {logoUrl && logoUrl !== defaultLogo && (
                  <img src={logoUrl} alt="Logo Preview" className="h-12 w-12 object-cover rounded" />
                )}
              </div>
            </div>
            <div>
              <label className="text-zinc-400 mb-2">Add Members</label>
              <input name='members' type="text" placeholder="Enter member email" className="w-full bg-zinc-800/30 text-white p-2 px-4 rounded-lg border border-zinc-700/30 hover:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500/40" />
            </div>
            <div>
              <label className="text-zinc-400 mb-2">Due Date</label>
              <input required name='due_date' type="date" className="scheme-light-dark bg-zinc-800/30 text-white p-2 px-4 rounded-lg border border-zinc-700/30 hover:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500/40 w-full" />
            </div>
            <div>
              <label className="text-zinc-400 mb-2">Description</label>
              <textarea name='description' placeholder="Enter project description" className="bg-zinc-800/30 text-white p-2 px-4 rounded-lg border border-zinc-700/30 hover:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500/40  w-full"></textarea>
            </div>
            <button type="submit" disabled={IsSubmit || user?.role !== 'admin'} className="bg-gradient-to-r from-blue-600/50 via-violet-400 to-blue-500/50 text-white font-medium py-2 px-4 rounded-md hover:from-blue-500/50 hover:to-blue-400/50 transition-all duration-200">{IsSubmit?"Creating Project..." : "Create Project"}</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Create

