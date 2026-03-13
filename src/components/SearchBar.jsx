import React from "react";
import { FiSearch } from "react-icons/fi";

const SearchBar = ({ value, onChange }) => {
    return (
        <div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-3 shadow-sm ring-1 ring-gray-200">
            <FiSearch className="text-lg text-slate-400" />
            <input
                type="text"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Search customers..."
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
        </div>
    );
};

export default SearchBar;
