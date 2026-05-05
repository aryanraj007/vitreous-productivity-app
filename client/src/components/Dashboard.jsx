import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import { fetchTasks, createTask, updateTask, deleteTask } from "../store/slices/taskSlice";
import { connectSocket, disconnectSocket } from "../services/socket";
import TaskModal from "./TaskModal";
import TaskCard from "./TaskCard";
import { IoAddOutline, IoLogOutOutline, IoCheckmarkCircle, IoTimeOutline, IoListOutline, IoPodiumOutline, IoGridOutline } from "react-icons/io5";

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((s) => s.auth);
  const { items: tasks, loading } = useSelector((s) => s.tasks);

  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    if (token) {
      connectSocket(token);
      dispatch(fetchTasks());
    }
    return () => disconnectSocket();
  }, [token, dispatch]);

  const handleLogout = () => {
    disconnectSocket();
    dispatch(logout());
    navigate("/login");
  };

  const handleCreateOrUpdate = useCallback((data) => {
    if (editTask) {
      dispatch(updateTask({ id: editTask._id, ...data }));
    } else {
      dispatch(createTask(data));
    }
    setModalOpen(false);
    setEditTask(null);
  }, [editTask, dispatch]);

  const handleEdit = useCallback((task) => {
    setEditTask(task);
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback((id) => {
    dispatch(deleteTask(id));
  }, [dispatch]);

  const handleStatusChange = useCallback((task, newStatus) => {
    dispatch(updateTask({ id: task._id, status: newStatus }));
  }, [dispatch]);

  const filteredTasks = useMemo(() => {
    if (filter === "All") return tasks;
    if (filter === "Overdue") return tasks.filter((t) => t.isOverdue);
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter]);

  const insights = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "Completed").length;
    const pending = tasks.filter((t) => t.status !== "Completed").length;
    const overdue = tasks.filter((t) => t.isOverdue).length;

    const catCounts = {};
    tasks.forEach((t) => {
      catCounts[t.category] = (catCounts[t.category] || 0) + 1;
    });
    const mostActive = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];

    return { total, completed, pending, overdue, mostActiveCategory: mostActive ? mostActive[0] : "—" };
  }, [tasks]);

  const filters = ["All", "Pending", "In Progress", "Completed", "Overdue"];

  return (
    <div className="min-h-screen bg-black pb-24 md:pb-0 md:pl-64">
      {/* iOS Top Navigation Bar */}
      <header className="ios-glass sticky top-0 z-40 px-4 py-3 flex justify-between items-center md:hidden">
        <h2 className="text-xl font-semibold">Vitreous</h2>
        <button onClick={() => { setEditTask(null); setModalOpen(true); }} className="text-[#007AFF] text-3xl ios-active-scale">
          <IoAddOutline />
        </button>
      </header>

      {/* Sidebar (Tablet/Desktop) */}
      <aside className="hidden md:flex w-64 fixed inset-y-0 left-0 z-40 bg-[#1C1C1E] border-r border-[#38383A] flex-col pt-12 pb-8 px-4">
        <div className="px-4 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Vitreous</h1>
        </div>
        
        <nav className="flex flex-col gap-1 flex-1">
          <a href="#dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#2C2C2E] text-white font-semibold">
            <IoGridOutline className="text-xl text-[#007AFF]" />
            Dashboard
          </a>
        </nav>

        <div className="mt-auto">
          <div className="flex items-center gap-3 bg-[#000000] p-3 rounded-2xl mb-4">
            <div className="w-10 h-10 rounded-full bg-[#007AFF] flex items-center justify-center font-bold text-white text-lg">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="font-semibold text-white truncate text-[15px]">{user?.username}</div>
              <div className="text-[13px] text-[#EBEBF5]/60 truncate">{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-[#2C2C2E] font-medium transition-colors w-full text-left ios-active-scale">
            <IoLogOutOutline className="text-xl" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="p-4 md:p-8 max-w-5xl mx-auto">
        <div className="hidden md:flex justify-between items-end mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <button onClick={() => { setEditTask(null); setModalOpen(true); }} className="text-[#007AFF] flex items-center gap-1 font-semibold text-[17px] ios-active-scale">
            <IoAddOutline className="text-2xl" /> Add Task
          </button>
        </div>

        {/* Insights - Grouped Inset style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1C1C1E] p-4 rounded-[20px]">
            <div className="flex items-center gap-2 text-[#EBEBF5]/60 font-medium text-[13px] uppercase tracking-wide mb-2">
              <IoListOutline className="text-[#007AFF] text-lg" />
              Total
            </div>
            <div className="text-3xl font-bold">{insights.total}</div>
          </div>
          <div className="bg-[#1C1C1E] p-4 rounded-[20px]">
            <div className="flex items-center gap-2 text-[#EBEBF5]/60 font-medium text-[13px] uppercase tracking-wide mb-2">
              <IoCheckmarkCircle className="text-[#34C759] text-lg" />
              Completed
            </div>
            <div className="text-3xl font-bold">{insights.completed}</div>
          </div>
          <div className="bg-[#1C1C1E] p-4 rounded-[20px]">
            <div className="flex items-center gap-2 text-[#EBEBF5]/60 font-medium text-[13px] uppercase tracking-wide mb-2">
              <IoTimeOutline className="text-[#FF9500] text-lg" />
              Pending
            </div>
            <div className="text-3xl font-bold">{insights.pending}</div>
          </div>
          <div className="bg-[#1C1C1E] p-4 rounded-[20px]">
            <div className="flex items-center gap-2 text-[#EBEBF5]/60 font-medium text-[13px] uppercase tracking-wide mb-2">
              <IoPodiumOutline className="text-[#AF52DE] text-lg" />
              Top Cat
            </div>
            <div className="text-xl font-bold truncate mt-1">{insights.mostActiveCategory}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="overflow-x-auto pb-4 mb-2 no-scrollbar">
          <div className="flex gap-2">
            {filters.map((f) => (
              <button 
                key={f} 
                className={`px-4 py-1.5 rounded-full text-[15px] font-medium whitespace-nowrap ios-active-scale ios-transition ${filter === f ? "bg-[#FFFFFF] text-black" : "bg-[#1C1C1E] text-white"}`} 
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Task List Group */}
        <div className="mb-4 flex items-center justify-between px-1">
          <h2 className="text-[22px] font-semibold tracking-tight">Tasks</h2>
          {insights.overdue > 0 && (
            <span className="text-[13px] font-medium text-[#FF3B30] bg-[#FF3B30]/10 px-2 py-0.5 rounded-md">
              {insights.overdue} Overdue
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-2 border-[#38383A] border-t-[#007AFF] rounded-full animate-spin"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <IoListOutline className="text-6xl text-[#38383A] mb-4" />
            <h3 className="text-[20px] font-semibold text-white mb-1">No Tasks Found</h3>
            <p className="text-[15px] text-[#EBEBF5]/60">Tap + to create a new task.</p>
          </div>
        ) : (
          <div className="bg-[#1C1C1E] rounded-[20px] overflow-hidden">
            {filteredTasks.map((task) => (
              <TaskCard key={task._id} task={task} onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </main>

      {/* iOS Bottom Tab Bar (Mobile Only) */}
      <nav className="md:hidden ios-glass-bottom fixed bottom-0 w-full z-40 pb-safe pt-2 px-6 flex justify-around items-center">
        <button className="flex flex-col items-center gap-1 text-[#007AFF]">
          <IoGridOutline className="text-2xl" />
          <span className="text-[10px] font-medium">Dashboard</span>
        </button>
        <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-[#8E8E93]">
          <IoLogOutOutline className="text-2xl" />
          <span className="text-[10px] font-medium">Sign Out</span>
        </button>
      </nav>

      {/* Modal Sheet */}
      {modalOpen && (
        <TaskModal task={editTask} onSubmit={handleCreateOrUpdate} onClose={() => { setModalOpen(false); setEditTask(null); }} />
      )}
    </div>
  );
}
