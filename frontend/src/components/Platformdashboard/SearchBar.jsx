// nO CHANGE

import React from "react";

const SearchBar = ({ value, onChange, placeholder = "Search files and folders." }) => (
  <div className="flex items-center bg-[#18181b] px-4 py-2 rounded-lg shadow border border-[#23232a] w-full max-w-md">
    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
    <input
      className="bg-transparent outline-none text-gray-200 w-full placeholder-gray-400"
      type="text"
      value={value}
      onChange={e => onChange && onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

export default SearchBar; 