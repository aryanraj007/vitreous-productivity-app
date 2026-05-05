import React, { useState, useEffect } from "react";

export default function TaskModal({ task, onSubmit, onClose }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    status: "Pending",
    deadline: "",
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        category: task.category || "",
        status: task.status || "Pending",
        deadline: task.deadline ? new Date(task.deadline).toISOString().split("T")[0] : "",
      });
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 animate-ios-fade-in p-0 sm:p-4">
      <div 
        className="bg-[#1C1C1E] w-full max-w-lg rounded-t-[20px] sm:rounded-[20px] shadow-2xl relative overflow-hidden animate-ios-slide-up flex flex-col max-h-[90vh]" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* iOS Native-like Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-[#38383A] bg-[#1C1C1E] sticky top-0 z-10">
          <button type="button" onClick={onClose} className="text-[#007AFF] text-[17px] tracking-normal font-normal ios-active-scale">
            Cancel
          </button>
          <h2 className="text-[17px] font-semibold text-white tracking-normal">
            {task ? "Edit Task" : "New Task"}
          </h2>
          <button type="button" onClick={handleSubmit} className="text-[#007AFF] text-[17px] font-semibold tracking-normal ios-active-scale">
            {task ? "Save" : "Add"}
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-black p-4 pb-12">
          
          <div className="ios-input-group mb-6">
            <div className="ios-input-row">
              <input 
                id="task-title" 
                type="text" 
                className="ios-input" 
                placeholder="Title" 
                value={form.title} 
                onChange={(e) => setForm({ ...form, title: e.target.value })} 
                required 
              />
            </div>
            <div className="ios-input-row">
              <textarea 
                id="task-desc" 
                rows="3" 
                className="ios-input resize-none py-3" 
                placeholder="Notes" 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                required 
              />
            </div>
          </div>

          <div className="ios-input-group mb-6">
            <div className="ios-input-row flex items-center justify-between px-4 py-1.5 bg-[#1C1C1E]">
              <label htmlFor="task-category" className="text-[17px] text-white">Category</label>
              <input 
                id="task-category" 
                type="text" 
                className="bg-transparent text-[17px] text-[#EBEBF5]/60 text-right outline-none w-1/2 py-2" 
                placeholder="e.g. Work" 
                value={form.category} 
                onChange={(e) => setForm({ ...form, category: e.target.value })} 
                required 
              />
            </div>
          </div>
          
          <div className="ios-input-group mb-6">
            <div className="ios-input-row flex items-center justify-between px-4 py-1.5 bg-[#1C1C1E]">
              <label htmlFor="task-status" className="text-[17px] text-white">Status</label>
              <select 
                id="task-status" 
                className="appearance-none bg-transparent text-[17px] text-[#EBEBF5]/60 text-right outline-none w-1/2 py-2 cursor-pointer" 
                value={form.status} 
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="Pending" className="bg-[#1C1C1E] text-white">Pending</option>
                <option value="In Progress" className="bg-[#1C1C1E] text-white">In Progress</option>
                <option value="Completed" className="bg-[#1C1C1E] text-white">Completed</option>
              </select>
            </div>
            <div className="ios-input-row flex items-center justify-between px-4 py-1.5 bg-[#1C1C1E]">
              <label htmlFor="task-deadline" className="text-[17px] text-white">Deadline</label>
              <input 
                id="task-deadline" 
                type="date" 
                className="bg-transparent text-[17px] text-[#EBEBF5]/60 text-right outline-none w-1/2 py-2 [color-scheme:dark]" 
                value={form.deadline} 
                onChange={(e) => setForm({ ...form, deadline: e.target.value })} 
                required 
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
