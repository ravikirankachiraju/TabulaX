import { useState, useEffect } from 'react';
import ColumnSelector from '../components/ColumnSelector';
import SamplePreview from '../components/SamplePreview';
import TransformationBox from '../components/TransformationBox';
import TestFunctionBox from '../components/TestFunctionBox';
import ConfirmApply from '../components/ConfirmApply';
import FileUploader from '../components/FileUploader';
import DatabaseConnection from '../components/DatabaseConnectionComponent';

type SamplesMap = Record<string, string[]>;

interface SamplesState {
  source: SamplesMap;
  target: SamplesMap;
  input: SamplesMap; 
}

const DemoPage = () => {
  const [sourceColumns, setSourceColumns] = useState<string[]>([]);
  const [targetColumns, setTargetColumns] = useState<string[]>([]);
  const [inputColumns, setInputColumns] = useState<string[]>([]);

  const [samples, setSamples] = useState<SamplesState>({ source: {}, target: {}, input: {} });
  const [selectedSourceColumn, setSelectedSourceColumn] = useState<string>('');
  const [selectedTargetColumn, setSelectedTargetColumn] = useState<string>('');
  const [selectedInputColumn, setSelectedInputColumn] = useState<string>('');

  const [code, setCode] = useState<string>('');
  const [transformationType, setTransformationType] = useState<string>('');
  
  // Data source selection state
  const [dataSource, setDataSource] = useState<'file' | 'database'>('file');
  const [databaseConnected, setDatabaseConnected] = useState<boolean>(false);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [databaseColumn, setDatabaseColumn] = useState<string>('');
  const [databaseColumnData, setDatabaseColumnData] = useState<string[]>([]);
  const [completeTableData, setCompleteTableData] = useState<any[]>([]);

  // Transformation results state
  const [transformedData, setTransformedData] = useState<any[] | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  
  // Handle transformation completion
  const handleTransformationComplete = (data: any[]) => {
    setTransformedData(data);
    setShowResults(true);
    // Scroll to results after a short delay to ensure DOM is updated
    setTimeout(() => {
      const resultsElement = document.getElementById('transformation-results');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  // Reset transformation results when changing data source
  useEffect(() => {
    setTransformedData(null);
    setShowResults(false);
  }, [dataSource, selectedInputColumn, databaseColumn]);

  return (
    <div className="pt-24 pb-16 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      <div className="container-custom max-w-6xl mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">TabulaX - Data Transformation</h1>
          <p className="text-slate-600 text-lg max-w-3xl mx-auto">
            Upload your source and target files. Write your logic. Then test it on an input!
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-12 p-8 space-y-8 border border-slate-200">

          {/* File Uploaders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 border rounded-xl bg-slate-50 shadow-inner">
              <FileUploader type="source" setColumns={setSourceColumns} setSamples={setSamples} />
            </div>
            <div className="p-6 border rounded-xl bg-slate-50 shadow-inner">
              <FileUploader type="target" setColumns={setTargetColumns} setSamples={setSamples} />
            </div>
          </div>

          {/* Column Selectors */}
          {(sourceColumns.length > 0 || targetColumns.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {sourceColumns.length > 0 && (
                <ColumnSelector
                  columns={sourceColumns}
                  onSelect={setSelectedSourceColumn}
                  label="Select Source Column"
                />
              )}
              {targetColumns.length > 0 && (
                <ColumnSelector
                  columns={targetColumns}
                  onSelect={setSelectedTargetColumn}
                  label="Select Target Column"
                />
              )}
            </div>
          )}

          {/* Sample Previews */}
          {(selectedSourceColumn || selectedTargetColumn) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {selectedSourceColumn && samples.source?.[selectedSourceColumn]?.length > 0 && (
                <SamplePreview
                  samples={samples.source[selectedSourceColumn]}
                  title="Source Samples"
                />
              )}
              {selectedTargetColumn && samples.target?.[selectedTargetColumn]?.length > 0 && (
                <SamplePreview
                  samples={samples.target[selectedTargetColumn]}
                  title="Target Samples"
                />
              )}
            </div>
          )}

          {/* Transformation Code Box */}
          {selectedSourceColumn &&
            selectedTargetColumn &&
            samples.source?.[selectedSourceColumn]?.length > 0 &&
            samples.target?.[selectedTargetColumn]?.length > 0 && (
              <TransformationBox
                samples={samples.source[selectedSourceColumn]}
                targetValues={samples.target[selectedTargetColumn]}
                code={code}
                setCode={setCode}
                onTransformationTypeChange={setTransformationType}
              />
          )}

          {/* Additional Steps for applying transformation */}
          {code && (
            <>
              {selectedSourceColumn && samples.source?.[selectedSourceColumn]?.length > 0 && (
                <TestFunctionBox code={code} />
              )}

              {/* Data Source Selector */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Choose Your Data Source</h3>
                <div className="flex space-x-4">
                  <button
                    className={`px-6 py-3 rounded-lg text-lg font-medium ${
                      dataSource === 'file' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                    onClick={() => setDataSource('file')}
                  >
                    Upload File
                  </button>
                  <button
                    className={`px-6 py-3 rounded-lg text-lg font-medium ${
                      dataSource === 'database' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                    onClick={() => setDataSource('database')}
                  >
                    Connect to Database
                  </button>
                </div>
              </div>

              {/* File Upload Option */}
              {dataSource === 'file' && (
                <>
                  <div className="p-6 border rounded-xl bg-slate-50 shadow-inner">
                    <FileUploader type="input" setColumns={setInputColumns} setSamples={setSamples} />
                  </div>

                  {inputColumns.length > 0 && (
                    <ColumnSelector
                      columns={inputColumns}
                      onSelect={setSelectedInputColumn}
                      label="Select Input Column"
                    />
                  )}

                  {selectedInputColumn && samples.input?.[selectedInputColumn]?.length > 0 && (
                    <SamplePreview
                      samples={samples.input[selectedInputColumn]}
                      title="Input Samples"
                    />
                  )}

                  {selectedInputColumn && code && (
                    <ConfirmApply 
                      column={selectedInputColumn} 
                      code={code} 
                      transformationType={transformationType}
                      onTransformationComplete={handleTransformationComplete}
                      sourceValues={selectedSourceColumn && samples.source[selectedSourceColumn] ? 
                        samples.source[selectedSourceColumn].map(val => val !== null ? val : "")
                        : []}
                      targetValues={selectedTargetColumn && samples.target[selectedTargetColumn] ? 
                        samples.target[selectedTargetColumn].map(val => val !== null ? val : "")
                        : []}
                    />
                  )}
                </>
              )}

              {/* Database Connection Option */}
              {dataSource === 'database' && (
                <>
                  <DatabaseConnection 
                    onTableSelect={(table) => {
                      console.log('Table selected:', table);
                      setSelectedTable(table);
                    }}
                    onColumnSelect={(column) => {
                      console.log('Column selected:', column);
                      setDatabaseColumn(column);
                    }}
                    onConnectionSuccess={(connected) => {
                      console.log('Connection status changed:', connected);
                      setDatabaseConnected(connected);
                    }}
                    onColumnDataFetched={(data) => {
                      console.log('Received complete table data:', {
                        rowCount: data.length,
                        sampleRow: data[0],
                        columns: data[0] ? Object.keys(data[0]) : []
                      });
                      
                      // Store the complete table data
                      setCompleteTableData(data);
                      
                      // Extract just the column values for the selected column
                      const columnValues = data.map((row: any) => {
                        const value = row[databaseColumn];
                        // Ensure we have a string representation for display
                        return value !== undefined && value !== null ? String(value) : "";
                      });
                      setDatabaseColumnData(columnValues);
                      
                      // Update samples state with the column data
                      if (columnValues.length > 0) {
                        setSamples(prev => ({
                          ...prev,
                          input: {
                            ...prev.input,
                            [databaseColumn]: columnValues
                          }
                        }));
                        
                        // Set input columns - use all columns from the table
                        if (data[0]) {
                          const allColumns = Object.keys(data[0]);
                          console.log('Setting all table columns:', allColumns);
                          setInputColumns(allColumns);
                          setSelectedInputColumn(databaseColumn);
                        } else {
                          setInputColumns([databaseColumn]);
                          setSelectedInputColumn(databaseColumn);
                        }
                      }
                    }}
                  />
              
                  {databaseConnected && selectedTable && (
                    <div className="p-6 border border-blue-100 rounded-xl bg-blue-50 mb-4">
                      <h3 className="text-xl font-semibold mb-4 text-blue-800">Database Connection Successful</h3>
                      <div className="mb-4 text-blue-700">
                        <p>
                          Connected to table: <span className="font-bold">{selectedTable}</span>
                        </p>
                        {completeTableData.length > 0 && (
                          <div className="mt-4">
                            <p className="font-semibold mb-2">Table Preview:</p>
                            <div className="overflow-x-auto max-h-[300px] bg-white rounded border border-blue-200">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-blue-50 sticky top-0">
                                  <tr>
                                    {completeTableData[0] && Object.keys(completeTableData[0]).map((col, idx) => (
                                      <th key={idx} className="px-4 py-2 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                                        {col}
                                        {col === databaseColumn && (
                                          <span className="ml-2 bg-blue-200 text-blue-800 text-xs px-2 py-0.5 rounded">
                                            Selected
                                          </span>
                                        )}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {completeTableData.slice(0, 5).map((row, rowIdx) => (
                                    <tr key={rowIdx} className={rowIdx % 2 === 0 ? '' : 'bg-gray-50'}>
                                      {Object.entries(row).map(([col, val], cellIdx) => (
                                        <td key={cellIdx} className={`px-4 py-2 whitespace-nowrap text-sm ${col === databaseColumn ? 'bg-blue-50 font-medium text-blue-800' : 'text-gray-500'}`}>
                                          {String(val)}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            {completeTableData.length > 5 && (
                              <p className="text-sm text-blue-600 mt-2">
                                Showing 5 of {completeTableData.length} rows
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {databaseColumn && code && (
                        <div className="mt-6 p-4 border border-green-100 rounded-xl bg-green-50">
                          <h3 className="text-lg font-semibold mb-2 text-green-800">Ready to Apply Transformation</h3>
                          <div className="mb-4 text-green-700">
                            <p>Your transformation will be applied to column: <span className="font-bold">{databaseColumn}</span></p>
                            {databaseColumnData.length > 0 && (
                              <div className="mt-2">
                                <p className="font-semibold">Sample values:</p>
                                <div className="bg-white p-2 rounded mt-1 text-slate-700 text-sm">
                                  {databaseColumnData.slice(0, 5).map((value, index) => (
                                    <div key={index} className="mb-1">{value}</div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <ConfirmApply 
                            column={databaseColumn} 
                            code={code} 
                            transformationType={transformationType}
                            onTransformationComplete={handleTransformationComplete}
                            sourceValues={selectedSourceColumn && samples.source[selectedSourceColumn] ? 
                              samples.source[selectedSourceColumn].map(val => val !== null ? val : "")
                              : []}
                            targetValues={selectedTargetColumn && samples.target[selectedTargetColumn] ? 
                              samples.target[selectedTargetColumn].map(val => val !== null ? val : "")
                              : []}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Transformation Results Section */}
        {showResults && transformedData && (
          <div id="transformation-results" className="bg-white rounded-3xl shadow-xl overflow-hidden my-12 p-8 border border-slate-200">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Transformation Results</h2>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-6 border border-blue-100">
              <p className="text-blue-800">
                <span className="font-semibold">Success!</span> Your transformation has been applied. The table below shows both the original and transformed data.
              </p>
            </div>
            
            <div className="overflow-x-auto max-h-[500px] border rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {transformedData.length > 0 && Object.keys(transformedData[0]).map((column, index) => {
                      // Check if this is the transformed column (the one that was selected for transformation)
                      const isTransformedColumn = dataSource === 'database' 
                        ? column === databaseColumn 
                        : column === selectedInputColumn;
                      
                      return (
                        <th 
                          key={index}
                          className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isTransformedColumn ? 'bg-blue-100 text-blue-800' : 'text-gray-500'}`}
                        >
                          {column}
                          {isTransformedColumn && (
                            <span className="ml-2 bg-blue-200 text-blue-800 text-xs px-2 py-0.5 rounded">
                              Transformed
                            </span>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transformedData.slice(0, 15).map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? '' : 'bg-gray-50'}>
                      {Object.entries(row).map(([column, value], cellIndex) => {
                        // Check if this is the transformed column (the one that was selected for transformation)
                        const isTransformedColumn = dataSource === 'database' 
                          ? column === databaseColumn 
                          : column === selectedInputColumn;
                        
                        return (
                          <td 
                            key={cellIndex} 
                            className={`px-6 py-4 whitespace-nowrap text-sm ${isTransformedColumn ? 'bg-blue-50 text-blue-800 font-medium' : 'text-gray-500'}`}
                          >
                            {String(value)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {transformedData.length > 15 && (
              <p className="text-sm text-gray-500 mt-4">
                Showing 15 of {transformedData.length} rows. Use the download button in the transformation panel to get the complete dataset.
              </p>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start space-x-4">
            <div className="text-blue-500 mt-1">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm1.07-7.75l-.9.92A1.49 1.49 0 0012 12h-.01v1h-2v-.5a3.5 3.5 0 012.45-3.34l1.1-1.1a1 1 0 10-1.41-1.41l-.54.53-1.42-1.42.54-.54a3 3 0 114.24 4.24z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">How to use this demo</h3>
              <ol className="list-decimal space-y-2 pl-5 text-slate-700">
                <li>Upload your source and target samples</li>
                <li>Select one column each from source and target</li>
                <li>Write transformation code</li>
                <li>Choose your data source:
                  <ul className="list-disc pl-5 mt-1">
                    <li>Upload a file and select input column, or</li>
                    <li>Connect to a database and select table and column</li>
                  </ul>
                </li>
                <li>Test and apply the transformation</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;