import React from "react";

interface ColumnSelectorProps {
  columns: string[];
  onSelect: (value: string) => void;
  label: string;
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  columns,
  onSelect,
  label,
}) => {
  return (
    <div className="relative w-full">
      <label className="absolute -top-2 left-3 px-1 text-xs font-semibold bg-white text-gray-500 transform scale-90 origin-top-left z-10">
        {label}
      </label>
      <select
        defaultValue=""
        onChange={(e) => onSelect(e.target.value)}
        className="w-full px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
      >
        <option value="" disabled>
          -- Select a column --
        </option>
        {columns.map((col) => (
          <option
            key={col}
            value={col}
            className="text-gray-700 hover:bg-blue-50"
          >
            {col}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ColumnSelector;
