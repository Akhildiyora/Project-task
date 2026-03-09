import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserDataContext } from '../../Context/UserDataContext';
import defaultLogo from '/logo.jpg'

const Create = () => {
  const [logoUrl, setLogoUrl] = useState(defaultLogo)
  const { user } = useUserDataContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      name: e.target[0].value,
      dueDate: e.target[3].value,
      description: e.target[4].value,
      members: e.target[2].value.split(',').map(email => email.trim()),
      userId: user.id,
      logo: logoUrl !== defaultLogo ? logoUrl : null
    };

    try {
      const response = await fetch('http://localhost:3000/projects', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert("Project created successfully!");
        navigate('/projects');
      } else {
        alert("Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert(error.message);
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

      const response = await fetch('http://localhost:3000/upload-logo', {
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
      <div className="p-6 w-full min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-600 flex flex-col items-center justify-center"  >
        <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-500 to-rose-400">Create New Project</h2>
        <form onSubmit={handleSubmit} className="bg-zinc-800 p-6 rounded-lg shadow-2xl w-full max-w-md flex flex-col gap-4">
          <div className="flex flex-col w-full ">
            <label className="text-white mb-2" required>Project Name</label>
            <input type="text" placeholder="Enter project name" className="bg-zinc-700 text-white p-2 rounded-md border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className='flex gap-2 items-center justify-between'>
            <div className='flex flex-col'>
              Upload Logo
              <span className='text-xs text-gray-600'>Size must be under 10MB</span>
            </div>
            <div className='flex flex-col items-end gap-2'>

              <input
                type='file'
                accept="image/*"
                onChange={handleUpload}
                disabled={isUploading}
                className='text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30 cursor-pointer'
              />
              {isUploading && <span className="text-xs text-blue-400">Uploading...</span>}
              {logoUrl && logoUrl !== defaultLogo && (
                <img src={logoUrl} alt="Logo Preview" className="h-12 w-12 object-cover rounded" />
              )}
            </div>
          </div>
          <div>
            <label className="text-white mb-2">Add Members</label>
            <input type="text" placeholder="Enter member email" className="bg-zinc-700 text-white p-2 rounded-md border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
          </div>
          <div>
            <label className="text-white mb-2">Due Date</label>
            <input type="date" className="scheme-light-dark bg-zinc-700 text-white p-2 rounded-md border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
          </div>
          <div>
            <label className="text-white mb-2">Description</label>
            <textarea placeholder="Enter project description" className="bg-zinc-700 text-white p-2 rounded-md border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"></textarea>
          </div>
          <button type="submit" className="bg-gradient-to-r from-blue-600 via-violet-400 to-blue-500 text-white font-medium py-2 px-4 rounded-md hover:from-blue-500 hover:to-blue-400 transition-all duration-200">Create Project</button>
        </form>
      </div>
    </div>
  )
}

export default Create

