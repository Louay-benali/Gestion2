import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useForgotPassword from "../../hooks/useForgotPassword";

const ForgotPassword = () => {
  const { email, setEmail, loading, handleForgotPassword } = useForgotPassword();

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      {loading && (
        <div className="fixed inset-0 bg-white/70 flex flex-col justify-center items-center z-50">
          <div className="w-16 h-16 border-8 border-gray-200 border-t-[#3b80aa] rounded-full animate-spin mb-4"></div>
          <p className="text-gray-700">Chargement...</p>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-2xl shadow-[rgba(59,128,170,0.25)] p-8 w-full max-w-md text-center">
        <form 
          onSubmit={handleForgotPassword}
          className="flex flex-col items-center justify-center"
        >
          <h1 className="text-3xl font-bold mb-5">Forgot Password</h1>
          <span className="text-sm text-gray-600 mb-6">
            Enter your email to reset your password
          </span>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-gray-100 border-none py-3 px-4 my-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b80aa]"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="mt-6 rounded-full border border-[#3b80aa] bg-[#3b80aa] text-white text-xs font-bold py-3 px-12 uppercase tracking-wider transition duration-75 transform active:scale-95 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
          >
            Send Reset Link
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ForgotPassword;
