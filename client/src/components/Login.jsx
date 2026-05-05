import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, clearAuthMessages } from "../store/slices/authSlice";
import { IoChevronBackOutline } from "react-icons/io5";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => { 
    dispatch(clearAuthMessages()); 
    if (token) navigate("/dashboard");
  }, [dispatch, token, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(form));
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* iOS Header */}
      <header className="flex justify-between items-center py-4 mb-4">
        <div className="w-1/3"></div>
        <h2 className="text-[17px] font-semibold tracking-normal text-center w-1/3">Sign In</h2>
        <div className="w-1/3 flex justify-end">
          <Link to="/register" className="text-[#007AFF] text-[17px] tracking-normal font-normal ios-active-scale">
            Sign Up
          </Link>
        </div>
      </header>

      <div className="max-w-md mx-auto pt-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Vitreous</h1>
        <p className="text-[17px] text-[#EBEBF5]/60 mb-8">Sign in to access your tasks.</p>

        {error && (
          <div className="bg-[#FF3B30]/10 border border-[#FF3B30]/30 text-[#FF3B30] px-4 py-3 rounded-2xl mb-6 text-[15px] font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="ios-input-group mb-8">
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
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center">
          <button className="text-[#007AFF] text-[15px] font-medium ios-active-scale">
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
}
