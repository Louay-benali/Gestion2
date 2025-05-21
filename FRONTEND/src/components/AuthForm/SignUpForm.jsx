import React from "react";
import useAuth from "../../hooks/useAuth";

const SignUpForm = ({ data, setData, onSubmit }) => {
  const { handleGoogleSignIn } = useAuth();

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white flex flex-col items-center justify-center px-12 h-full text-center"
    >
      <h1 className="font-bold text-[40px] m-0 mb-5 text-gray-800">
        Create Account
      </h1>

      <div className="my-1 flex">
        <a
          href="#"
          className="border border-gray-300 rounded-full flex justify-center items-center h-10 w-10 mx-1 text-gray-700 hover:bg-gray-100 transition"
          onClick={handleGoogleSignIn}
        >
          <i className="fab fa-google-plus-g"></i>
        </a>
      </div>

      <span className="text-xs text-gray-500 mb-5">
        or use your email for registration
      </span>

      <input
        type="text"
        placeholder="Nom"
        value={data.nom}
        onChange={(e) => setData({ ...data, nom: e.target.value })}
        required
        className="bg-gray-100 border-none py-2 px-4 my-1 w-full text-sm rounded focus:outline-none focus:ring-2 focus:ring-[#3b80aa]"
      />

      <input
        type="text"
        placeholder="Prenom"
        value={data.prenom}
        onChange={(e) => setData({ ...data, prenom: e.target.value })}
        required
        className="bg-gray-100 border-none py-2 px-4 my-1 w-full text-sm rounded focus:outline-none focus:ring-2 focus:ring-[#3b80aa]"
      />

      <input
        type="email"
        placeholder="Email"
        value={data.email}
        onChange={(e) => setData({ ...data, email: e.target.value })}
        required
        className="bg-gray-100 border-none py-2 px-4 my-1 w-full text-sm rounded focus:outline-none focus:ring-2 focus:ring-[#3b80aa]"
      />

      <input
        type="password"
        placeholder="Password"
        value={data.motDePasse}
        onChange={(e) => setData({ ...data, motDePasse: e.target.value })}
        required
        className="bg-gray-100 border-none py-2 px-4 my-1 w-full text-sm rounded focus:outline-none focus:ring-2 focus:ring-[#3b80aa]"
      />

      <input
        type="tel"
        placeholder="Téléphone"
        value={data.telephone}
        onChange={(e) => setData({ ...data, telephone: e.target.value })}
        className="bg-gray-100 border-none py-2 px-4 my-1 w-full text-sm rounded focus:outline-none focus:ring-2 focus:ring-[#3b80aa]"
      />

      <input
        type="text"
        placeholder="Adresse"
        value={data.adresse}
        onChange={(e) => setData({ ...data, adresse: e.target.value })}
        className="bg-gray-100 border-none py-2 px-4 my-1 w-full text-sm rounded focus:outline-none focus:ring-2 focus:ring-[#3b80aa]"
      />

      <button
        type="submit"
        className="rounded-full border border-[#3b80aa] bg-[#3b80aa] text-white text-xs font-bold py-3 px-12 uppercase tracking-wider mt-4 hover:bg-[#35729a] active:scale-95 transition duration-100"
      >
        Sign Up
      </button>
    </form>
  );
};

export default SignUpForm;
