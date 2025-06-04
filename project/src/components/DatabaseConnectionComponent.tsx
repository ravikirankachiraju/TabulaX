import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

interface DatabaseConnectionProps {
  onTableSelect: (table: string) => void;
  onColumnSelect: (column: string) => void;
  onConnectionSuccess: (
    connected: boolean,
    tables?: string[],
    connectionString?: string,
    dbType?: 'mysql' | 'dynamodb'
  ) => void;
  onColumnDataFetched?: (columnData: any[]) => void;
}

type DatabaseType = 'mysql' | 'dynamodb';

const DatabaseConnection = forwardRef(({ onTableSelect, onColumnSelect, onConnectionSuccess, onColumnDataFetched }: DatabaseConnectionProps, ref) => {
  // Database type selection
  const [dbType, setDbType] = useState<DatabaseType>('mysql');
  
  // MySQL connection params
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState('3306');
  const [database, setDatabase] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // DynamoDB connection params
  const [region, setRegion] = useState('us-east-1');
  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretAccessKey, setSecretAccessKey] = useState('');
  
  // Common state
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState('');

  // Generate connection string based on database type
  const generateConnectionString = () => {
    if (dbType === 'mysql') {
      return `mysql+pymysql://${username}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
    } else if (dbType === 'dynamodb') {
      // For DynamoDB, we'll return a JSON structure instead of a connection string
      // since DynamoDB uses boto3 and not SQLAlchemy
      return JSON.stringify({
        region_name: region,
        aws_access_key_id: accessKeyId,
        aws_secret_access_key: secretAccessKey
      });
    }
    return '';
  };
  
  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    generateConnectionString
  }));

  // Set default port based on database type
  useEffect(() => {
    if (dbType === 'mysql') {
      setPort('3306');
    }
  }, [dbType]);

  // Handle connection to database
  const handleConnect = async () => {
    setIsConnecting(true);
    setErrorMessage('');
    
    try {
      const connectionString = generateConnectionString();
      console.log(`Connecting to ${dbType} database...`);
      console.log(`Connection string (partial): ${connectionString.substring(0, 30)}...`);
      
      // Call the actual backend API with the connection string
      const response = await fetch('http://localhost:5001/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionString, dbType })
      });
      
      const data = await response.json();
      console.log('Response from server:', data);
      
      if (data.success) {
        console.log(`Connection successful! Tables found: ${JSON.stringify(data.tables)}`);
        setIsConnected(true);
        setTables(data.tables || []);
        // Pass tables, connectionString, and dbType to parent for all DB types
        onConnectionSuccess(true, data.tables || [], connectionString, dbType);
      } else {
        console.error('Connection failed:', data.error);
        setErrorMessage(data.error || 'Failed to connect to database');
      }
    } catch (error) {
      setErrorMessage('An error occurred while connecting to the database');
      console.error(error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Fetch columns for a table from the backend API
  const fetchTableColumns = async (table: string) => {
    try {
      const connectionString = generateConnectionString();
      
      const response = await fetch(`http://localhost:5001/api/tables/${table}/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionString, dbType })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.columns || [];
      } else {
        console.error('Error fetching columns:', data.error);
        return [];
      }
    } catch (error) {
      console.error('Error fetching columns:', error);
      return [];
    }
  };

  // Handle table selection
  const handleTableSelect = async (table: string) => {
    setSelectedTable(table);
    setSelectedColumn('');
    onTableSelect(table);
    
    try {
      const tableColumns = await fetchTableColumns(table);
      setColumns(tableColumns);
    } catch (error) {
      console.error('Error fetching table columns', error);
      setColumns([]);
    }
  };

  // Fetch column data from the database
  const fetchColumnData = async (table: string, column: string) => {
    try {
      const connectionString = generateConnectionString();
      
      console.log(`Fetching data for ${table}.${column}`);
      
      const response = await fetch(`http://localhost:5001/api/tables/${table}/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionString, column, dbType })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`Retrieved ${data.rawData?.length || 0} rows of data`);
        
        // Send the data to the main application
        if (onColumnDataFetched && data.rawData) {
          // Send the complete raw data instead of just the column values
          // This ensures we have the entire table with all columns
          console.log('Sending complete table data to main application:', {
            rowCount: data.rawData.length,
            columnCount: data.columns?.length || Object.keys(data.rawData[0] || {}).length,
            sampleRow: data.rawData[0]
          });
          onColumnDataFetched(data.rawData);
          
          // Also send the data to the server for transformation
          try {
            const setDataResponse = await fetch('http://localhost:5000/set-sql-data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                columns: data.columns, 
                rawData: data.rawData,
                dbType: dbType
              })
            });
            
            const setDataResult = await setDataResponse.json();
            console.log('Data set for transformation:', setDataResult);
          } catch (error) {
            console.error('Error setting data for transformation:', error);
          }
        }
        
        return data.rawData || [];
      } else {
        console.error('Error fetching column data:', data.error);
        return [];
      }
    } catch (error) {
      console.error('Error fetching column data:', error);
      return [];
    }
  };
  
  // Handle column selection
  const handleColumnSelect = async (column: string) => {
    setSelectedColumn(column);
    onColumnSelect(column);
    
    if (selectedTable && column) {
      // Fetch the actual data for this column
      await fetchColumnData(selectedTable, column);
    }
  };

  return (
    <div className="p-6 border rounded-xl bg-slate-50 shadow-inner">
      <h3 className="text-xl font-semibold mb-4">Database Connection</h3>
      
      {!isConnected ? (
        <div className="space-y-4">
          <div className="flex space-x-2 mb-4">
            <button
              className={`px-3 py-2 rounded-lg text-sm ${dbType === 'mysql' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setDbType('mysql')}
            >
              MySQL
            </button>
            <button
              className={`px-3 py-2 rounded-lg text-sm ${dbType === 'dynamodb' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setDbType('dynamodb')}
            >
              DynamoDB (IAM)
            </button>
          </div>
          
          {dbType === 'mysql' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                  <input
                    type="text"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Database Name</label>
                <input
                  type="text"
                  value={database}
                  onChange={(e) => setDatabase(e.target.value)}
                  placeholder="mydatabase"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">AWS Region</label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="us-east-1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Access Key ID</label>
                <input
                  type="text"
                  value={accessKeyId}
                  onChange={(e) => setAccessKeyId(e.target.value)}
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secret Access Key</label>
                <input
                  type="password"
                  value={secretAccessKey}
                  onChange={(e) => setSecretAccessKey(e.target.value)}
                  placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
          
          <div className="pt-2">
            <div className="flex items-center mb-2">
              <div className="text-sm font-medium text-gray-700">Connection String:</div>
              <div className="ml-2 text-xs text-gray-500">(Auto-generated from fields)</div>
            </div>
            <div className="p-2 bg-gray-100 rounded-md border border-gray-300 font-mono text-sm truncate">
              {generateConnectionString()}
            </div>
          </div>
          
          {errorMessage && (
            <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
          )}
          
          <button
            onClick={handleConnect}
            disabled={isConnecting || 
              (dbType === 'mysql' && (!host || !port || !database || !username || !password)) ||
              (dbType === 'dynamodb' && (!region || !accessKeyId || !secretAccessKey))
            }
            className={`w-full py-2 px-4 rounded-md font-medium text-white ${
              isConnecting || 
              (dbType === 'mysql' && (!host || !port || !database || !username || !password)) ||
              (dbType === 'dynamodb' && (!region || !accessKeyId || !secretAccessKey))
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isConnecting ? 'Connecting...' : 'Connect to Database'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Connected to {dbType === 'mysql' ? 'MySQL' : 'DynamoDB'} Database</span>
            </div>
            <button
              onClick={() => {
                setIsConnected(false);
                setSelectedTable('');
                setSelectedColumn('');
                setTables([]);
                setColumns([]);
                onConnectionSuccess(false);
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Disconnect
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Table</label>
            <select
              value={selectedTable}
              onChange={(e) => handleTableSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a table</option>
              {tables.map((table) => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
            </select>
          </div>
          
          {selectedTable && columns.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Column to Transform</label>
              <select
                value={selectedColumn}
                onChange={(e) => handleColumnSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a column</option>
                {columns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
});  // Close the forwardRef

export default DatabaseConnection;