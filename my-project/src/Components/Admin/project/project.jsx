import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react"
import { useDataContext } from '../../../Context/DataContext';
import { MdOutlineEdit, MdOutlineDateRange } from "react-icons/md";
import { BsPerson, BsFillPersonFill } from "react-icons/bs";
import formatDateManually from "../../dateFormater";
import Popup from 'reactjs-popup';
import { useUserDataContext } from "../../../Context/UserDataContext";
import { IoTrashOutline, IoClose, IoArrowBack } from "react-icons/io5";
import { FaListUl } from "react-icons/fa";
import { Dialog } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
const API = import.meta.env.VITE_BACKEND_API;

const Project = () => {
  const navigate = useNavigate()
  const { id } = useParams();
  const projectId = Number(id)
  const { user } = useUserDataContext();
  const { projects, refetchProjects } = useDataContext();
  const [isUploading, setIsUploading] = useState(false);
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  if (!projects) {
    return (
      <div className="p-6 mt-18 text-white">
        Loading project...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 mt-18 text-red-400">
        Project not found.
      </div>
    );
  }

  const Members = project?.members || []
  const displayMembers = Members.filter((m) => m !== user?.email)


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
    const confirmed = window.confirm("Sure!, You want to delete this Image?")
    if (!confirmed || !imgUrl) return;
    console.log(imgUrl)
    const images = displayImages.filter(url => url !== imgUrl);

    try {
      setIsUploading(true);
      const deleteresponse = await fetch(`${API}/delete-image`, {
        method: 'POST',
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: imgUrl }),
      });

      if (!deleteresponse.ok) throw new Error('Delete failed');

      const updateResponse = await fetch(`${API}/projects/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images })
      })

      if (!updateResponse.ok) throw new Error('Failed to update project images after delete');

      await updateResponse.json();
      await refetchProjects();
      return true;
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete images.");
      return false
    } finally {
      setIsUploading(false);
    }
  }

  const handleDeleteProject = async (id) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${API}/projects/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
      })
      console.log("response delete project", response)
      if (response.ok) {
        await refetchProjects();
        setOpen(false);
        navigate("/projects")
        return;
      }
      throw new Error('Failed to delete project');
    } catch (error) {
      console.error("Error removing feature:", error);
      alert(error.message);
    } finally {
      setIsDeleting(false);
    }
  }


  return (
    <div className="p-4 sm:p-6 mt-18 bg-gradient-to-b from-zinc-900 to-zinc-600 min-h-screen text-white">
      <div className="max-w-320 mx-auto">
        {project && (
          <div>
            <button onClick={() => navigate('/projects')} className="flex items-center gap-2 mb-2 sm:mb-4 cursor-pointer text-zinc-400 text-sm sm:text-md hover:text-white"><IoArrowBack className="text-xl" />Back to Projects</button>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 w-full justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="size-8 sm:size-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                  <img src={project.logo || "/logo.jpg"} alt={project.id} className="object-contain size-7 sm:size-8" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white">{project.project_name}</h3>
              </div>
              <div className="flex gap-2 sm:gap-3 items-center">
                <div className="text-white hover:text-green-400 px-2 sm:px-3 text-xs sm:text-sm border border-zinc-700 rounded-lg py-1">{project.status}</div>
                <Link to={`/projects/${project.id}/features`} className="flex gap-2 items-center text-white hover:text-blue-400 px-2 sm:px-3 text-xs sm:text-sm border border-zinc-700 rounded-lg py-1 "><FaListUl className="h-4 w-3" /> Features</Link>
                {user?.role === 'admin' && (
                  <button onClick={() => navigate(`/update/${id}`)} className="flex gap-2 items-center border hover:text-amber-400 border-zinc-700 py-1 text-xs sm:text-sm px-2 sm:px-3 rounded-lg"><MdOutlineEdit />Edit</button>
                )}
                {user?.role === 'admin' && (
                  <button onClick={() => setOpen(true)} disabled={isDeleting} className="flex gap-2 items-center border hover:text-red-400 border-zinc-700 py-1 text-xs sm:text-sm px-2 sm:px-3 rounded-lg"><IoTrashOutline />Delete</button>
                )}
              </div>
            </div>
            <p className="text-zinc-300 mt-2">{project.description}</p>
            <div className="flex flex-col sm:flex-row mt-8 items-start gap-6">
              <div className="p-4 sm:p-6 bg-zinc-800 rounded-lg shadow-lg w-full sm:w-auto sm:min-w-[40vh] border-2 border-zinc-700">
                <div className="text-lg font-medium text-gray-500">PROJECT DETAILS</div>
                <div className="text-zinc-400 mt-4 flex flex-col">
                  <span className="text-sm">Due Date</span>
                  <div className="flex items-center gap-2 mt-1">
                    <MdOutlineDateRange className="size-4" />
                    <span className="text-white">{formatDateManually(project.due_date)}</span>
                  </div>
                </div>
                <div className="static text-zinc-400 mt-4 flex flex-col">
                  <span className="text-sm">Members</span>
                  {displayMembers?.map((member, index) => (
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

              <div className="p-4 sm:p-6 bg-zinc-800 rounded-lg shadow-lg border-2 border-zinc-700 w-full">
                <div className="flex flex-col sm:flex-row justify-between sm:gap-4">
                  <h4 className="text-lg sm:text-xl font-medium text-gray-500 mb-4">PROJECT GALLERY</h4>
                  {user?.role === "admin" ? (
                    <div className="mb-4">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                      />
                      {isUploading ? (
                        <span className="text-xs text-blue-400 ml-2">Updating gallery...</span>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {displayImages.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                            <div className="h-screen w-screen flex items-center justify-center bg-zinc-700/80 z-50 text-white">
                              <div className="relative my-auto flex w-full max-w-[90vw] shadow-lg rounded-lg bg-gradient-to-r from-zinc-900/50 to-blue-900/10">
                                <button
                                  className="absolute -top-9 right-2 flex bg-black rounded-full px-2.5 font-bold py-1 text-zinc-400 hover:text-red-400 transition-colors duration-200"
                                  onClick={close}
                                >
                                  <IoClose className="text-2xl" />
                                  Close
                                </button>
                                <img src={imgUrl} alt={`Gallery ${imageId}`} className="w-full max-h-[90vh] object-contain" />
                                {user?.role === "admin" ? (
                                  <button
                                    onClick={async () => {
                                      const deleted = await handleDeleteImage(imgUrl);
                                      if (deleted) close();
                                    }}
                                    className="absolute -top-9 right-24 flex gap-1 items-center bg-black rounded-full px-2.5 font-bold py-1 text-zinc-400 hover:text-red-400 transition-colors duration-200"
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
      <Dialog open={open} onClose={isDeleting ? () => { } : setOpen} className="relative z-50">
        <div className="fixed inset-0 bg-zinc-900/80 backdrop-blur-md" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="relative w-full max-w-lg rounded-t-lg border-t-4 border-red-600 bg-gradient-to-r from-zinc-800 to-yellow-600/10 shadow-lg">

            <div className="border border-zinc-700/30 px-4 pt-4 pb-5 rounded-t-lg">
              <Dialog.Title className="mb-3 flex items-center gap-2 text-xl font-bold text-white border-b border-zinc-700/80 pb-2">
                <ExclamationTriangleIcon className="size-5 rounded border border-zinc-700/90 p-0.5 text-red-400" />
                <span>Delete Project</span>
              </Dialog.Title>

              <p className="text-sm text-zinc-300">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-white">{project.project_name}</span>?
                This action cannot be undone.
              </p>
            </div>

            <div className="flex border-t-2 border-black">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isDeleting}
                className="w-full border-r border-zinc-700 bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700/60 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleDeleteProject(project.id)}
                disabled={isDeleting}
                className="w-full bg-gradient-to-r from-red-600 to-red-500 px-4 py-2 text-sm font-semibold text-white hover:from-red-500 hover:to-red-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
export default Project;
