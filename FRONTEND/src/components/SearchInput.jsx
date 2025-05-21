import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";

const SearchInput = ({ className ,  placeholder }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="relative w-fit">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <FiSearch size={20} />
      </div>
      <input
        id="search"
        name="search"
        type="text"
        value={searchQuery}
        onChange={handleSearch}
        className={`h-10 ${className} rounded-lg border border-gray-300 bg-transparent pl-10 pr-4 text-sm shadow-theme-xs transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10`}
        placeholder={`${placeholder}`}
      />
    </div>
  );
};

export default SearchInput;
