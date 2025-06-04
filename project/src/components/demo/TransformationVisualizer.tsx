import React, { useState } from 'react';
import { Search, ArrowDownUp, Download, Filter } from 'lucide-react';

interface TransformationVisualizerProps {
  transformedData: {
    headers: string[];
    data: any[];
  };
}

const TransformationVisualizer: React.FC<TransformationVisualizerProps> = ({ transformedData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'ascending' | 'descending' | null;
  }>({
    key: null,
    direction: null,
  });
  
  // Search filter
  const filteredData = transformedData.data.filter((row) => {
    return Object.values(row).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  // Sorting
  const sortedData = React.useMemo(() => {
    let sortableData = [...filteredData];
    if (sortConfig.key && sortConfig.direction) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [filteredData, sortConfig]);
  
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' | null = 'ascending';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'ascending') {
        direction = 'descending';
      } else if (sortConfig.direction === 'descending') {
        direction = null;
      }
    }
    setSortConfig({ key, direction });
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between mb-4 items-start md:items-center gap-4">
        <div className="flex items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search table..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>
        <div className="text-slate-600 text-sm">
          Showing {sortedData.length} of {transformedData.data.length} rows
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              {transformedData.headers.map((header) => (
                <th key={header}>
                  <button
                    className="group flex items-center"
                    onClick={() => requestSort(header)}
                  >
                    {header}
                    <span className="ml-1">
                      <ArrowDownUp
                        size={14}
                        className={`
                          ${sortConfig.key === header ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}
                          ${sortConfig.key === header && sortConfig.direction === 'descending' ? 'rotate-180' : ''}
                        `}
                      />
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.length > 0 ? (
              sortedData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {transformedData.headers.map((header) => (
                    <td key={`${rowIndex}-${header}`}>{row[header]}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={transformedData.headers.length}
                  className="text-center py-8 text-slate-500"
                >
                  No data found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransformationVisualizer;