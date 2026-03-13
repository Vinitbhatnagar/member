import React from "react";

const FILTER_OPTIONS = ["All", "Paid", "Unpaid"];

const FilterTabs = ({ activeFilter, onChange }) => {
    return (
        <div className="flex gap-2">
            {FILTER_OPTIONS.map((option) => {
                const isActive = option === activeFilter;

                return (
                    <button
                        key={option}
                        type="button"
                        onClick={() => onChange(option)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition duration-200 active:scale-95 ${
                            isActive ? "bg-gray-900 text-white shadow-sm" : "bg-gray-200 text-gray-700"
                        }`}
                    >
                        {option}
                    </button>
                );
            })}
        </div>
    );
};

export default FilterTabs;
