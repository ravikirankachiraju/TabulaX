import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface TableJoinComponentProps {
  connectionString: string;
  sourceTable: string;
  transformedColumn: string;
  onJoinComplete: (joinedTableName: string) => void;
}



interface RowCounts {
  sourceTable: number;
  targetTable: number;
  joinedTable: number;
}

const TableJoinComponent: React.FC<TableJoinComponentProps> = ({
  connectionString,
  sourceTable,
  transformedColumn,
  onJoinComplete
}) => {
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [targetTable, setTargetTable] = useState<string>('');
  const [joinColumn, setJoinColumn] = useState<string>(transformedColumn);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [joinedTableName, setJoinedTableName] = useState<string>('');
  const [customTableName, setCustomTableName] = useState<string>('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [rowCounts, setRowCounts] = useState<RowCounts | null>(null);
  const [joinComplete, setJoinComplete] = useState<boolean>(false);

  // Fetch available tables when component mounts
  useEffect(() => {
    fetchAvailableTables();
  }, []);

  // Fetch available columns when target table changes
  useEffect(() => {
    if (targetTable) {
      fetchTableColumns(targetTable);
    }
  }, [targetTable]);

  const fetchAvailableTables = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post('http://localhost:5001/api/connect', {
        connectionString,
        dbType: 'mysql'
      });
      
      if (response.data.success) {
        const tables = response.data.tables.filter((table: string) => table !== sourceTable);
        setAvailableTables(tables);
      } else {
        setError('Failed to fetch tables');
      }
    } catch (err) {
      setError('Error connecting to database');
      console.error('Error fetching tables:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTableColumns = async (tableName: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post(`http://localhost:5001/api/tables/${tableName}/columns`, {
        connectionString,
        dbType: 'mysql'
      });
      
      if (response.data.success) {
        setAvailableColumns(response.data.columns);
        
        // If the transformed column exists in the target table, preselect it
        if (response.data.columns.includes(transformedColumn)) {
          setJoinColumn(transformedColumn);
        } else if (response.data.columns.length > 0) {
          setJoinColumn(response.data.columns[0]);
        }
      } else {
        setError('Failed to fetch columns');
      }
    } catch (err) {
      setError('Error fetching columns');
      console.error('Error fetching columns:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinTables = async () => {
    if (!targetTable || !joinColumn) {
      setError('Please select a target table and join column');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const newTableName = customTableName || `joined_${sourceTable}_${targetTable}`;
      
      const response = await axios.post('http://localhost:5000/join-tables', {
        connectionString,
        sourceTable,
        targetTable,
        joinColumn,
        newTableName
      });
      
      if (response.data.success) {
        setJoinedTableName(response.data.joinedTableName);
        setPreviewData(response.data.preview);
        setRowCounts(response.data.rowCounts);
        setJoinComplete(true);
        onJoinComplete(response.data.joinedTableName);
      } else {
        setError('Failed to join tables');
      }
    } catch (err: any) {
      setError(`Error joining tables: ${err.response?.data?.error || err.message}`);
      console.error('Error joining tables:', err);
    } finally {
      setIsLoading(false);
    }
  };



  // Save to Database handler
  const handleSaveToDatabase = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:5000/save-joined-table', {
        tableName: joinedTableName,
        collectionName: customTableName || joinedTableName,
        data: previewData
      });
      if (response.data.success) {
        setJoinComplete(true);
        alert('Joined table saved to MongoDB successfully!');
      } else {
        setError('Failed to save joined table to MongoDB.');
      }
    } catch (err) {
      setError('Error saving joined table to MongoDB.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Join Tables</h2>
      
      {/* Source Table Info */}
      <div className="mb-4">
        <p className="text-gray-700">
          <span className="font-medium">Source Table:</span> {sourceTable}
        </p>
        <p className="text-gray-700">
          <span className="font-medium">Transformed Column:</span> {transformedColumn}
        </p>
      </div>
      
      {/* Target Table Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Target Table to Join
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          value={targetTable}
          onChange={(e) => setTargetTable(e.target.value)}
          disabled={isLoading || joinComplete}
        >
          <option value="">Select a table</option>
          {availableTables.map((table) => (
            <option key={table} value={table}>
              {table}
            </option>
          ))}
        </select>
      </div>
      
      {/* Join Column Selection */}
      {targetTable && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Column to Join On
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={joinColumn}
            onChange={(e) => setJoinColumn(e.target.value)}
            disabled={isLoading || joinComplete}
          >
            <option value="">Select a column</option>
            {availableColumns.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            The join will be performed on columns with the same name in both tables.
          </p>
        </div>
      )}
      
      {/* Custom Table Name */}
      {targetTable && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Custom Name for Joined Table (Optional)
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder={`joined_${sourceTable}_${targetTable}`}
            value={customTableName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomTableName(e.target.value)}
            disabled={isLoading || joinComplete}
          />
        </div>
      )}
      
      {/* Join Button */}
      {!joinComplete ? (
        <button
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          onClick={handleJoinTables}
          disabled={isLoading || !targetTable || !joinColumn}
        >
          {isLoading ? (
            <>
              <ArrowPathIcon className="inline-block w-5 h-5 mr-2 animate-spin" />
              Joining Tables...
            </>
          ) : (
            'Join Tables'
          )}
        </button>
      ) : (
        <div className="flex items-center justify-center p-2 bg-green-100 text-green-800 rounded-md mb-4">
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          Tables joined successfully!
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="mt-4 p-2 bg-red-100 text-red-800 rounded-md">
          {error}
        </div>
      )}
      
      {/* Join Results */}
      {joinComplete && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Join Results</h3>
          
          {/* Row Counts */}
          {rowCounts && (
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-100 p-3 rounded-md text-center">
                <p className="text-sm text-gray-500">Source Table</p>
                <p className="text-xl font-semibold">{rowCounts.sourceTable} rows</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-md text-center">
                <p className="text-sm text-gray-500">Target Table</p>
                <p className="text-xl font-semibold">{rowCounts.targetTable} rows</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-md text-center">
                <p className="text-sm text-gray-500">Joined Table</p>
                <p className="text-xl font-semibold">{rowCounts.joinedTable} rows</p>
              </div>
            </div>
          )}
        
          
          {/* Save to Database Button & Collection Name Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Name for Joined Table (Optional)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 mb-2"
              value={customTableName || joinedTableName}
              onChange={e => setCustomTableName(e.target.value)}
              disabled={isLoading}
              placeholder={joinedTableName}
            />
            <button
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
              onClick={handleSaveToDatabase}
              disabled={isLoading || !joinedTableName || !previewData.length}
            >
              {isLoading ? (
                <>
                  <ArrowPathIcon className="inline-block w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Joined Table to Database'
              )}
            </button>
          </div>
          
          {/* Preview Data */}
          {previewData.length > 0 && (
            <div>
              <h4 className="text-md font-medium mb-2">Preview (First {previewData.length} rows)</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(previewData[0]).map((column) => (
                        <th
                          key={column}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Object.values(row).map((value: any, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          >
                            {value === null ? 'NULL' : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="mt-4 p-3 bg-blue-100 text-blue-800 rounded-md">
            <p className="font-medium">Joined table "{joinedTableName}" has been saved to the database.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TableJoinComponent;