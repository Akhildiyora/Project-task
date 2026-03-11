import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useUserDataContext } from '../../../Context/UserDataContext'
import Popup from 'reactjs-popup';
import { FaRegEdit } from "react-icons/fa";
import formatDateManually from '../../dateFormater';
import { IoTrashOutline, IoAddCircleOutline } from "react-icons/io5";
import { MdOutlineEdit } from "react-icons/md";

const Kanban = () => {
  const { id: projectId } = useParams();
  const { user } = useUserDataContext();
  const [columns, setColumns] = useState({
    todo: { name: "To Do", items: [] },
    inProgress: { name: "In Progress", items: [] },
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
      const response = await fetch(`http://localhost:3000/projects/${projectId}`, { credentials: 'include' });
      const data = await response.json();
      setProject(data);
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  };

  const fetchfeatures = async () => {
    try {
      const response = await fetch(`http://localhost:3000/features?projectId=${projectId}`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error(`Failed to fetch features: ${response.status}`);
      }
      const data = await response.json();
      const newColumns = {
        todo: { name: "To Do", items: data.filter(t => t.status === 'todo') },
        inProgress: { name: "In Progress", items: data.filter(t => t.status === 'inProgress') },
        done: { name: "Done", items: data.filter(t => t.status === 'done') },
      };
      setColumns(newColumns);
    } catch (error) {
      console.error("Error fetching features:", error);
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
  const [activeColumn, setActiveColumn] = useState("todo")
  const [draggedItem, setDraggedItem] = useState(null)

  const addnewFeature = async () => {
    if (newFeature.feature.trim() === "") return;

    try {
      const response = await fetch('http://localhost:3000/features', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newFeature, status: activeColumn, project_id: projectId })
      });
      if (response.ok) {
        fetchfeatures();
        setnewFeature({ feature: "", desc: "", assign: "", due_date: "" });
      }
    } catch (error) {
      console.error("Error adding feature:", error);
      alert(error.message);
    }
  }

  const permitRemove = ((columnId, featrueid) => {
    if (confirm("Are You Sure to Delete This Feature!")) {
      removefeature(columnId, featrueid);
    } else {
      return;
    }

    return;
  })

  const removefeature = async (columnId, featureId) => {
    try {
      await fetch(`http://localhost:3000/features/${featureId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      fetchfeatures();

    } catch (error) {
      console.error("Error removing feature:", error);
      alert(error.message);
    }

  }

  const submitEditFeature = async () => {
    if (!editFeatureData || editFeatureData.feature.trim() === "") return;

    try {
      const response = await fetch(`http://localhost:3000/features/${editFeatureData.id}`, {
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
      } else {
        alert("Failed to update feature");
      }
    } catch (error) {
      console.error("Error updating feature:", error);
      alert(error.message);
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
    if (sourceColumnId === columnId) return;

    try {
      await fetch(`http://localhost:3000/features/${item.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: columnId })
      });
      fetchfeatures();
    } catch (error) {
      console.error("Error moving feature:", error);
      alert(error.message);
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
      <div className='p-6 mt-18 w-full min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-600 flex items-start justify-center'>
        <div className='flex items-center flex-col gap-4 w-full max-w-6xl'>
          <div className='flex items-center justify-between w-full px-20 gap-4'>
            <h1 className='text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-blue-200/80 to-blue-200/50'>{project?.project_name || "Loading..."}</h1>

            <Popup onClose={() => setnewFeature(feature.length === 0)} trigger={<button className="bg-gradient-to-r from-green-600/50 to-green-400/80 text-white hover:text-zinc-900 px-4 py-2 rounded hover:from-green-300/70 hover:to-green-500 transition duration-200 cursor-pointer">Add New Feature</button>}
              modal nested
            >
              {
                close => user?.role === 'admin' ? (
                  <div className="h-screen w-screen flex items-center justify-center bg-zinc-900/80 fixed top-0 left-0 z-50 backdrop-blur-md">
                    <div className="relative mb-8 flex w-full max-w-lg shadow-lg rounded-lg bg-gradient-to-r from-zinc-900 to-blue-900/10 border-t-4 border-blue-400">
                      <button className="absolute -top-9 right-0 bg-black rounded-full px-2.5 font-bold py-1 text-zinc-400 hover:text-red-400 transition-colors duration-200 z-60" onClick={close}>X</button>
                      <form onSubmit={(e) => { e.preventDefault(); addnewFeature(); }} className="flex flex-col w-full ">
                        <div className="flex flex-col w-full rounded-t-md bg-transparent px-1 pt-2 pb-4 border border-zinc-700/30 hover:border-zinc-700">
                          <h2 className="text-xl font-bold text-white mb-4 px-3 flex items-center gap-2"><IoAddCircleOutline className='text-gray-400 ' />
                            Add Feature</h2>
                          <div className='flex flex-col border-t border-zinc-700/80 pt-2'>
                            <label className='px-2 py-1 text-zinc-400 text-sm bg-transparent' htmlFor="Feature">Feature</label>
                            <input type="text" value={newFeature.feature}
                              onChange={(e) => setnewFeature({ ...newFeature, feature: e.target.value })}
                              placeholder="Add new feature..."
                              className="flex-grow px-3 py-1 text-zinc-400 border border-zinc-700/30 hover:border-zinc-700 rounded-lg bg-zinc-800/20"
                            />
                          </div>
                          <div className='flex gap-3 items-center justify-center bg-transparent'>
                            <div>
                              <label className='px-2 text-zinc-400 text-sm' htmlFor="Due Date">Due Date</label>
                              <input type="date" value={newFeature.due_date}
                                className='flex-grow scheme-light-dark px-3 py-1 text-zinc-100 border border-zinc-700/30 hover:border-zinc-700 rounded-lg bg-zinc-800/20'
                                onChange={(e) => setnewFeature({ ...newFeature, due_date: e.target.value })}
                              />
                            </div>
                            <div>
                              <label htmlFor="" className='px-2 text-zinc-400 text-sm'>Status</label>
                              <select value={activeColumn}
                              onChange={(e) => setActiveColumn(e.target.value)}
                              className="flex items-center justify-center px-1 py-1 text-white border border-zinc-700/30 hover:border-zinc-700 rounded-lg bg-zinc-800/20"
                            >
                              {Object.keys(columns).map((columnId) => (
                                <option className='bg-gray-900 text-white' value={columnId} key={columnId}>{columns[columnId].name}</option>
                              ))}
                            </select>
                            </div>
                            <div>
                              <label className='px-2 text-zinc-400 text-sm' htmlFor="Assign">Assign To</label>
                              <input type="text" value={newFeature.assign} placeholder='Email of Assign To...'
                                className='flex-grow px-3 py-1 text-zinc-100 border border-zinc-700/30 hover:border-zinc-700 rounded-lg bg-zinc-800/20'
                                onChange={(e) => setnewFeature({ ...newFeature, assign: e.target.value })}
                              />
                            </div>
                          </div>
                          <label className='px-3 py-1 mt-2 text-zinc-400 text-sm bg-transparent' htmlFor="Description">Description</label>
                          <textarea value={newFeature.desc}
                            onChange={(e) => setnewFeature({ ...newFeature, desc: e.target.value })}
                            placeholder="Enter description..."
                            className="flex-grow px-3 py-1 text-zinc-100 border border-zinc-700/30 hover:border-zinc-700 rounded-lg bg-zinc-800/20"
                          />
                        </div>

                        <button type='submit' className='border-t-2 py-1 border-black bg-gradient-to-r from-blue-500 to-blue-400 text-white font-medium hover:from-blue-400 hover:to-sky-500 transition-all duration-200 cursor-pointer'>Add Feature</button>
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
                    <div className="relative mb-8 flex w-full max-w-lg shadow-lg rounded-lg bg-gradient-to-r from-zinc-800 to-yellow-600/10 border-t-4 border-yellow-600">
                      <button className="absolute -top-9 right-0 bg-black rounded-full px-2.5 font-bold py-1 text-zinc-400 hover:text-red-400 transition-colors duration-200 z-60" onClick={close}>X</button>
                      <form onSubmit={(e) => { e.preventDefault(); submitEditFeature(); }} className="flex flex-col w-full ">
                        <div className="flex flex-col w-full rounded-t-md bg-transparent px-1 pt-2 pb-4 border border-zinc-700/30 hover:border-zinc-700">
                          <div className="text-xl font-bold text-white mb-4 px-3 flex items-center gap-2">
                            <MdOutlineEdit className='text-gray-400 border border-zinc-700/90 rounded p-0.5' />
                            <span>Edit Feature</span>
                            <span className='text-gray-500 text-sm'>#{editFeatureData.id}</span>
                          </div>
                          <div className='flex items-center justify-between border-t border-zinc-700/80 pt-2'>
                            <label className='px-2 py-1 text-white text-xl bg-transparent' htmlFor="Feature">{editFeatureData.feature}</label>

                          </div>
                          <div className='flex gap-3 items-center bg-transparent'>
                            <div>
                              <label className='px-2 text-zinc-400 text-sm ' htmlFor="Due Date">Due Date </label>
                              <input type="date" value={editFeatureData.due_date || ""}
                                className='flex-grow scheme-light-dark px-3 py-1 text-zinc-100 border border-zinc-700/30 hover:border-zinc-700 rounded-lg bg-zinc-800/40'
                                onChange={(e) => setEditFeatureData({ ...editFeatureData, due_date: e.target.value })}
                              />
                            </div>
                            <div>
                              <label htmlFor="" className='px-2 text-zinc-400 text-sm'>Status</label>
                              <select value={editFeatureData.status}
                                onChange={(e) => setEditFeatureData({ ...editFeatureData, status: e.target.value })}
                                className="flex items-center justify-center rounded-lg px-1 py-1 text-white bg-zinc-800/40 border border-zinc-700/30 hover:border-zinc-700"
                              >
                                {Object.keys(columns).map((columnId) => (
                                  <option className='bg-zinc-800 rounded-lg' value={columnId} key={columnId}>{columns[columnId].name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className='px-2 text-zinc-400 text-sm' htmlFor="Assign">Assign To </label>
                              <input type="text" value={editFeatureData.assign || ""} placeholder='Email of Assign To...'
                                className='flex-grow px-3 py-1 text-zinc-100 border border-zinc-700/30 hover:border-zinc-700 rounded-lg bg-zinc-800/40 '
                                onChange={(e) => setEditFeatureData({ ...editFeatureData, assign: e.target.value })}
                              />
                            </div>
                          </div>
                          <label className='px-3 py-1 mt-2 text-zinc-400 text-sm bg-transparent' htmlFor="Description">Description </label>
                          <textarea value={editFeatureData.desc || ""}
                            onChange={(e) => setEditFeatureData({ ...editFeatureData, desc: e.target.value })}
                            placeholder="Enter description..."
                            className="flex-grow px-3 py-1 text-zinc-100 border border-zinc-700/30 hover:border-zinc-700 rounded-lg bg-zinc-800/40"
                          />
                        </div>

                        <button type='submit' className='border-t-2 border-black bg-gradient-to-r from-yellow-600 to-amber-600 text-white font-medium hover:from-yellow-500 hover:to-amber-500 transition-all duration-200 cursor-pointer py-1'>Save Changes</button>
                      </form>
                    </div>
                  </div>
                )
              }
            </Popup>
          </div>
          <div className="flex flex-wrap gap-6 overflow-x-auto pb-6 w-full items-start justify-center">
            {Object.keys(columns).map((columnId) => (
              <div key={columnId} className={`flex-shrink-0 w-80 rounded-lg shadow-x-lg border-t-4 ${columnStyles[columnId].border}`}
                onDragOver={user?.role === 'admin' ? (e) => handleDragOver(e, columnId) : undefined}
                onDrop={user?.role === 'admin' ? (e) => handleDrop(e, columnId) : undefined}
              >
                <div className={`p-4 text-white font-bold text-xl rounded-t-md ${columnStyles[columnId].header}`}>
                  {columns[columnId].name}
                  <span className="ml-2 px-2 py-1 bg-zinc-800 bg-opacity-30 rounded-full text-sm">{columns[columnId].items.length}</span>
                </div>
                <div className="p-3 min-h-64 border border-zinc-700 rounded-lg">
                  {columns[columnId].items.length === 0 ? (
                    <div className="text-center text-zinc-500 italic text-sm ">Add Features Here</div>
                  ) : (
                    columns[columnId].items.map((item) => (
                      <div key={item.id} className={`p-4 mb-3 bg-zinc-700/20 hover:bg-zinc-700/50 text-white shadow-md rounded-lg border border-zinc-700 flex items-center justify-between transform transition-all duration-200 hover:scale-105 hover:shadow-lg ${user?.role === 'admin' ? 'cursor-move' : 'cursor-default'}`}
                        draggable={user?.role === 'admin'}
                        onDragStart={user?.role === 'admin' ? () => handleDragStart(columnId, item) : undefined}>
                        <div className='flex flex-col justify-center w-full'>
                          <div className="flex justify-between">
                            <span className='mr-2'>{item.feature}</span>
                            {user?.role === 'admin' && (
                              <div className='flex items-center justify-center '>
                                <button onClick={() => setEditFeatureData(item)} className='text-zinc-400 hover:text-blue-400 transition-colors duration-200 w-6 h-6 flex items-center justify-center rounded-full hover:bg-zinc-600'>
                                  <span className='text-lg cursor-pointer '><FaRegEdit className='size-3' /></span>
                                </button><button onClick={() => permitRemove(columnId, item.id)} className='text-zinc-400 hover:text-red-400 transition-colors duration-200 w-6 h-6 flex items-center justify-center rounded-full hover:bg-zinc-600'>
                                  <span className='text-md cursor-pointer'><IoTrashOutline className='size-3.5' /></span>
                                </button>
                              </div>
                            )}
                          </div>
                          <span className='text-sm text-zinc-400 text-wrap'>{item.desc}</span>
                          <div className="flex gap-5 text-sm justify-between border-t border-zinc-500 mt-2 pt-1">
                            <span className='text-sm text-zinc-400'>{item.assign}</span>
                            <span className='text-sm text-zinc-400'>{formatDateManually(item.due_date)}</span>
                          </div>
                        </div>
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

export default Kanban

