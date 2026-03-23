import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUserDataContext } from '../../../Context/UserDataContext'
import Popup from 'reactjs-popup';
import { FaRegEdit } from "react-icons/fa";
import formatDateManually from '../../dateFormater';
import { IoTrashOutline, IoAddCircleOutline, IoArrowBack } from "react-icons/io5";
import { MdOutlineEdit } from "react-icons/md";
import { Dialog } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
const API = import.meta.env.VITE_BACKEND_API;

const Kanban = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserDataContext();
  const [isSaving, setIsSaving] = useState(false)
  const sortByOldest = (arr) =>
    [...arr].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  const [columns, setColumns] = useState({
    todo: { name: "To Do", items: [] },
    inProgress: { name: "In Progress", items: [] },
    done: { name: "Done", items: [] },
  })
  const [project, setProject] = useState(null);
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteFeatureId, setDeleteFeatureId] = useState(null);
  const [isFeaturesLoading, setIsFeaturesLoading] = useState(true);
  useEffect(() => {
    if (!projectId) return;

    fetchProject();
    fetchfeatures();
    console.log('project', project)
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`${API}/projects/${projectId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch project: ${response.status}`);
      }

      const data = await response.json();
      setProject(data);
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  };

  const fetchfeatures = async () => {
    setIsFeaturesLoading(true);
    try {
      const response = await fetch(`${API}/features?projectId=${projectId}`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error(`Failed to fetch features: ${response.status}`);
      }
      const data = await response.json();

      const newColumns = {
        todo: { name: "To Do", items: sortByOldest(data.filter(t => t.status === 'todo')) },
        inProgress: { name: "In Progress", items: sortByOldest(data.filter(t => t.status === 'inProgress')) },
        done: { name: "Done", items: sortByOldest(data.filter(t => t.status === 'done')) },
      };
      setColumns(newColumns);
    } catch (error) {
      console.error("Error fetching features:", error);
    } finally {
      setIsFeaturesLoading(false);
    }
  };

  const [newFeature, setnewFeature] = useState({
    feature: "",
    desc: "",
    assign: "",
    due_date: "",
    status: "todo",
  })
  const [editFeatureData, setEditFeatureData] = useState(null);
  const [viewFeatureData, setViewFeatureData] = useState(null);
  const [activeColumn, setActiveColumn] = useState("todo")
  const [draggedItem, setDraggedItem] = useState(null)

  const addnewFeature = async (close) => {
    if (newFeature.feature.trim() === "") return;
    setIsSaving(true)

    try {
      const response = await fetch(`${API}/features`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newFeature, status: activeColumn, project_id: projectId })
      });
      if (response.ok) {

        fetchfeatures();
        setnewFeature({ feature: "", desc: "", assign: "", due_date: "", status: "todo" });
        close();
        setIsSaving(false)
      }
    } catch (error) {
      console.error("Error adding feature:", error);
      alert(error.message);
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteFeature = async () => {
    if (!deleteFeatureId) return;

    try {
      setIsDeleting(true);

      const response = await fetch(`${API}/features/${deleteFeatureId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error("Failed to delete feature");
      }

      await fetchfeatures();
      setOpen(false);
      setDeleteFeatureId(null);
    } catch (error) {
      console.error("Error removing feature:", error);
      alert(error.message);
    } finally {
      setIsDeleting(false);
    }
  };
  const submitEditFeature = async (close) => {
    if (!editFeatureData || editFeatureData.feature.trim() === "") return;
    setIsSaving(true)

    try {
      const response = await fetch(`${API}/features/${editFeatureData.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: editFeatureData.feature,
          desc: editFeatureData.desc,
          assign: editFeatureData.assign,
          due_date: editFeatureData.due_date,
          status: editFeatureData.status
        })
      });
      if (response.ok) {
        fetchfeatures();
        setEditFeatureData(null);
        close();
        setIsSaving(false)
      } else {
        alert("Failed to update feature");
        setIsSaving(false)
      }
    } catch (error) {
      console.error("Error updating feature:", error);
      alert(error.message);
    } finally {
      setIsSaving(false)
    }
  }

  const handleDragStart = (columnId, item) => {
    setDraggedItem({ columnId, item })
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = async (e, columnId) => {
    e.preventDefault()
    if (!draggedItem) return;
    const { columnId: sourceColumnId, item } = draggedItem;
    const movedItem = { ...item, status: columnId }
    if (sourceColumnId === columnId) {
      setDraggedItem(null);
      return;
    }
    const previousColumns = columns
    setColumns((prev) => {
      const sourceItems = prev[sourceColumnId].items.filter((i) => i.id !== item.id);
      const targetItems = sortByOldest([...prev[columnId].items, movedItem]);

      return {
        ...prev,
        [sourceColumnId]: {
          ...prev[sourceColumnId],
          items: sourceItems,
        },
        [columnId]: {
          ...prev[columnId],
          items: targetItems,
        },
      };
    });

    try {
      const response = await fetch(`${API}/features/${item.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: columnId })
      });
      if (!response.ok) {
        throw new Error("Failed to move feature");
      }
    } catch (error) {
      console.error("Error moving feature:", error);
      alert(error.message);
      setColumns(previousColumns);
    }
    setDraggedItem(null)
  }

  const columnStyles = {
    todo: {
      header: "bg-gradient-to-r from-blue-600 to-blue-400",
      border: "border-blue-400 bg-gradient-to-r from-zinc-800 to-blue-800/20",
    },
    inProgress: {
      header: "bg-gradient-to-r from-yellow-600 to-yellow-400",
      border: "border-yellow-400 bg-gradient-to-r from-zinc-800 to-yellow-800/20",
    },
    done: {
      header: "bg-gradient-to-r from-green-600 to-green-400",
      border: "border-green-400 bg-gradient-to-r from-zinc-800 to-green-800/20",
    }
  }

  return (
    <div>
      <div className='p-2 sm:p-6 mt-18 w-full min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-600 flex items-start justify-center'>
        <div className='flex items-start flex-col gap-2 sm:gap-4 w-full max-w-6xl mx-auto'>
          <div className='flex justify-between w-full px-2 sm:px-20 gap-4'>
            <button onClick={() => navigate(`/projects/${projectId}`)} className="flex items-center text-sm sm:text-md gap-2 sm:mb-4 cursor-pointer text-zinc-400 hover:text-white"><IoArrowBack className="text-xl" />Back to Projects</button>

            <Popup onClose={() => { setnewFeature({ feature: "", desc: "", assign: "", due_date: "", status: "todo" }); setActiveColumn("todo"); }} trigger={<button className="bg-gradient-to-r text-nowrap from-green-600/50 to-green-400/80 text-white hover:text-zinc-900 px-2 sm:px-4 py-1 sm:py-2 rounded hover:from-green-300/70 hover:to-green-500 transition duration-200 cursor-pointer">+ New Feature</button>}
              modal nested
            >
              {
                close => user?.role === 'admin' ? (
                  <div className="h-screen w-screen flex items-center justify-center bg-zinc-900/80 fixed top-0 left-0 z-50 backdrop-blur-md">
                    <div className="relative mb-8 mx-2 flex w-full sm:max-w-xl shadow-lg rounded-lg bg-gradient-to-r from-zinc-900 to-blue-900/10 border-t-4 border-blue-400">
                      <button className="absolute -top-10 sm:-top-9 right-4 sm:right-0 bg-black rounded-full px-2.5 font-bold py-1 text-zinc-400 hover:text-red-400 transition-colors duration-200 z-60" onClick={close}>X</button>
                      <form onSubmit={(e) => { e.preventDefault(); addnewFeature(close); }} className="flex flex-col w-full ">
                        <div className="flex flex-col w-full overflow-hidden  rounded-t-md bg-transparent px-1 pt-2 pb-4 border border-zinc-700/30 hover:border-zinc-700">
                          <h2 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-4 px-3 flex items-center gap-2"><IoAddCircleOutline className='text-gray-400 h-7 w-7 ' />
                            Add Feature</h2>
                          <div className='flex flex-col border-t border-zinc-700/80 pt-2'>
                            <label className='px-2 py-1 text-zinc-400 text-sm bg-transparent' htmlFor="Feature">Feature</label>
                            <input required type="text" value={newFeature.feature}
                              onChange={(e) => setnewFeature({ ...newFeature, feature: e.target.value })}
                              placeholder="Add new feature..."
                              className="text-sm sm:text-md flex-grow px-3 py-1 text-zinc-400 border border-zinc-700/30 hover:border-zinc-700 rounded-lg bg-zinc-800/20"
                            />
                          </div>
                          <div className='flex flex-col sm:flex-row mt-3 sm:mt-0 gap-3 items-start sm:items-center justify-between bg-transparent'>
                            <div>
                              <label className='px-2 text-zinc-400 text-sm' htmlFor="Due Date">Due Date</label>
                              <input type="date" min={new Date().toISOString().split("T")[0]} value={newFeature.due_date}
                                className='text-sm sm:text-md flex-grow scheme-light-dark px-2 sm:px-3 py-1 text-zinc-100 border border-zinc-700/30 hover:border-zinc-700 rounded-lg bg-zinc-800/20'
                                onChange={(e) => setnewFeature({ ...newFeature, due_date: e.target.value })}
                              />
                            </div>
                            <div className='flex sm:flex-col items-center sm:items-start sm:pt-1 mr-10'>
                              <label className='px-2 sm:px-3 text-zinc-400 text-sm'>Status</label>
                              <select value={activeColumn}
                                onChange={(e) => setActiveColumn(e.target.value)}
                                className="text-sm sm:text-md flex-grow flex items-center justify-center px-1 py-1 text-white border border-zinc-700/30 hover:border-zinc-700 rounded-lg bg-zinc-800/20"
                              >
                                {Object.keys(columns).map((columnId) => (
                                  <option className='bg-zinc-800 text-white p-2 px-4 text-sm sm:text-md flex-grow rounded-lg border border-zinc-700 hover:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500/40' value={columnId} key={columnId}>{columns[columnId].name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className='px-2 text-zinc-400 text-sm' htmlFor="Assign">Assign To</label>
                              <select type="text" value={newFeature.assign} placeholder='Email of Assign To...'
                                className='text-sm sm:text-md flex-grow px-2 sm:px-3 py-1 text-zinc-100 border border-zinc-700/30 hover:border-zinc-700 rounded-lg bg-zinc-800/20'
                                onChange={(e) => setnewFeature({ ...newFeature, assign: e.target.value })}
                              >
                                {project?.members?.map((member) => (
                                  <option key={member} value={member} className='bg-zinc-800 text-white p-2 px-2 sm:px-4 rounded-lg border border-zinc-700 hover:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500/40'>{member}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <label className='px-2 sm:px-3 py-1 mt-2 text-zinc-400 text-sm bg-transparent' htmlFor="Description">Description</label>
                          <textarea value={newFeature.desc}
                            onChange={(e) => setnewFeature({ ...newFeature, desc: e.target.value })}
                            placeholder="Enter description..."
                            className="flex-grow text-sm sm:text-md px-3 py-1 text-zinc-100 border border-zinc-700/30 hover:border-zinc-700 rounded-t-lg rounded-bl-lg rounded-br-none bg-zinc-800/20"
                          />
                        </div>

                        <button type='submit' disabled={isSaving} className='border-t-2 py-1 border-black bg-gradient-to-r from-blue-500 to-blue-400 text-white font-medium hover:from-blue-400 hover:to-sky-500 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60'>{isSaving ? "Saving..." : "Add Feature"}</button>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-800 p-6 rounded-lg text-white">
                    <p>You do not have permission to add features.</p>
                    <button onClick={close} className="mt-4 bg-zinc-600 px-3 py-1 rounded">Close</button>
                  </div>
                )}
            </Popup>
            <Popup open={!!editFeatureData} onClose={() => setEditFeatureData(null)} modal nested>
              {
                close => editFeatureData && (
                  <div className="h-screen w-screen flex items-center justify-center bg-zinc-900/80 fixed top-0 left-0 z-50 backdrop-blur-md">
                    <div className="relative mb-8 mx-2 flex w-full sm:max-w-xl shadow-lg rounded-lg bg-gradient-to-r from-zinc-800 to-yellow-600/10 border-t-4 border-yellow-600">
                      <button className="absolute -top-10 sm:-top-9 right-4 sm:right-0 bg-black rounded-full px-2.5 font-bold py-1 text-zinc-400 hover:text-red-400 transition-colors duration-200 z-60" onClick={close}>X</button>
                      <form onSubmit={(e) => { e.preventDefault(); submitEditFeature(close); }} className="flex flex-col w-full ">
                        <div className="flex flex-col w-full overflow-hidden rounded-t-md bg-transparent px-1 pt-2 pb-4 border border-zinc-700/30 hover:border-zinc-700">

                          <div className="flex justify-between items-center mb-3 sm:mb-4 ">
                            <div className="text-lg sm:text-xl font-bold text-white px-3 flex items-center gap-2">
                              <MdOutlineEdit className='text-gray-400 h-7 w-7 border border-zinc-700/90 rounded p-0.5' />
                              <span className='flex gap-2 items-center'>Edit Feature
                                <span className='text-gray-500 text-xs sm:text-sm'>#{editFeatureData.id}</span>
                              </span>
                            </div>
                            <div className='text-gray-500 text-xs sm:text-sm'>Create at {editFeatureData?.created_at?.split("T")[0]}</div>
                          </div>
                          <div className='flex flex-col border-t border-zinc-700/80 pt-2'>
                            <label className='px-2 py-1 text-zinc-400 text-lg text-sm bg-transparent' htmlFor="Feature">Feature</label>
                            <input required type="text" defaultValue={editFeatureData.feature}
                              onChange={(e) => setEditFeatureData({ ...editFeatureData, feature: e.target.value })}
                              placeholder="Feature name..."
                              className="text-sm sm:text-md flex-grow px-3 py-1 text-zinc-100 border border-zinc-700/30 hover:border-zinc-700 rounded-lg bg-zinc-800/40"
                            />

                          </div>
                          <div className='flex flex-col sm:flex-row mt-3 sm:mt-0 gap-3 item-start sm:items-center justify-between bg-transparent'>
                            <div>
                              <label className='px-2 text-zinc-400 text-sm ' htmlFor="Due Date">Due Date </label>
                              <input type="date" min={new Date().toISOString().split("T")[0]} value={editFeatureData.due_date || ""}
                                className='text-sm sm:text-md flex-grow scheme-light-dark px-2 sm:px-3 py-1 text-zinc-100 border border-zinc-700/30 hover:border-zinc-700 rounded-lg bg-zinc-800/20'
                                onChange={(e) => setEditFeatureData({ ...editFeatureData, due_date: e.target.value })}
                              />
                            </div>
                            <div className='flex sm:flex-col items-center sm:items-start sm:pt-1 mr-10'>
                              <label className='px-2 sm:px-3 text-zinc-400 text-sm'>Status</label>
                              <select value={editFeatureData.status}
                                onChange={(e) => setEditFeatureData({ ...editFeatureData, status: e.target.value })}
                                className="text-sm sm:text-md flex items-center justify-center rounded-lg px-1 py-1 text-white bg-zinc-800/40 border border-zinc-700/30 hover:border-zinc-700"
                              >
                                {Object.keys(columns).map((columnId) => (
                                  <option className='bg-zinc-800 text-white p-2 px-4 text-sm sm:text-md flex-grow rounded-lg border border-zinc-700 hover:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500/40 ' value={columnId} key={columnId}>{columns[columnId].name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className='px-2 text-zinc-400 text-sm' htmlFor="Assign">Assign To </label>
                              <select type="text" value={editFeatureData.assign} placeholder='Email of Assign To...'
                                className='text-sm sm:text-md flex-grow px-2 sm:px-3 py-1 text-zinc-100 border border-zinc-700/30 hover:border-zinc-700 rounded-lg bg-zinc-800/20'
                                onChange={(e) => setEditFeatureData({ ...editFeatureData, assign: e.target.value })}
                              >
                                {project?.members?.map((member) => (
                                  <option key={member} value={member} className='bg-zinc-800 text-white p-2 px-2 sm:px-4 rounded-lg border border-zinc-700 hover:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500/40'>{member}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <label className='px-2 sm:px-3 py-1 mt-2 text-zinc-400 text-sm bg-transparent' htmlFor="Description">Description </label>
                          <textarea value={editFeatureData.desc || ""}
                            onChange={(e) => setEditFeatureData({ ...editFeatureData, desc: e.target.value })}
                            placeholder="Enter description..."
                            className="flex-grow text-sm sm:text-md px-3 py-1 text-zinc-100 border border-zinc-700/30 hover:border-zinc-700 rounded-t-lg rounded-bl-lg rounded-br-none bg-zinc-800/40"
                          />
                        </div>

                        <button type='submit' disabled={isSaving} className='border-t-2 py-1 border-black bg-gradient-to-r from-yellow-600 to-amber-600 text-white font-medium hover:from-yellow-500 hover:to-amber-500 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60'>{isSaving ? "Saving..." : "Save Changes"}</button>
                      </form>
                    </div>
                  </div>
                )
              }
            </Popup>
          </div>
          <h1 className='text-xl sm:ml-16 px-4 sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-blue-200/80 to-blue-200/50'>{project?.project_name || "Loading..."}</h1>

          {isFeaturesLoading ? (
            <div className="w-full flex justify-center py-20 text-zinc-400">
              Loading features...
            </div>
          ) : (
            <div className="flex flex-wrap gap-6 overflow-x-auto pb-6 w-full items-start justify-center">
              <Popup open={!!viewFeatureData} onClose={() => setViewFeatureData(null)} modal nested>
                {
                  close => viewFeatureData && (
                    <div className="h-screen w-screen flex items-center justify-center bg-zinc-900/80 fixed top-0 left-0 z-50 backdrop-blur-md">
                      <div className="mb-8 mx-2 flex w-full sm:max-w-xl shadow-lg rounded-lg bg-gradient-to-r from-zinc-800 to-yellow-600/10 border-t-4 border-green-600">
                        <div className="flex flex-col w-full ">
                          <div className="flex flex-col w-full overflow-hidden rounded-t-md bg-transparent px-1 pt-2 pb-4 border border-zinc-700/30 hover:border-zinc-700">
                            <div className="flex justify-between items-start mb-3 sm:mb-4">
                              <div className="text-lg sm:text-xl font-bold text-white px-3 flex items-start gap-2">
                                <MdOutlineEdit className='text-gray-400 h-7 w-7 border border-zinc-700/90 rounded p-0.5' />
                                <span className='flex gap-2 items-center'>{viewFeatureData.feature}
                                  <span className='text-gray-500 text-xs sm:text-sm'>#{viewFeatureData.id}</span>
                                </span>
                              </div>
                              <div className='text-gray-500 text-xs sm:text-sm flex gap-1 flex-col sm:flex-row'>Create at <span>{viewFeatureData?.created_at?.split("T")[0]}</span></div>
                            </div>

                            <div className='flex gap-3 items-center bg-transparent'>
                              <div className='flex flex-col w-full'>
                                <label className='px-2 text-zinc-400 text-sm ' htmlFor="Due Date">Due Date </label>
                                <div
                                  className='flex-grow flex justify-center scheme-light-dark px-3 py-1 text-zinc-100 border border-zinc-700/30 hover:border-zinc-700 rounded-lg bg-zinc-800/40'
                                >{viewFeatureData.due_date}</div>
                              </div>
                              <div className='flex flex-col w-full'>
                                <label className='px-2 text-zinc-400 text-sm'>Status</label>
                                <div value={viewFeatureData.status}
                                  className="flex items-center justify-center rounded-lg px-1 py-1 text-white bg-zinc-800/40 border border-zinc-700/30 hover:border-zinc-700"
                                >
                                  {columns[viewFeatureData.status]?.name || viewFeatureData.status}
                                </div>
                              </div>
                              <div className='flex flex-col w-full'>
                                <label className='px-2 text-zinc-400 text-sm' htmlFor="Assign">Assign To </label>
                                <div className='flex-grow flex justify-center px-3 py-1 text-zinc-100 border border-zinc-700/30 hover:border-zinc-700 rounded-lg bg-zinc-800/20'>
                                  {viewFeatureData?.assign || "N/A"}
                                </div>
                              </div>
                            </div>
                            <label className='px-3 py-1 mt-2 text-zinc-400 text-sm bg-transparent ' htmlFor="Description">Description </label>
                            <div
                              className="flex-grow px-3 py-1 text-zinc-100 border border-zinc-700/30 hover:border-zinc-700 rounded-lg bg-zinc-800/40"
                            >{viewFeatureData.desc || ""}</div>
                          </div>
                          {user?.role === 'admin' && (
                            <div className='flex items-center justify-evenly'>
                              <button onClick={(e) => {e.preventDefault(); setEditFeatureData(viewFeatureData);setViewFeatureData(null); close();}} className='text-zinc-400 hover:text-blue-400 border-x border-zinc-700/50 transition-colors duration-200 w-full flex items-center justify-center hover:bg-zinc-600'>
                                <span className='text-md cursor-pointer flex items-center gap-2'><FaRegEdit className='size-3.5' />Edit</span>
                              </button>
                              <button onClick={(e) => { e.preventDefault(); setDeleteFeatureId(viewFeatureData.id);setViewFeatureData(null); setOpen(true); }} className='text-zinc-400 hover:text-red-400 border-x border-zinc-700/50 transition-colors duration-200 w-full flex items-center justify-center hover:bg-zinc-600'>
                                <span className='text-md cursor-pointer flex items-center gap-2'><IoTrashOutline className='size-4' />Delete</span>
                              </button>
                            </div>
                          )}
                          <button onClick={close} className='border-t-2 border-black bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:from-green-500 hover:to-emerald-500 transition-all duration-200 cursor-pointer py-1 disabled:cursor-not-allowed disabled:opacity-60'>Close</button>
                        </div>
                      </div>
                    </div>
                  )
                }
              </Popup>
              {Object.keys(columns).map((columnId) => (
                <div key={columnId} className={`flex-shrink-0 w-80 rounded-lg shadow-x-lg border-t-3 sm:border-t-4 ${columnStyles[columnId].border}`}
                  onDragOver={user?.role === 'admin' ? (e) => handleDragOver(e, columnId) : undefined}
                  onDrop={user?.role === 'admin' ? (e) => handleDrop(e, columnId) : undefined}
                >
                  <div className={`p-1 px-3 sm:p-4 text-white font-medium text-lg sm:text-xl rounded-t-md ${columnStyles[columnId].header}`}>
                    {columns[columnId].name}
                    <span className="ml-2 px-1 sm:px-2 py-0.5 sm:py-1 bg-zinc-800 bg-opacity-30 rounded-full font-normal text-xs sm:text-sm">{columns[columnId].items.length}</span>
                  </div>
                  <div className="p-1 sm:p-3 min-h-64 border border-zinc-700 rounded-b-lg">
                    {columns[columnId].items.length === 0 ? (
                      <div className="text-center text-zinc-500 italic text-sm ">Add Features Here</div>
                    ) : (
                      columns[columnId].items.map((item) => (
                        <div
                          key={item.id}
                          draggable={user?.role === 'admin'}
                          onDragStart={user?.role === 'admin' ? () => handleDragStart(columnId, item) : undefined}
                          onDoubleClick={() => setViewFeatureData(item)}
                          className={`px-2 py-1 sm:p-4 mb-1.5 sm:mb-3 bg-zinc-700/20 hover:bg-zinc-700/50 text-white shadow-md rounded-lg border border-zinc-700 flex items-center justify-between transform transition-all duration-200 hover:scale-105 hover:shadow-lg ${user?.role === 'admin' ? 'cursor-move' : 'cursor-default'}`}
                        >
                          <div className='flex flex-col justify-center w-full'>
                            <div className="flex justify-between items-center">
                              <span className='mr-2 text-sm sm:text-md'>{item.feature}</span>
                              {user?.role === 'admin' && (
                                <div className='flex items-center justify-center '>
                                  <button onClick={() => setEditFeatureData(item)} className='text-zinc-400 hover:text-blue-400 transition-colors duration-200 w-6 h-6 flex items-center justify-center rounded-full hover:bg-zinc-600'>
                                    <span className='text-lg cursor-pointer '><FaRegEdit className='size-3' /></span>
                                  </button><button onClick={() => { setDeleteFeatureId(item.id); setOpen(true); }} className='text-zinc-400 hover:text-red-400 transition-colors duration-200 w-6 h-6 flex items-center justify-center rounded-full hover:bg-zinc-600'>
                                    <span className='text-md cursor-pointer'><IoTrashOutline className='size-3.5' /></span>
                                  </button>
                                </div>
                              )}
                            </div>
                            <span className='text-xs sm:text-sm text-zinc-400 text-wrap line-clamp-2'>{item.desc}</span>
                            <div className="flex gap-5 text-xs sm:text-sm justify-between border-t border-zinc-600 mt-2 pt-1">
                              <span className='text-sm text-zinc-400'>{item.assign === user.email ? user.name : item.assign.split("@")[0]}</span>
                              <span className='text-xs sm:text-sm text-zinc-400'>{formatDateManually(item.due_date)}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
      <Dialog open={open} onClose={isDeleting ? () => { } : setOpen} className="relative z-50">
        <div className="fixed inset-0 bg-zinc-900/80 backdrop-blur-md" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="relative w-full max-w-lg rounded-lg border-t-4 border-red-600 bg-gradient-to-r from-zinc-800 to-red-900/10 shadow-lg">
            <div className="border border-zinc-700/30 px-4 pt-4 pb-5 rounded-t-lg">
              <Dialog.Title className="mb-3 flex items-center gap-2 border-b border-zinc-700/80 pb-2 text-xl font-bold text-white">
                <ExclamationTriangleIcon className="size-5 rounded border border-zinc-700/90 p-0.5 text-red-400" />
                <span>Delete Feature</span>
              </Dialog.Title>

              <p className="text-sm text-zinc-300">
                Are you sure you want to delete this feature? This action cannot be undone.
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
                onClick={handleDeleteFeature}
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
  )
}

export default Kanban

