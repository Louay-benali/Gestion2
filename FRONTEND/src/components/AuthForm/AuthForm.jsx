import React, { useState, useEffect } from "react";
import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import OverlayPanel from "./OverlayPanel";
import Loader from "./Loader";
import useAuth from "../../hooks/useAuth";
import { useSearchParams } from "react-router-dom";

const AuthForm = () => {
  const [searchParams] = useSearchParams();
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [signUpData, setSignUpData] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    telephone: "",
    adresse: "",
    role: "operateur",
  });
  const [signInData, setSignInData] = useState({
    email: "",
    motDePasse: "",
  });

  const { handleSignUp, handleSignIn, loading } = useAuth();

  // Check for error parameters in the URL
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'auth_failed') {
      toast.error("L'authentification Google a échoué. Veuillez réessayer ou utiliser une autre méthode de connexion.", {
        position: "bottom-center",
        autoClose: 5000,
        theme: "light",
        transition: Bounce,
      });
    } else if (error === 'user_not_found') {
      toast.error("Utilisateur non trouvé. Veuillez vous inscrire d'abord.", {
        position: "bottom-center",
        autoClose: 5000,
        theme: "light",
        transition: Bounce,
      });
    }
  }, [searchParams]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 py-6 px-5">
      {loading && <Loader />}

      <div
        className={`relative bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-3xl h-[480px] ${
          isRightPanelActive ? "right-panel-active" : ""
        }`}
        style={{
          boxShadow:
            "0 14px 28px rgba(59, 128, 170, 0.25), 0 10px 10px rgba(59, 128, 170, 0.22)",
        }}
      >
        {/* Container for both forms */}
        <div className="absolute top-0 left-0 h-full w-full">
          {/* Sign In Form */}
          <div
            className={`absolute top-0 left-0 h-full w-1/2 z-20 transition-transform duration-700 ease-in-out ${
              isRightPanelActive ? "translate-x-full" : ""
            }`}
          >
            <SignInForm
              data={signInData}
              setData={setSignInData}
              onSubmit={(e) => {
                e.preventDefault();
                handleSignIn(signInData);
              }}
            />
          </div>

          {/* Sign Up Form */}
          <div
            className={`absolute top-0 left-0 h-full w-1/2 z-10 opacity-0 ${
              isRightPanelActive ? "translate-x-full opacity-100 z-50" : ""
            } transition-all duration-700 ease-in-out`}
          >
            <SignUpForm
              data={signUpData}
              setData={setSignUpData}
              onSubmit={(e) => {
                e.preventDefault();
                handleSignUp(signUpData);
              }}
            />
          </div>
        </div>

        {/* Overlay Panel */}
        <OverlayPanel
          isRightPanelActive={isRightPanelActive}
          setIsRightPanelActive={setIsRightPanelActive}
        />
      </div>

      {/* CSS for animation */}
      <style jsx="true">{`
        .right-panel-active .opacity-0 {
          animation: show 0.6s;
        }

        @keyframes show {
          0%,
          49.99% {
            opacity: 0;
            z-index: 10;
          }
          50%,
          100% {
            opacity: 1;
            z-index: 50;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthForm;
