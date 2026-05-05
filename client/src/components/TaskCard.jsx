import React from "react";
import { IoChevronForwardOutline, IoCalendarOutline, IoTrashOutline, IoCreateOutline } from "react-icons/io5";

function formatDeadline(d) {
  const date = new Date(d);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function priorityColor(label) {
  const map = { 
    Overdue: "#FF3B30", // System Red
    Critical: "#FF3B30", 
    High: "#FF9500", // System Orange
    Medium: "#FFCC00", // System Yellow
    Low: "#34C759", // System Green
    Completed: "#8E8E93" // System Gray
  };
  return map[label] || "#34C759";
}

export default React.memo(function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  return (
    <div className="relative p-4 pl-12 border-b border-[#38383A] last:border-0 bg-[#1C1C1E] active:bg-[#2C2C2E] ios-transition flex items-center justify-between group">
      
      {/* Priority Indicator Dot */}
      <div 
        className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full" 
        style={{ backgroundColor: priorityColor(task.priorityLabel) }}
      />
      
      <div className="flex-1 pr-4 min-w-0">
        <h3 className="text-[17px] font-semibold text-white tracking-tight truncate mb-0.5">
          {task.title}
        </h3>
        <p className="text-[15px] text-[#EBEBF5]/60 truncate mb-1.5">
          {task.description}
        </p>
        
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-medium text-[#EBEBF5]/60 flex items-center gap-1">
            <IoCalendarOutline className="text-[14px]" />
            {formatDeadline(task.deadline)}
          </span>
          <span className="text-[13px] font-medium text-[#007AFF]">
            {task.category}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {/* iOS Native-looking Select */}
        <div className="relative overflow-hidden bg-[#2C2C2E] rounded-lg">
          <select
            className="appearance-none bg-transparent text-[#007AFF] text-[13px] font-semibold py-1.5 pl-3 pr-6 outline-none cursor-pointer ios-active-scale"
            value={task.status}
            onChange={(e) => onStatusChange(task, e.target.value)}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#007AFF]">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>
        
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 ios-transition">
          <button 
            className="w-8 h-8 rounded-full bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center ios-active-scale"
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
          >
            <IoCreateOutline className="text-lg" />
          </button>
          <button 
            className="w-8 h-8 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center ios-active-scale"
            onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}
          >
            <IoTrashOutline className="text-lg" />
          </button>
        </div>
        
        <IoChevronForwardOutline className="text-[#EBEBF5]/30 text-xl ml-1 group-hover:hidden" />
      </div>
    </div>
  );
});
