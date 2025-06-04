/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React, { useState, useRef } from "react";
import { ArrowPathIcon, CheckCircleIcon, ArrowDownTrayIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Transition } from "@headlessui/react";
import TableJoinComponent from "./TableJoinComponent";
import axios from "axios";

interface ConfirmApplyProps {
    column: string;
    code: string;
    transformationType: string;
    onTransformationComplete?: (data: any[]) => void;
    sourceValues?: string[];
    targetValues?: string[];
    tableData?: any[]; // Complete table data with all columns
    tableName?: string; // Name of the database table being transformed
    connectionString?: string; // Database connection string
}

interface Row {
    [key: string]: any;
}

const ConfirmApply: React.FC<ConfirmApplyProps> = ({
    column,
    code,
    transformationType,
    onTransformationComplete,
    sourceValues = [],
    targetValues = [],
    tableData = [],
    tableName = '',
    connectionString = '',
}) => {
    const [transformedData, setTransformedData] = useState<Row[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [showSuccess, setShowSuccess] = useState<boolean>(false);
    const [showJoinOption, setShowJoinOption] = useState<boolean>(false);
    const [joinMode, setJoinMode] = useState<boolean>(false);
    const [joinedTableName, setJoinedTableName] = useState<string>('');
    const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
    const [saveName, setSaveName] = useState<string>("");
    const [saveDescription, setSaveDescription] = useState<string>("");
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [saveError, setSaveError] = useState<string>("");
    const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
    const tableRef = useRef<HTMLDivElement>(null);

    const handleApplyTransformation = async (): Promise<void> => {
        setLoading(true);
        setError(null);
        setTransformedData(null);
        setShowSuccess(false);

        // Validate that we have the necessary data
        if (!column) {
            setError("Please select a column to transform");
            setLoading(false);
            return;
        }

        if (!code) {
            setError("No transformation code available");
            setLoading(false);
            return;
        }

        if (!sourceValues || sourceValues.length === 0 || !targetValues || targetValues.length === 0) {
            setError("Source and target values are required for transformation");
            setLoading(false);
            return;
        }

        console.log(`Applying transformation to column: ${column}`);
        console.log("Source values sample:", sourceValues.slice(0, 3));
        console.log("Target values sample:", targetValues.slice(0, 3));

        try {
            const response = await fetch("http://localhost:5000/apply_transformation", {
                method: "POST",
                body: JSON.stringify({
                    column_name: column,
                    code,
                    transformation_type: transformationType,
                    source_values: sourceValues,
                    target_values: targetValues
                }),
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                let errorMsg = `Server error: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorMsg;
                } catch {}
                throw new Error(errorMsg);
            }
            const data = await response.json();
            
            // Log what data we received from the server
            console.log("Transformation response data structure:", {
                hasUpdatedRows: !!data.updated_rows,
                updatedRowsCount: data.updated_rows?.length || 0,
                hasReplacedRows: !!data.replaced_rows,
                replacedRowsCount: data.replaced_rows?.length || 0,
                columnCount: data.replaced_rows?.[0] ? Object.keys(data.replaced_rows[0]).length : 0,
                sampleColumns: data.replaced_rows?.[0] ? Object.keys(data.replaced_rows[0]) : [],
                hasTableData: tableData.length > 0,
                tableDataRowCount: tableData.length,
                tableDataColumns: tableData[0] ? Object.keys(tableData[0]) : []
            });
            
            if (data.error) {
                setError(`Error: ${data.error}`);
                setLoading(false);
                return;
            }
            if (!data.updated_rows || !Array.isArray(data.updated_rows) || data.updated_rows.length === 0) {
                setError("No data was returned from the transformation");
                setLoading(false);
                return;
            }
            
            // Determine which data to use for display
            let transformedTableData: any[] = [];
            let transformedValues: any[] = [];
            // First choice: Use replaced_rows if available (entire table with transformed column)
            if (data.replaced_rows && Array.isArray(data.replaced_rows) && data.replaced_rows.length > 0) {
                console.log("Using replaced_rows data - full table with transformed values");
                console.log("Columns in replaced data:", Object.keys(data.replaced_rows[0]));
                transformedTableData = data.replaced_rows;
                transformedValues = data.replaced_rows.map((row: any) => row[column]);
            } 
            // Second choice: Create replaced data from updated_rows if needed
            else {
                console.log("Creating full table with transformed values from updated_rows");
                const firstRow = data.updated_rows[0];
                const transformedColumnName = `${column}_transformed`;
                // Defensive: check if transformed column exists
                if (!firstRow || typeof firstRow !== 'object' || !(transformedColumnName in firstRow)) {
                    console.warn(`Transformed column '${transformedColumnName}' not found in result`, firstRow);
                }
                // Extract the transformed values
                transformedValues = data.updated_rows.map((row: any) =>
                    row && (transformedColumnName in row) && row[transformedColumnName] !== undefined
                        ? row[transformedColumnName]
                        : row[column]
                );
                // If we have complete table data from props, use it to create the full transformed table
                if (Array.isArray(tableData) && tableData.length > 0) {
                    console.log("Using provided complete table data with transformed values");
                    transformedTableData = tableData.map((row, index) => {
                        const newRow = { ...row };
                        if (index < transformedValues.length) {
                            newRow[column] = transformedValues[index];
                        }
                        return newRow;
                    });
                } else {
                    transformedTableData = data.updated_rows.map((row: any) => {
                        const newRow = { ...row };
                        if (row && (transformedColumnName in row)) {
                            newRow[column] = row[transformedColumnName];
                            delete newRow[transformedColumnName];
                        }
                        return newRow;
                    });
                }
                console.log("Created full table with transformed values");
                if (transformedTableData.length > 0) {
                    console.log("Columns in created data:", Object.keys(transformedTableData[0]));
                }
            }
            
            // Set the transformed data for display
            setTransformedData(transformedTableData);
            setShowSuccess(true);
            
            // Notify parent component if callback provided
            if (onTransformationComplete) {
                onTransformationComplete(transformedTableData);
            }
            
            // If we have a table name and connection string, show the join option
            if (tableName && connectionString) {
                setShowJoinOption(true);
            }
            
            // Log a sample of the final data that will be displayed
            if (transformedTableData && transformedTableData.length > 0) {
                console.log("Sample of final transformed table data:", {
                    rowCount: transformedTableData.length,
                    columnCount: Object.keys(transformedTableData[0]).length,
                    columns: Object.keys(transformedTableData[0]),
                    transformedColumnValue: transformedTableData[0][column]
                });
            }
        } catch (err: any) {
            setError(`❌ Failed to apply transformation. ${err?.message || ''}`);
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Function to download transformed data as CSV
    const downloadCSV = (): void => {
        if (!transformedData || transformedData.length === 0) return;
        const headers = Object.keys(transformedData[0]);
        const csvContent = [
            headers.join(','),
            ...transformedData.map(row => headers.map(header => {
                const value = row[header];
                // Handle values with commas or quotes by wrapping in quotes and escaping quotes
                if (typeof value === 'string') {
                    let v = value.replace(/"/g, '""');
                    if (v.includes(',') || v.includes('"') || v.includes('\n')) {
                        v = `"${v}"`;
                    }
                    return v;
                }
                return value;
            }).join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `transformed_data_${column}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSaveToDatabase = async (): Promise<void> => {
        if (!saveName.trim()) {
            setSaveError("Please provide a name for this transformed dataset");
            return;
        }
        if (!transformedData || transformedData.length === 0) {
            setSaveError("No transformed data to save.");
            return;
        }
        setIsSaving(true);
        setSaveError("");
        setSaveSuccess(false);
        try {
            const dataToSave = {
                name: saveName,
                description: saveDescription,
                originalFileName: "",
                columns: Object.keys(transformedData[0]),
                transformedColumn: column,
                transformationCode: code,
                transformationType: transformationType,
                data: transformedData,
            };
            const response = await axios.post("/save-transformed-data", dataToSave);
            if (response.data && response.data.success) {
                setSaveSuccess(true);
                setTimeout(() => {
                    setIsSaveModalOpen(false);
                    setSaveSuccess(false);
                }, 2000);
            } else {
                setSaveError(response.data?.error || "Failed to save data to database");
            }
        } catch (error: any) {
            console.error("Error saving to database:", error);
            setSaveError(error?.response?.data?.error || error?.message || "Failed to save data to database");
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <div className="p-6 space-y-6 font-sans bg-white rounded-2xl shadow-xl border border-gray-200">
            {/* Preview of original data */}
            {tableData && tableData.length > 0 && !transformedData && (
                <div className="mb-4 border rounded p-4 bg-gray-50">
                    <h3 className="text-md font-semibold text-gray-800 mb-2">Original Data Preview</h3>
                    <p className="text-sm text-gray-600 mb-2">
                        Showing first 5 rows of column <span className="font-medium text-blue-700">{column}</span>
                    </p>
                    <div className="overflow-x-auto max-h-[150px] border rounded shadow-sm bg-white">
                        <table className="min-w-full text-sm border-collapse">
                            <thead className="bg-gray-100 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-2 border-b font-medium text-left">#</th>
                                    <th className="px-4 py-2 border-b font-medium text-left">{column}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.slice(0, 5).map((row, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 border-b text-gray-500">{index + 1}</td>
                                        <td className="px-4 py-2 border-b">
                                            {row[column] !== undefined && row[column] !== null 
                                                ? String(row[column]) 
                                                : "(empty)"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <button
                    onClick={handleApplyTransformation}
                    disabled={loading}
                    className={`px-6 py-2 rounded transition duration-200 text-white flex items-center gap-2 ${
                        loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                    {loading ? (
                        <>
                            <ArrowPathIcon className="w-5 h-5 animate-spin" />
                            Applying...
                        </>
                    ) : (
                        <>
                            <CheckCircleIcon className="w-5 h-5" />
                            Apply Transformation
                        </>
                    )}
                </button>
            </div>
            
            {showSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-green-700">Transformation successfully applied to <strong>{column}</strong>!</p>
                </div>
            )}

            {error && <p className="text-red-600 font-medium">{error}</p>}

            <Transition
                show={!!transformedData}
                enter="transition-opacity duration-500"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                as="div"
            >
                {/* We need to wrap the content in a single element for the Transition to work properly */}
                {transformedData && <div>
                    <div className="space-y-4" ref={tableRef}>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Transformed Data Table</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Showing table with transformed values for column <span className="font-medium text-blue-700">{column}</span>
                                </p>
                            </div>
                            {transformedData && (
                                <div className="d-flex justify-content-between mb-3">
                                    <button
                                        onClick={downloadCSV}
                                        className="px-4 py-2 rounded transition duration-200 text-white bg-green-600 hover:bg-green-700 flex items-center gap-2 text-sm"
                                    >
                                        <ArrowDownTrayIcon className="w-4 h-4" />
                                        Download CSV
                                    </button>
                                    {/* <button
                                        onClick={() => setIsSaveModalOpen(true)}
                                        className="px-4 py-2 rounded transition duration-200 text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-2 text-sm"
                                    >
                                        Save to Database
                                    </button> */}
                                </div>
                            )}
                        </div>
                        <div className="overflow-x-auto max-h-[400px] border rounded shadow-sm">
                            {transformedData && transformedData.length > 0 ? (
                                <table className="min-w-full text-sm border-collapse">
                                    <thead className="bg-gray-100 sticky top-0 z-10">
                                        <tr>
                                            {Object.keys(transformedData[0]).map((columnName) => {
                                                const isTransformedColumn = columnName === column;
                                                return (
                                                    <th
                                                        key={columnName}
                                                        className={`px-4 py-3 border-b font-medium text-left ${isTransformedColumn 
                                                            ? 'bg-blue-100 text-blue-800' 
                                                            : 'text-gray-700'}`}
                                                    >
                                                        {columnName}
                                                        {isTransformedColumn && (
                                                            <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded">
                                                                Transformed
                                                            </span>
                                                        )}
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transformedData.map((row, rowIndex) => (
                                            <tr
                                                key={rowIndex}
                                                className={rowIndex % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-50 hover:bg-gray-100"}
                                                style={{ transition: 'background-color 0.2s ease' }}
                                            >
                                                {Object.entries(row).map(([columnName, value], cellIndex) => {
                                                    const isTransformedColumn = columnName === column;
                                                    
                                                    return (
                                                        <td 
                                                            key={cellIndex} 
                                                            className={`px-4 py-2 border-b ${isTransformedColumn 
                                                                ? 'bg-blue-50 text-blue-800 font-medium' 
                                                                : 'text-gray-800'}`}
                                                        >
                                                            {String(value)}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    No transformed data available
                                </div>
                            )}
                        </div>
                        {transformedData && transformedData.length > 20 && (
                            <p className="text-sm text-gray-500 italic">
                                Showing 20 of {transformedData.length} rows. 
                                Download the CSV for complete data.
                            </p>
                        )}
                    </div>
                    
                    {/* Join Option Button */}
                    {showJoinOption && !joinMode && (
                        <div className="mt-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
                            <h3 className="text-lg font-semibold text-blue-800 mb-2">Data Integration</h3>
                            <p className="text-sm text-blue-700 mb-4">
                                Would you like to join this transformed table with another table in the database?
                            </p>
                            <button
                                onClick={() => setJoinMode(true)}
                                className="px-4 py-2 rounded transition duration-200 text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-2 text-sm"
                            >
                                <PlusIcon className="w-4 h-4" />
                                Join with Another Table
                            </button>
                        </div>
                    )}
                    
                    {/* Table Join Component */}
                    {joinMode && (
                        <div className="mt-6">
                            <TableJoinComponent
                                connectionString={connectionString}
                                sourceTable={tableName}
                                transformedColumn={column}
                                onJoinComplete={(joinedTable) => {
                                    setJoinedTableName(joinedTable);
                                    // Show success message when join is complete
                                    if (joinedTable) {
                                        setShowSuccess(true);
                                        setTimeout(() => setShowSuccess(false), 3000);
                                    }
                                }}
                            />
                        </div>
                    )}
                    
                    {/* Joined Table Information */}
                    {joinedTableName && (
                        <div className="mt-6 p-4 border border-green-200 rounded-lg bg-green-50">
                            <h3 className="text-lg font-semibold text-green-800 mb-2">
                                <CheckCircleIcon className="w-5 h-5 inline mr-2" />
                                Table Join Complete
                            </h3>
                            <p className="text-green-700">
                                Successfully created joined table: <span className="font-bold">{joinedTableName}</span>
                            </p>
                            <p className="text-sm text-green-600 mt-2">
                                The joined table is now saved in your database and can be used for further analysis or transformations.
                            </p>
                        </div>
                    )}
                </div>}
            </Transition>
            
            {/* Save to Database Modal */}
            {isSaveModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Save Transformed Data</h3>
                            <button 
                                onClick={() => setIsSaveModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        {saveSuccess ? (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                                Data saved successfully!
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter a name for this dataset"
                                        value={saveName}
                                        onChange={(e) => setSaveName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Enter a description (optional)"
                                        value={saveDescription}
                                        onChange={(e) => setSaveDescription(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                {saveError && (
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                        {saveError}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <div className="flex justify-end space-x-2 mt-4">
                            <button 
                                onClick={() => setIsSaveModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition duration-200"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveToDatabase} 
                                disabled={isSaving || saveSuccess}
                                className={`px-4 py-2 rounded text-white transition duration-200 flex items-center ${isSaving || saveSuccess ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {isSaving ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    "Save"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConfirmApply;