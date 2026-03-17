import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react"
import { useDataContext } from '../../../Context/DataContext';
import { MdOutlineEdit, MdOutlineDateRange } from "react-icons/md";
import { BsPerson, BsFillPersonFill } from "react-icons/bs";
import formatDateManually from "../../dateFormater";
import Popup from 'reactjs-popup';
import { useUserDataContext } from "../../../Context/UserDataContext";
import { IoTrashOutline, IoClose } from "react-icons/io5";
import { FaListUl } from "react-icons/fa";
const API = import.meta.env.VITE_BACKEND_API;

const Project = () => {
  const { id } = useParams();
  const projectId = Number(id)
  const { user } = useUserDataContext();
  const { projects, refetchProjects } = useDataContext();
  const navigate = useNavigate()

  const project = projects?.find(p => p.id === projectId);

  const displayImages = useMemo(() => {
    if (!project || !project.images) return [];

    const extractUrls = (data) => {
      if (typeof data === 'string') {
        try {
          if (data.trim().startsWith('[') || data.trim().startsWith('"')) {
            const parsed = JSON.parse(data);
            return extractUrls(parsed);
          }
          return [data];
        } catch {
          return [data];
        }
      }
      if (Array.isArray(data)) {
        return data.flatMap(extractUrls);
      }
      return [];
    };

    return extractUrls(project.images).filter(url => typeof url === 'string' && url.startsWith('http'));
  }, [project?.images]);


  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API}/upload-images`, {
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

      const updateResponse = await fetch(`${API}/projects/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: updatedImages })
      });

      if (!updateResponse.ok) throw new Error('Failed to update project images');

      await updateResponse.json();
      await refetchProjects();

    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload images.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imgUrl) => {
    confirm("Sure!, You want to delete this Image?")
    if (!imgUrl) return;
    console.log(imgUrl)
    const previousImages = displayImages;
    const updatedImages = displayImages.filter(url => url !== imgUrl);

    try {
      setIsUploading(true);
      const deleteresponse = await fetch(`${API}/delete-image`, {
        method: 'POST',
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: imgUrl }),
      });

      if (!deleteresponse.ok) throw new Error('Delete failed');

      const updateResponse = await fetch(`${API}/update-images/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: updatedImages })
      })

      if (!updateResponse.ok) throw new Error('Failed to update project images after delete');

      await updateResponse.json();
      await refetchProjects();

    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete images.");
    } finally {
      setIsUploading(false);
    }
  }

  const handleDeleteProject = async (id) => {
    confirm("Sure!, You want to delete this Project?")
    try {
      const response = await fetch(`${API}/projects/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
      })
      console.log("response delete project", response)
      if (response.ok) {
        await refetchProjects();
      }
    } catch (error) {
      console.error("Error removing feature:", error);
      alert(error.message);
    }
    navigate("/projects")
  }

  if (!project) {
    return (
      <div className="p-6 mt-18 text-white">
        Loading project...
      </div>
    );
  }

  return (
    <div className="p-6 mt-18 bg-gradient-to-b from-zinc-900 to-zinc-600 min-h-screen text-white">
      <div className="max-w-320 mx-auto">
        {project && (
          <div>
            <div className="flex w-full justify-between">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                  <img src={`${project.logo}`} className="object-contain h-8 w-8" />
                </div>
                <h3 className="text-3xl font-bold text-white">{project.project_name}</h3>
              </div>
              <div className="flex gap-3 items-center">
                <div className="text-white hover:text-green-400 px-3 text-sm border border-zinc-700 rounded-lg py-1">{project.status}</div>
                <Link to={`/projects/${project.id}/features`} className="flex gap-2 items-center text-white hover:text-blue-400 px-3 text-sm border border-zinc-700 rounded-lg py-1 "><FaListUl className="h-4 w-3" /> Features</Link>
                {user?.role === 'admin' && (
                  <button onClick={() => navigate(`/update/${id}`)} className="flex gap-2 items-center border hover:text-amber-400 border-zinc-700 py-1 text-sm px-3 rounded-lg"><MdOutlineEdit />Edit</button>
                )}
                {user?.role === 'admin' && (
                  <button onClick={() => handleDeleteProject(project.id)} className="flex gap-2 items-center border hover:text-red-400 border-zinc-700 py-1 text-sm px-3 rounded-lg"><IoTrashOutline />Delete</button>
                )}
              </div>
            </div>
            <p className="text-zinc-300 mt-2">{project.description}</p>
            <div className="flex mt-8 items-start gap-6">
              <div className="p-6 bg-zinc-800 rounded-lg shadow-lg min-w-[40vh] border-2 border-zinc-700">
                <div className="text-gray-500">PROJECT DETAILS</div>
                <div className="text-zinc-400 mt-4 flex flex-col">
                  <span className="text-sm">Due Date</span>
                  <div className="flex items-center gap-2 mt-1">
                    <MdOutlineDateRange className="size-4" />
                    <span className="text-white">{formatDateManually(project.due_date)}</span>
                  </div>
                </div>
                <div className="static text-zinc-400 mt-4 flex flex-col">
                  <span className="text-sm">Members</span>
                  {project.member?.map((member, index) => (
                    <div key={index} className="flex items-center gap-7 mt-1" >
                      <div className="relative flex items-center mt-2">
                        <BsPerson className="absolute size-3 left-1.5" />
                        <BsFillPersonFill className="absolute size-3.5" />
                      </div>
                      <span className="text-white">{member}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-zinc-800 rounded-lg shadow-lg border-2 border-zinc-700 w-full">
                <div className="flex justify-between gap-4">
                  <h4 className="text-xl font-bold text-white mb-4">Project Gallery</h4>
                  {user?.role === "admin" ? (
                    <div className="mb-4">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30 cursor-pointer"
                      />
                      {isUploading ? (
                        <span className="text-xs text-blue-400 ml-2">Updating gallery...</span>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {displayImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {displayImages.map((imgUrl, imageId) => (
                      <div key={imageId} className="group relative aspect-video rounded-xl overflow-hidden bg-zinc-800/50 border border-zinc-700/50 shadow-sm transition-all hover:border-zinc-500/70 hover:shadow-md">
                        <Popup
                          trigger={
                            <img
                              src={imgUrl}
                              alt={`Gallery ${imageId}`}
                              className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-115"
                            />
                          }
                          modal
                          nested
                        >
                          {(close) => (
                            <div className="h-full w-screen flex items-center justify-center bg-zinc-900/80 fixed top-0 left-0 z-50">
                              <div className="relative max-h-[90vh] my-auto mb-8 flex w-full max-w-lg shadow-lg rounded-lg bg-gradient-to-r from-zinc-900 to-blue-900/10">
                                <button
                                  className="absolute -top-9 right-0 flex bg-black rounded-full px-2.5 font-bold py-1 text-zinc-400 hover:text-red-400 transition-colors duration-200"
                                  onClick={close}
                                >
                                  <IoClose className="text-2xl" />
                                  Close
                                </button>
                                <img src={imgUrl} alt={`Gallery ${imageId}`} className="w-full h-full object-contain" />
                                {user?.role === "admin" ? (
                                  <button
                                    onClick={async () => {
                                      await handleDeleteImage(imgUrl);
                                      close();
                                    }}
                                    className="absolute -top-9 right-22 flex gap-1 items-center bg-black rounded-full px-2.5 font-bold py-1 text-zinc-400 hover:text-red-400 transition-colors duration-200"
                                  >
                                    <IoTrashOutline />
                                    <span>Delete</span>
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          )}
                        </Popup>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-sm">No images uploaded yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default Project;
