import { useParams, Link } from "react-router-dom";
import { useState } from "react"
import { useDataContext } from '../../../Context/DataContext';

const Project = () => {
  const { id } = useParams();
  const { projects, setProjects } = useDataContext();

  const project = projects ? projects.find(p => p.id === parseInt(id)) : null;

  const displayImages = (() => {
    if (!project || !project.images) return [];

    const extractUrls = (data) => {
      if (typeof data === 'string') {
        try {
          if (data.trim().startsWith('[') || data.trim().startsWith('"')) {
            const parsed = JSON.parse(data);
            return extractUrls(parsed);
          }
          return [data];
        } catch (e) {
          return [data];
        }
      }
      if (Array.isArray(data)) {
        return data.flatMap(extractUrls);
      }
      return [];
    };

    return extractUrls(project.images).filter(url => typeof url === 'string' && url.startsWith('http'));
  })();


  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('http://localhost:3000/upload-images', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        if (!response.ok) throw new Error('Upload failed');
        const data = await response.json();
        return data.url;
      });

      const newImageUrls = await Promise.all(uploadPromises);

      const updatedImages = [...displayImages, ...newImageUrls];

      const updateResponse = await fetch(`http://localhost:3000/projects/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: updatedImages })
      });

      if (!updateResponse.ok) throw new Error('Failed to update project images');

      if (setProjects) {
        setProjects(prev => prev.map(p => p.id === parseInt(id) ? { ...p, images: updatedImages } : p));
      }

    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload images.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-b from-zinc-900 to-zinc-600 min-h-screen text-white">
      {project && (
        <>
          <div className="p-6 bg-zinc-800 rounded-lg shadow-lg">
            <div>
              <h3 className="text-2xl font-bold text-white">{project.project_name}</h3>
              <button>edit button</button>
            </div>
            <p className="text-zinc-300 mt-2">{project.description}</p>
            <p className="text-zinc-400 mt-2">Due Date: {project.due_date}</p>
            <p className="text-zinc-400 mt-2">Members: {project.members}</p>
            <Link to={`/projects/${project.id}/features`} className="text-blue-400 text-sm hover:underline">Go To Features</Link>
          </div>

          <div className="mt-8 p-6 bg-zinc-800 rounded-lg shadow-lg">
            <h4 className="text-xl font-bold text-white mb-4">Project Gallery</h4>
            <div className="mb-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30 cursor-pointer"
              />
              {isUploading && <span className="text-xs text-blue-400 ml-2">Uploading images...</span>}
            </div>

            {displayImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {displayImages.map((imgUrl, id) => (
                  <div key={id} className="relative aspect-video rounded-lg overflow-hidden border border-zinc-700">
                    <img src={imgUrl} alt={`Gallery ${id}`} className="w-full h-full object-contain" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">No images uploaded yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Project
