import { useState } from 'react'

const Kanban = () => {
  const [columns, setColumns] = useState({
    todo: {
      name: "To Do",
      items: [
        {
          feature: "Implement user authentication",
          description: "Allow users to register and login to the application",
          assignee: "John Doe",
          dueDate: "2024-07-15",
          id: "1",
        }
      ]
    },
    inProgress: {
      name: "In Progress",
      items: [
        {
          feature: "Implement user authentication",
          description: "Allow users to register and login to the application",
          assignee: "John Doe",
          dueDate: "2024-07-15",
          id: "2",
        }
      ]
    },
    done: {
      name: "Done",
      items: [
        {
          feature: "Implement user authentication",
          description: "Allow users to register and login to the application",
          assignee: "John Doe",
          dueDate: "2024-07-15",
          id: "3",
        }
      ]
    },
  })

  const [newTask, setNewTask] = useState({
    feature: "",
    description: "",
    assignee: "",
    dueDate: "",
  })
  const [activeColumn, setActiveColumn] = useState("todo")
  const [draggedItem, setDraggedItem] = useState(null)

  const addNewTask = () => {
    if (newTask.feature.trim() === "") return;

    const updatedColumns = { ...columns };

    updatedColumns[activeColumn].items.push({
      ...newTask,
      id: Date.now().toString(),
    })

    setColumns(updatedColumns)
    setNewTask({
      feature: "",
      description: "",
      assignee: "",
      dueDate: "",
    })
  }

  const removeTask = (columnId, taskId) => {
    const updatedColumns = { ...columns };

    updatedColumns[columnId].items = updatedColumns[columnId].items.filter(item => item.id !== taskId)

    setColumns(updatedColumns)
  }

  const handleDragStart = (columnId, item) => {
    setDraggedItem({ columnId, item })
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e, columnId) => {
    e.preventDefault()

    if (!draggedItem) return;

    const { columnId: sourceColumnId, item } = draggedItem;

    if (sourceColumnId === columnId) return;

    const updatedColumns = { ...columns };
    updatedColumns[sourceColumnId].items = updatedColumns[sourceColumnId].items.filter(i => i.id !== item.id)

    updatedColumns[columnId].items.push(item)
    setColumns(updatedColumns)
    setDraggedItem(null)
  }

  const columnStyles = {
    todo: {
      header: "bg-gradient-to-r from-blue-600 to-blue-400",
      border: "border-blue-400",
    },
    inProgress: {
      header: "bg-gradient-to-r from-yellow-600 to-yellow-400",
      border: "border-yellow-400",
    },
    done: {
      header: "bg-gradient-to-r from-green-600 to-green-400",
      border: "border-green-400",
    }
  }

  return (
    <div>
      <div className='p-6 w-full min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-600 flex items-center justify-center'>
        <div className='flex items-center justify-center flex-col gap-4 w-full max-w-6xl'>
          <h1 className='text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-500 to-rose-400'>Project Features Kanban Board</h1>

          <div className="mb-8 flex w-full max-w-lg shadow-lg rounded-lg overflow-hidden bg-zinc-800 border-t-4 ">
            <form onSubmit={(e) => { e.preventDefault(); addNewTask() }} className="flex flex-col w-full">
              <div className="flex flex-col w-full ">
                <div className='flex items-center justify-center '>
                  <label className='px-3 py-1 text-white bg-zinc-700' htmlFor="Feature">Feature :</label>
                  <input type="text" value={newTask.feature}
                    onChange={(e) => setNewTask({ ...newTask, feature: e.target.value })}
                    placeholder="Add new task..."
                    className="flex-grow px-3 py-1 text-zinc-400 bg-zinc-700"
                  />
                  <select value={activeColumn}
                    onChange={(e) => setActiveColumn(e.target.value)}
                    className="flex items-center justify-center px-3 py-1 text-white bg-zinc-700 border-zinc-600 h-full"
                  >
                    {Object.keys(columns).map((columnId) => (
                      <option value={columnId} key={columnId}>{columns[columnId].name}</option>
                    ))}
                  </select>
                </div>
                <div className='flex items-center justify-center bg-zinc-700'>
                  <div>
                    <label className='p-3 text-white' htmlFor="Due Date">Due Date :</label>
                    <input type="date" value={newTask.dueDate}
                      className='flex-grow px-3 py-1 text-zinc-400  text-sm bg-zinc-700'
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className='p-3 text-white' htmlFor="Assignee">Assignee :</label>
                    <input type="text" value={newTask.assignee} placeholder='Assign To'
                      className='flex-grow px-3 py-1 text-zinc-400 bg-zinc-700 '
                      onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                    />
                  </div>
                </div>
                <label className='px-3 py-1 text-white bg-zinc-700' htmlFor="Description">Description :</label>
                <textarea value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Enter description..."
                  className="flex-grow px-3 py-1 text-zinc-400 bg-zinc-700  border-zinc-600"
                />
              </div>

              <button type='submit' className='border-t-2 border-black bg-gradient-to-r from-yellow-600 to-amber-500 text-white font-medium hover:from-yellow-500 hover:to-amber-500 transition-all duration-200 cursor-pointer'>Add</button>
            </form>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-6 w-full">
            {Object.keys(columns).map((columnId) => (
              <div key={columnId} className={`flex-shrink-0 w-80 bg-zinc-800 rounded-lg shadow-x-lg border-t-4 ${columnStyles[columnId].border}`}
                onDragOver={(e) => handleDragOver(e, columnId)}
                onDrop={(e) => handleDrop(e, columnId)}
              >
                <div className={`p-4 text-white font-bold text-xl rounded-t-md ${columnStyles[columnId].header}`}>
                  {columns[columnId].name}
                  <span className="ml-2 px-2 py-1 bg-zinc-800 bg-opacity-30 rounded-full text-sm">{columns[columnId].items.length}</span>
                </div>
                <div className="p-3 min-h-64">
                  {columns[columnId].items.length === 0 ? (
                    <div className="text-center text-zinc-500 italic text-sm ">Add Features Here</div>
                  ) : (
                    columns[columnId].items.map((item) => (
                      <div key={item.id} className='p-4 mb-3 bg-zinc-700 text-white shadow-md cursor-move flex items-center justify-between transform transition-all duration-200 hover:scale-105 hover:shadow-lg' draggable onDragStart={() => handleDragStart(columnId, item)}>
                        <div className='flex flex-col justify-center'>
                          <span className='mr-2'>{item.feature}</span>
                          <div className="flex gap-5 text-sm">
                            <span className='text-sm text-zinc-400'>Due On: {item.dueDate}</span>
                            <span className='text-sm text-zinc-400'>{item.assignee}</span>
                          </div>
                          <span className='text-sm text-zinc-400'>{item.description}</span>
                        </div>
                        <button onClick={() => removeTask(columnId, item.id)} className='text-zinc-400 hover:text-red-400 transition-colors duration-200 w-6 h-6 flex items-center justify-center rounded-full hover:bg-zinc-600'>
                          <span className='text-lg cursor-pointer '>X</span>
                        </button>
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

