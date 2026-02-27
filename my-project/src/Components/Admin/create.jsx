const Create = () => {
  return (
    <div>
      <div className="p-6 w-full min-h-dvh bg-gradient-to-b from-zinc-900 to-zinc-600 flex flex-col items-center justify-center"  >
      <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-500 to-rose-400">Create New Project</h2>
      <form className="bg-zinc-800 p-6 rounded-lg shadow-2xl w-full max-w-md flex flex-col gap-4">
        <div className="flex flex-col w-full ">
          <label className="text-white mb-2" required>Project Name</label>
          <input type="text" placeholder="Enter project name" className="bg-zinc-700 text-white p-2 rounded-md border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
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

