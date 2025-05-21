import React from "react";

const OverlayPanel = ({ isRightPanelActive, setIsRightPanelActive }) => (
  <div
    className={`absolute top-0 right-0 w-1/2 h-full text-white transition-transform duration-700 ease-in-out z-30 ${
      isRightPanelActive ? "translate-x-[-100%]" : ""
    }`}
  >
    <div className="bg-[#3b80aa] h-full w-full flex items-center justify-center">
      {isRightPanelActive ? (
        <div className="flex flex-col items-center justify-center px-10 text-center">
          <h1 className="font-bold m-0 text-[40px] text-white">
            Welcome Back!
          </h1>
          <p className="text-sm leading-relaxed tracking-wide mb-5">
            To keep connected with us please login with your personal info
          </p>
          <button
            className="rounded-full border border-white bg-transparent text-white text-xs font-bold py-3 px-12 uppercase tracking-wider transition-all hover:bg-white hover:text-[#3b80aa]"
            onClick={() => setIsRightPanelActive(false)}
          >
            Sign In
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center px-10 text-center">
          <h1 className="font-bold m-0 text-[40px] text-white">
            Hello, Friend!
          </h1>
          <p className="text-sm leading-relaxed tracking-wide mb-5">
            Enter your personal details and start journey with us
          </p>
          <button
            className="rounded-full border border-white bg-transparent text-white text-xs font-bold py-3 px-12 uppercase tracking-wider transition-all hover:bg-white hover:text-[#3b80aa]"
            onClick={() => setIsRightPanelActive(true)}
          >
            Sign Up
          </button>
        </div>
      )}
    </div>
  </div>
);

export default OverlayPanel;
