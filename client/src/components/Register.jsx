import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, clearAuthMessages } from "../store/slices/authSlice";
import { IoChevronBackOutline } from "react-icons/io5";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  useEffect(() => { 
    dispatch(clearAuthMessages()); 
    if (token) navigate("/dashboard");
  }, [dispatch, token, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser(form));
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 animate-ios-fade-in">
      {/* iOS Header */}
      <header className="flex justify-between items-center py-4 mb-4">
        <div className="w-1/3">
          <Link to="/login" className="text-[#007AFF] text-[17px] tracking-normal font-normal ios-active-scale flex items-center -ml-2">
            <IoChevronBackOutline className="text-xl" />
            Sign In
          </Link>
        </div>
        <h2 className="text-[17px] font-semibold tracking-normal text-center w-1/3">Sign Up</h2>
        <div className="w-1/3"></div>
      </header>

      <div className="max-w-md mx-auto pt-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Create Account</h1>
        <p className="text-[17px] text-[#EBEBF5]/60 mb-8">Join Vitreous to manage your tasks.</p>

        {error && (
          <div className="bg-[#FF3B30]/10 border border-[#FF3B30]/30 text-[#FF3B30] px-4 py-3 rounded-2xl mb-6 text-[15px] font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="ios-input-group mb-8">
            <div className="ios-input-row">
              <input 
                type="text" 
                className="ios-input" 
                placeholder="Username" 
                value={form.username} 
                onChange={(e) => setForm({ ...form, username: e.target.value })} 
                required 
              />
            </div>
            <div className="ios-input-row">
              <input 
                type="email" 
                className="ios-input" 
                placeholder="Email" 
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
                required 
              />
            </div>
            <div className="ios-input-row">
              <input 
                type="password" 
                className="ios-input tracking-widest font-mono py-[13px]" 
                placeholder="Password" 
                value={form.password} 
                onChange={(e) => setForm({ ...form, password: e.target.value })} 
                required 
              />
            </div>
          </div>
          
          <button type="submit" className="ios-btn-primary" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
