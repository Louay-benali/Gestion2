const Loader = () => {
  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-white/70 flex flex-col items-center justify-center z-[1000]">
      <div className="w-[60px] h-[60px] border-8 border-t-[#3b80aa] border-gray-200 rounded-full animate-spin mb-2" />
      <p className="text-gray-600 font-medium">Chargement...</p>
    </div>
  );
};

export default Loader;
