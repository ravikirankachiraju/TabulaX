import React, { useState } from "react";
import { ClipboardCopy } from "lucide-react";

interface SamplePreviewProps {
  samples: string[];
  title?: string;
}

const SamplePreview: React.FC<SamplePreviewProps> = ({
  samples,
  title = "Sample Values",
}) => {
  const [filter, setFilter] = useState("");

  const filteredSamples = samples.filter((val) =>
    val.toLowerCase().includes(filter.toLowerCase())
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">
          {title}
          <span className="ml-2 text-sm text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
            {samples.length}
          </span>
        </h3>

        <input
          type="text"
          placeholder="Search..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {filteredSamples.length > 0 ? (
        <div className="overflow-auto rounded-2xl border border-slate-200 shadow max-h-80">
          <table className="min-w-full text-sm text-left text-slate-700">
            <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3 text-slate-600 font-semibold tracking-wide">
                  Value
                </th>
                <th className="px-6 py-3 text-slate-600 font-semibold tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSamples.map((val, index) => (
                <tr
                  key={index}
                  className={`transition duration-150 ${
                    index % 2 === 0 ? "bg-white" : "bg-slate-50"
                  } hover:bg-blue-50`}
                >
                  <td className="px-6 py-2">{val}</td>
                  <td className="px-6 py-2">
                    <button
                      onClick={() => handleCopy(val)}
                      className="text-blue-500 hover:text-blue-700 transition flex items-center space-x-1 text-sm"
                    >
                      <ClipboardCopy size={16} />
                      <span>Copy</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-slate-500 italic">No samples match your search.</p>
      )}
    </div>
  );
};

export default SamplePreview;
