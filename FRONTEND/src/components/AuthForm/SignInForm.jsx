import React from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const SignInForm = ({ data, setData, onSubmit }) => {
  const navigate = useNavigate();
  const { handleGoogleSignIn } = useAuth();

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white flex flex-col items-center justify-center px-12 h-full text-center"
    >
      <h1 className="font-bold text-[40px] m-0 mb-5">Sign In</h1>
      <div className="my-1">
        <a
          href="#"
          className="border border-gray-300 rounded-full inline-flex justify-center items-center h-10 w-10 mx-1 text-gray-700 hover:bg-gray-100 transition"
          onClick={handleGoogleSignIn}
        >
          <i className="fab fa-google-plus-g"></i>
        </a>
      </div>
      <span className="text-sm mb-5">or use your account</span>
      <input
        type="email"
        placeholder="Email"
        value={data.email}
        onChange={(e) => setData({ ...data, email: e.target.value })}
        required
        className="bg-gray-100 border-none py-2 px-3 my-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-[#3b80aa]"
      />
      <input
        type="password"
        placeholder="Password"
        value={data.motDePasse}
        onChange={(e) => setData({ ...data, motDePasse: e.target.value })}
        required
        className="bg-gray-100 border-none py-2 px-3 my-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-[#3b80aa]"
      />
      <a
        href="#"
        onClick={() => navigate("/forgot-password")}
        className="text-sm text-gray-700 mt-4 mb-6"
      >
        Forgot your password?
      </a>
      <button
        type="submit"
        className="rounded-full border border-[#3b80aa] bg-[#3b80aa] text-white text-xs font-bold py-3 px-12 uppercase tracking-wider transition duration-75 transform active:scale-95 focus:outline-none hover:bg-[#35729a]"
      >
        Sign In
      </button>
    </form>
  );
};

export default SignInForm;
