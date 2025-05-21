import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useEmailVerification from "../../hooks/useEmailVerification";

const EmailVerification = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const { handleVerifyEmail, loading } = useEmailVerification();

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
          onSubmit={(e) => {
            e.preventDefault();
            handleVerifyEmail(verificationCode);
          }}
          className="flex flex-col items-center justify-center"
        >
          <h1 className="text-3xl font-bold mb-5">Vérification Email</h1>
          <span className="text-sm text-gray-600 mb-6">
            Entrez le code de vérification envoyé à votre email
          </span>
          <input
            type="text"
            placeholder="Code de vérification"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            required
            className="bg-gray-100 border-none py-3 px-4 my-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-[#3b80aa]"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-6 rounded-full border border-[#3b80aa] bg-[#3b80aa] text-white text-xs font-bold py-3 px-12 uppercase tracking-wider transition duration-75 transform active:scale-95 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
          >
            Vérifier
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default EmailVerification;
