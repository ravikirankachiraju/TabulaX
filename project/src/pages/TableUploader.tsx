import React, { useRef, useState } from 'react';
import DatabaseConnection from '../components/DatabaseConnectionComponent';
import { arrayToCSV, downloadCSV } from '../csvUtil';

interface UploadedFilePreview {
  file: File;
  name: string;
  type: string;
  size: number;
  columns: string[];
  previewRows: Record<string, any>[];
  error?: string;
}

const TableUploader: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFilePreview[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Database mode states ---
  const [mode, setMode] = useState<'file' | 'database'>('file');
  // Multiple DB connections
  type DBConn = {
    id: string;
    connected: boolean;
    connectionString: string;
    dbType: 'mysql' | 'dynamodb';
    tables: string[];
    selectedTables: string[];
    tableColumns: Record<string, string[]>; // tableName -> columns
    tablePreviewRows: Record<string, any[]>; // tableName -> rows
    loading: boolean;
  };
  const [dbConnections, setDbConnections] = useState<DBConn[]>([]);
  const [addingConnection, setAddingConnection] = useState(false);

  // Example input state
  const [exampleCSV, setExampleCSV] = useState('');
  const [exampleTable, setExampleTable] = useState<{columns: string[], rows: string[][]}>({columns: [''], rows: [['']]});

  // --- File handling as before ---
  const handleFiles = async (files: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(files);
    const previews: UploadedFilePreview[] = [];

    for (const file of fileArray) {
      let columns: string[] = [];
      let previewRows: Record<string, any>[] = [];
      let errorMsg = '';
      try {
        if (file.name.endsWith('.csv')) {
          const text = await file.text();
          const rows = text.split(/\r?\n/).filter(Boolean);
          columns = rows[0]?.split(',').map(c => c.trim()) || [];
          previewRows = rows.slice(1, 11).map(row => {
            const values = row.split(',');
            const obj: Record<string, any> = {};
            columns.forEach((col, idx) => {
              obj[col] = values[idx] || '';
            });
            return obj;
          });
        } else if (
          file.name.endsWith('.xlsx') ||
          file.name.endsWith('.xls')
        ) {
          try {
            // @ts-ignore
            const XLSX = await import('xlsx');
            const data = new Uint8Array(await file.arrayBuffer());
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            columns = (json[0] as string[]) || [];
            previewRows = (json.slice(1, 11) as any[]).map(rowArr => {
              const obj: Record<string, any> = {};
              columns.forEach((col, idx) => {
                obj[col] = rowArr[idx] || '';
              });
              return obj;
            });
          } catch (e) {
            errorMsg = 'Excel preview requires SheetJS (xlsx) library.';
          }
        } else {
          errorMsg = 'Unsupported file type. Only CSV and Excel files are supported.';
        }
      } catch (e: any) {
        errorMsg = 'Failed to parse file.';
      }
      previews.push({
        file,
        name: file.name,
        type: file.type,
        size: file.size,
        columns,
        previewRows,
        error: errorMsg,
      });
    }
    setUploadedFiles(prev => [...prev, ...previews]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeFile = (idx: number) => {
    setUploadedFiles(files => files.filter((_, i) => i !== idx));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8 flex flex-col items-center">
      <div className="w-full max-w-3xl mx-auto p-8 bg-white rounded-3xl shadow-xl border border-slate-200">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-4 text-center">Table Uploader</h1>
        <p className="text-slate-600 text-lg mb-8 text-center">Upload CSV/Excel files or connect to a database and preview their contents.</p>
        {/* Mode Switch */}
        <div className="flex justify-center gap-6 mb-8">
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${mode === 'file' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}
            onClick={() => setMode('file')}
            type="button"
          >
            File Upload
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${mode === 'database' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}
            onClick={() => setMode('database')}
            type="button"
          >
            Database
          </button>
        </div>

        {/* File Upload Mode */}
        {mode === 'file' && (
          <>
            <div
              className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-slate-300 bg-slate-50'}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              style={{ minHeight: 180 }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileInput}
              />
              <button
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors mb-4"
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                Select Files
              </button>
              <p className="text-slate-500">or drag & drop files here</p>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-center">
                {error}
              </div>
            )}
            <div className="mt-8 space-y-8">
              {uploadedFiles.length === 0 && (
                <div className="text-center text-slate-400">No files uploaded yet.</div>
              )}
              {uploadedFiles.map((file, idx) => (
                <div key={idx} className="border rounded-xl shadow p-4 bg-slate-50">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-semibold text-slate-800">{file.name}</span>
                      <span className="ml-2 text-xs text-slate-500">({file.type || 'unknown'}, {(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button
                      className="text-red-500 hover:text-red-700 text-sm"
                      onClick={() => removeFile(idx)}
                      title="Remove file"
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                  {file.error ? (
                    <div className="text-red-600">{file.error}</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm border-collapse">
                        <thead>
                          <tr>
                            {file.columns.slice(0, 10).map((col, i) => (
                              <th key={i} className="px-3 py-2 border-b font-medium text-left bg-slate-100 text-slate-700">{col}</th>
                            ))}
                            {file.columns.length > 10 && (
                              <th className="px-3 py-2 border-b font-medium text-left bg-slate-100 text-slate-500">+{file.columns.length - 10} more</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {file.previewRows.slice(0, 10).map((row, rowIdx) => (
                            <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                              {file.columns.slice(0, 10).map((col, colIdx) => (
                                <td key={colIdx} className="px-3 py-2 border-b text-slate-800">
                                  {row[col]?.toString() || ''}
                                </td>
                              ))}
                              {file.columns.length > 10 && <td className="px-3 py-2 border-b text-slate-500">...</td>}
                            </tr>
                          ))}
                          {file.previewRows.length > 10 && (
                            <tr>
                              <td colSpan={Math.min(file.columns.length, 11)} className="px-3 py-2 text-slate-500 italic text-center">
                                + {file.previewRows.length - 10} more rows
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Database Mode */}
        {mode === 'database' && (
          <div className="mt-6">
            {/* Add Database Connection */}
            <button
              className="mb-4 px-4 py-2 bg-green-600 text-white rounded shadow"
              onClick={() => setAddingConnection(true)}
              type="button"
            >
              + Add Database Connection
            </button>
            {/* New connection form */}
            {addingConnection && (
              <div className="mb-6 border rounded-xl p-4 bg-slate-50">
                <DatabaseConnection
                  onTableSelect={() => {}}
                  onConnectionSuccess={(connected, tables, connectionString, dbType) => {
                    if (connected && tables && connectionString && dbType) {
                      setDbConnections(prev => [
                        ...prev,
                        {
                          id: Date.now().toString() + Math.random().toString(36).slice(2),
                          connected: true,
                          connectionString,
                          dbType,
                          tables,
                          selectedTables: [],
                          tableColumns: {},
                          tablePreviewRows: {},
                          loading: false,
                        }
                      ]);
                      setAddingConnection(false);
                    }
                  }}
                  onColumnSelect={() => {}}
                  onColumnDataFetched={undefined}
                />
              </div>
            )}
            {/* Render all connections */}
            {dbConnections.length === 0 && (
              <div className="text-center text-slate-400 mb-8">No database connections yet.</div>
            )}
            {dbConnections.map((conn, idx) => (
              <div key={conn.id} className="mb-8 border rounded-xl p-4 bg-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold text-slate-700">{conn.dbType.toUpperCase()} Connection</div>
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded shadow"
                    onClick={() => setDbConnections(dbConnections.filter((c) => c.id !== conn.id))}
                    type="button"
                  >
                    Remove Connection
                  </button>
                </div>
                {/* Multi-table select */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Select Tables</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2"
                    multiple
                    value={conn.selectedTables}
                    onChange={async (e) => {
                      const selected = Array.from(e.target.selectedOptions).map(o => o.value);
                      setDbConnections(prev => prev.map(c => c.id === conn.id ? { ...c, selectedTables: selected, loading: true } : c));
                      // Fetch columns and preview for each selected table
                      const newTableColumns: Record<string, string[]> = { ...conn.tableColumns };
                      const newTablePreviewRows: Record<string, any[]> = { ...conn.tablePreviewRows };
                      for (const table of selected) {
                        // Fetch columns
                        const resCols = await fetch(`http://localhost:5001/api/tables/${table}/columns`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ connectionString: conn.connectionString, dbType: conn.dbType })
                        });
                        const dataCols = await resCols.json();
                        newTableColumns[table] = dataCols.columns || [];
                        // Fetch preview rows
                        const resRows = await fetch(`http://localhost:5001/api/tables/${table}/data`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ connectionString: conn.connectionString, dbType: conn.dbType, limit: 10 })
                        });
                        const dataRows = await resRows.json();
                        newTablePreviewRows[table] = dataRows.rawData || [];
                      }
                      setDbConnections(prev => prev.map(c =>
                        c.id === conn.id
                          ? { ...c, tableColumns: newTableColumns, tablePreviewRows: newTablePreviewRows, loading: false }
                          : c
                      ));
                    }}
                  >
                    {conn.tables.map((tbl) => (
                      <option key={tbl} value={tbl}>{tbl}</option>
                    ))}
                  </select>
                </div>
                {/* Previews for all selected tables */}
                {conn.loading ? (
                  <div className="text-center text-blue-600">Loading table data…</div>
                ) : conn.selectedTables.length === 0 ? (
                  <div className="text-slate-400">No tables selected.</div>
                ) : (
                  conn.selectedTables.map(table => (
                    <div key={table} className="mb-4 border rounded-xl shadow p-4 bg-white">
                      <div className="mb-2 font-semibold text-slate-800">Preview: {table}</div>
                      <table className="min-w-full text-sm border-collapse">
                        <thead>
                          <tr>
                            {(conn.tableColumns[table] || []).slice(0, 10).map((col, i) => (
                              <th key={i} className="px-3 py-2 border-b font-medium text-left bg-slate-100 text-slate-700">{col}</th>
                            ))}
                            {(conn.tableColumns[table] || []).length > 10 && (
                              <th className="px-3 py-2 border-b font-medium text-left bg-slate-100 text-slate-500">+{(conn.tableColumns[table] || []).length - 10} more</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {(conn.tablePreviewRows[table] || []).slice(0, 10).map((row, rowIdx) => (
                            <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                              {(conn.tableColumns[table] || []).slice(0, 10).map((col, colIdx) => (
                                <td key={colIdx} className="px-3 py-2 border-b text-slate-800">
                                  {row[col]?.toString() || ''}
                                </td>
                              ))}
                              {(conn.tableColumns[table] || []).length > 10 && <td className="px-3 py-2 border-b text-slate-500">...</td>}
                            </tr>
                          ))}
                          {(conn.tablePreviewRows[table] || []).length > 10 && (
                            <tr>
                              <td colSpan={Math.min((conn.tableColumns[table] || []).length, 11)} className="px-3 py-2 text-slate-500 italic text-center">
                                + {(conn.tablePreviewRows[table] || []).length - 10} more rows
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        )}

        {/* Example Data to CSV (Table Editor) */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-4">Generate CSV from Example Data</h2>
          <div className="mb-4">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border-collapse border rounded-xl bg-white">
                <thead>
                  <tr>
                    {exampleTable.columns.map((col, colIdx) => (
                      <th key={colIdx} className="px-3 py-2 border-b font-medium text-left bg-slate-100 text-slate-700">
                        <input
                          className="border-b border-dashed border-slate-400 bg-slate-100 px-1 py-0.5 w-24 font-semibold"
                          value={col}
                          onChange={e => {
                            const newCols = [...exampleTable.columns];
                            newCols[colIdx] = e.target.value;
                            setExampleTable(et => ({
                              columns: newCols,
                              rows: et.rows.map(row => {
                                const newRow = [...row];
                                if (newRow.length < newCols.length) {
                                  // Add empty cells for new columns
                                  return [...newRow, ...Array(newCols.length - newRow.length).fill('')];
                                } else if (newRow.length > newCols.length) {
                                  // Remove extra cells
                                  return newRow.slice(0, newCols.length);
                                }
                                return newRow;
                              })
                            }));
                          }}
                        />
                        <button
                          className="ml-2 text-red-500 hover:text-red-700 text-xs"
                          title="Remove column"
                          onClick={() => {
                            if (exampleTable.columns.length === 1) return;
                            const newCols = exampleTable.columns.filter((_, i) => i !== colIdx);
                            setExampleTable(et => ({
                              columns: newCols,
                              rows: et.rows.map(row => row.filter((_, i) => i !== colIdx))
                            }));
                          }}
                          type="button"
                        >
                          ✕
                        </button>
                      </th>
                    ))}
                    <th>
                      <button
                        className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                        onClick={() => {
                          setExampleTable(et => ({
                            columns: [...et.columns, `col${et.columns.length + 1}`],
                            rows: et.rows.map(row => [...row, ''])
                          }));
                        }}
                        type="button"
                      >
                        + Add Column
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {exampleTable.rows.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {exampleTable.columns.map((_, colIdx) => (
                        <td key={colIdx} className="px-3 py-2 border-b">
                          <input
                            className="w-24 px-1 py-0.5 border rounded"
                            value={row[colIdx] || ''}
                            onChange={e => {
                              const newRows = exampleTable.rows.map((r, i) =>
                                i === rowIdx ? r.map((cell, j) => j === colIdx ? e.target.value : cell) : r
                              );
                              setExampleTable(et => ({ ...et, rows: newRows }));
                            }}
                          />
                        </td>
                      ))}
                      <td>
                        <button
                          className="ml-2 text-red-500 hover:text-red-700 text-xs"
                          title="Remove row"
                          onClick={() => {
                            if (exampleTable.rows.length === 1) return;
                            setExampleTable(et => ({ ...et, rows: et.rows.filter((_, i) => i !== rowIdx) }));
                          }}
                          type="button"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={exampleTable.columns.length + 1}>
                      <button
                        className="mt-2 px-2 py-1 bg-green-500 text-white rounded text-xs"
                        onClick={() => {
                          setExampleTable(et => ({
                            ...et,
                            rows: [...et.rows, Array(et.columns.length).fill('')]
                          }));
                        }}
                        type="button"
                      >
                        + Add Row
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded shadow"
              onClick={() => {
                const { columns, rows } = exampleTable;
                if (!columns.length || !rows.length) return;
                const data = rows.map(row => {
                  const obj: Record<string, any> = {};
                  columns.forEach((col, idx) => { obj[col] = row[idx] || ''; });
                  return obj;
                });
                const csv = arrayToCSV(data, columns);
                downloadCSV(csv, 'example.csv');
              }}
              type="button"
            >
              Download as CSV
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TableUploader;
