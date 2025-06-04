require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("./config/passport");
const session = require("express-session");

// NEWLY IMPORTED DEPENDENCIES
const fs = require("fs");
const path = require("path");
const Papa = require("papaparse");
const multer = require("multer");
const xlsx = require("xlsx");
const axios = require("axios");
const { spawn } = require("child_process");

// Helper function to extract the function name from Python code
const extractFunctionName = (code) => {
    try {
        // Match 'def function_name(' pattern in Python code
        const match = code.match(/def\s+([a-zA-Z0-9_]+)\s*\(/i);
        if (match && match[1]) {
            console.log(`Extracted function name: ${match[1]}`);
            return match[1];
        }
        console.error("Could not extract function name from code:", code.substring(0, 100) + "...");
        return null;
    } catch (err) {
        console.error("Error extracting function name:", err);
        return null;
    }
};

const app = express();

// Global variable to store transformation data
global.transformationData = {
  source_values: [],
  target_values: []
};

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(session({ secret: process.env.JWT_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", require("./routes/auth"));

// Import TransformedData model
const TransformedData = require('./models/TransformedData');

// DB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Root route
app.get("/", (req, res) => res.send("TabulaX Auth API running"));

// Save transformed data to MongoDB
app.post("/save-transformed-data", async (req, res) => {
  try {
    const { name, description, originalFileName, columns, transformedColumn, transformationCode, transformationType, data } = req.body;
    
    // Validate required fields
    if (!name || !columns || !transformedColumn || !data) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    
    // Create new transformed data document
    const transformedData = new TransformedData({
      name,
      description,
      originalFileName,
      columns,
      transformedColumn,
      transformationCode,
      transformationType,
      data,
      userId: req.user ? req.user._id : null // Associate with user if authenticated
    });
    
    // Save to database
    await transformedData.save();
    
    return res.status(201).json({
      success: true,
      message: "Transformed data saved successfully",
      id: transformedData._id
    });
  } catch (error) {
    console.error("Error saving transformed data:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to save transformed data: " + error.message
    });
  }
});

// Handle SQL table join
app.post("/join-tables", async (req, res) => {
  try {
    const { connectionString, sourceTable, targetTable, joinColumn, newTableName } = req.body;
    if (!connectionString || !sourceTable || !targetTable || !joinColumn) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    // Fetch all data from both tables
    const fetchTableData = async (tableName) => {
      const response = await axios.post(`http://localhost:5001/api/tables/${tableName}/data`, {
        connectionString
      });
      if (!response.data.success) throw new Error(`Failed to fetch data for table ${tableName}: ${response.data.error}`);
      return response.data;
    };
    const [source, target] = await Promise.all([
      fetchTableData(sourceTable),
      fetchTableData(targetTable)
    ]);
    const sourceRows = source.rawData;
    const targetRows = target.rawData;
    // Perform in-memory equi-join
    const joinedRows = [];
    const targetIndex = {};
    for (const row of targetRows) {
      const key = row[joinColumn];
      if (!targetIndex[key]) targetIndex[key] = [];
      targetIndex[key].push(row);
    }
    for (const sRow of sourceRows) {
      const key = sRow[joinColumn];
      if (targetIndex[key]) {
        for (const tRow of targetIndex[key]) {
          // Merge rows, prefix target columns to avoid collision
          const merged = { ...sRow };
          for (const [col, val] of Object.entries(tRow)) {
            if (col !== joinColumn) merged[`${targetTable}_${col}`] = val;
          }
          joinedRows.push(merged);
        }
      }
    }
    // Compose columns for preview
    const preview = joinedRows.slice(0, 20);
    return res.json({
      success: true,
      message: "Tables joined successfully (in-memory)",
      joinedTableName: newTableName || `joined_${sourceTable}_${targetTable}`,
      preview,
      rowCounts: {
        sourceTable: sourceRows.length,
        targetTable: targetRows.length,
        joinedTable: joinedRows.length
      }
    });
  } catch (error) {
    console.error("Error joining tables (in-memory):", error);
    return res.status(500).json({
      error: "Failed to join tables (in-memory)",
      details: error.message,
      response: error.response?.data
    });
  }
});

// Export joined table as CSV
app.post("/export-joined-table", async (req, res) => {

// Save joined table to MongoDB
app.post('/save-joined-table', async (req, res) => {
  try {
    const { tableName, collectionName, data } = req.body;
    if (!collectionName || !Array.isArray(data) || !data.length) {
      return res.status(400).json({ success: false, error: 'Missing collection name or data' });
    }
    // Create a dynamic schema based on the keys of the first row
    const keys = Object.keys(data[0]);
    const schemaDef = {};
    keys.forEach(key => { schemaDef[key] = { type: mongoose.Schema.Types.Mixed }; });
    const DynamicSchema = new mongoose.Schema(schemaDef, { strict: false });
    let DynamicModel;
    try {
      DynamicModel = mongoose.model(collectionName);
    } catch (e) {
      DynamicModel = mongoose.model(collectionName, DynamicSchema, collectionName);
    }
    await DynamicModel.insertMany(data);
    return res.json({ success: true });
  } catch (err) {
    console.error('Error saving joined table to MongoDB:', err);
    return res.status(500).json({ success: false, error: 'Failed to save joined table', details: err.message });
  }
});
  try {
    const { connectionString, tableName } = req.body;
    
    if (!connectionString || !tableName) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    
    // Fetch all data from the joined table
    const query = `SELECT * FROM ${tableName}`;
    const response = await axios.post("http://localhost:5001/api/execute-sql", {
      connectionString,
      query
    });
    
    const data = response.data.results;
    
    if (!data || !data.length) {
      return res.status(404).json({ error: "No data found in the joined table" });
    }
    
    // Convert data to CSV format
    const columns = Object.keys(data[0]);
    const csvContent = [
      columns.join(','),
      ...data.map(row => columns.map(col => {
        const value = row[col];
        // Handle null values and escape commas
        return value === null ? '' : String(value).includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');
    
    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${tableName}.csv`);
    
    return res.send(csvContent);
  } catch (error) {
    console.error("Error exporting joined table:", error);
    return res.status(500).json({ error: "Failed to export joined table", details: error.message });
  }
});

// Handle SQL data from database API
app.post("/set-sql-data", (req, res) => {
  try {
    const { columns, rawData } = req.body;
    
    if (!columns || !rawData) {
      return res.status(400).json({ error: "Columns and rawData are required" });
    }
    
    // Store SQL data in the same format as uploaded data
    InputData = standardizeDataFormat({ columns, rawData });
    
    const samples = convertToColumnFormat(InputData.rawData.slice(0, 5), InputData.columns);
    
    return res.json({ 
      success: true, 
      message: "SQL data loaded successfully",
      columns: InputData.columns,
      samples
    });
  } catch (error) {
    console.error("Error setting SQL data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Configure file upload
const upload = multer({ dest: "uploads/" });

// Helper: Convert row data to column format
function convertToColumnFormat(dataArray, columns) {
    let formattedData = {};
    columns.forEach((col) => (formattedData[col] = []));
    dataArray.forEach((row) => {
        columns.forEach((col) => {
            formattedData[col].push(row[col] || null);
        });
    });
    return formattedData;
}

// Helper: Extract function name from code is now defined at the top of the file

// In-memory storage for uploaded data (temporary, session-based)
let uploadedSourceData = null;
let uploadedTargetData = null;
let InputData = null;

// Standardize data format between SQL and file uploads
function standardizeDataFormat(data) {
  if (!data || !data.rawData || !data.columns) return data;
  
  // Ensure rawData is an array of objects with column keys
  if (Array.isArray(data.rawData) && data.rawData.length > 0) {
    // Check if data is already in the correct format
    const firstRow = data.rawData[0];
    const hasCorrectFormat = data.columns.every(col => typeof firstRow === 'object' && col in firstRow);
    
    if (hasCorrectFormat) {
      return data; // Already in correct format
    }
    
    // Convert array of arrays to array of objects
    if (Array.isArray(firstRow)) {
      const formattedData = data.rawData.map(row => {
        const obj = {};
        data.columns.forEach((col, idx) => {
          obj[col] = row[idx];
        });
        return obj;
      });
      
      return { columns: data.columns, rawData: formattedData };
    }
  }
  
  return data;
}

// Handle source file upload
app.post("/upload-source", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const { fileType } = req.body;
    const filePath = req.file.path;
    const fileExt = req.file.originalname.split(".").pop().toLowerCase();

    try {
        let columns = [];
        let rawData = [];

        if (fileExt === "csv") {
            const fileContent = fs.readFileSync(filePath, "utf8");
            const parsed = Papa.parse(fileContent, { header: true });
            columns = parsed.meta.fields;
            rawData = parsed.data;
        } else if (fileExt === "xlsx") {
            const workbook = xlsx.readFile(filePath);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

            columns = jsonData[0];
            rawData = jsonData.slice(1).map((row) => {
                let obj = {};
                columns.forEach((col, idx) => (obj[col] = row[idx]));
                return obj;
            });
        } else {
            return res.status(400).json({ error: "Unsupported file format" });
        }

        // Store uploaded data in memory
        uploadedSourceData = { columns, rawData };
        const samples = convertToColumnFormat(rawData.slice(0, 5), columns);
        fs.unlinkSync(filePath); // Clean up uploaded file
        res.json({ columns, samples });
    } catch (error) {
        console.error("Error processing file:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Handle target file upload
app.post("/upload-target", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const { fileType } = req.body;
    const filePath = req.file.path;
    const fileExt = req.file.originalname.split(".").pop().toLowerCase();

    try {
        let columns = [];
        let rawData = [];

        if (fileExt === "csv") {
            const fileContent = fs.readFileSync(filePath, "utf8");
            const parsed = Papa.parse(fileContent, { header: true });
            columns = parsed.meta.fields;
            rawData = parsed.data;
        } else if (fileExt === "xlsx") {
            const workbook = xlsx.readFile(filePath);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

            columns = jsonData[0];
            rawData = jsonData.slice(1).map((row) => {
                let obj = {};
                columns.forEach((col, idx) => (obj[col] = row[idx]));
                return obj;
            });
        } else {
            return res.status(400).json({ error: "Unsupported file format" });
        }

        // Store uploaded data in memory
        uploadedTargetData = { columns, rawData };
        const samples = convertToColumnFormat(rawData.slice(0, 5), columns);
        fs.unlinkSync(filePath); // Clean up uploaded file
        res.json({ columns, samples });
    } catch (error) {
        console.error("Error processing file:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Handle input file upload
app.post("/upload-input", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const { fileType } = req.body;
    const filePath = req.file.path;
    const fileExt = req.file.originalname.split(".").pop().toLowerCase();

    try {
        let columns = [];
        let rawData = [];

        if (fileExt === "csv") {
            const fileContent = fs.readFileSync(filePath, "utf8");
            const parsed = Papa.parse(fileContent, { header: true });
            columns = parsed.meta.fields;
            rawData = parsed.data;
        } else if (fileExt === "xlsx") {
            const workbook = xlsx.readFile(filePath);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

            columns = jsonData[0];
            rawData = jsonData.slice(1).map((row) => {
                let obj = {};
                columns.forEach((col, idx) => (obj[col] = row[idx]));
                return obj;
            });
        } else {
            return res.status(400).json({ error: "Unsupported file format" });
        }

        // Store uploaded data in memory
        InputData = { columns, rawData };
        const samples = convertToColumnFormat(rawData.slice(0, 5), columns);
        fs.unlinkSync(filePath); // Clean up uploaded file
        res.json({ columns, samples });
    } catch (error) {
        console.error("Error processing file:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Handle function generation based on source and target values
app.post("/generate-function", async (req, res) => {
    try {
        const { source_values, target_values } = req.body;

        // Ensure source_values and target_values are available
        if (!source_values || !target_values) {
            return res.status(400).json({ error: "Source values and target values are required" });
        }

        // Store the source and target values for later use
        // This is important for General transformations
        global.transformationData.source_values = source_values;
        global.transformationData.target_values = target_values;

        console.log("Stored transformation data:", {
            sourceCount: source_values.length,
            targetCount: target_values.length
        });

        // Prepare request data for the classify API
        const requestData = {
            source_list: source_values,
            target_list: target_values,
        };

        // Call the classify API to get the transformation type and generated function code
        const response = await axios.post("https://524b-34-16-194-39.ngrok-free.app/classify", requestData);

        // Extract the transformation type and function code from the response
        const { transformation_type, function_code } = response.data;

        // Log the response for debugging
        console.log(`Transformation Type: ${transformation_type}`);
        console.log(`Generated Function Code: \n${function_code}`);

        res.json({
            pythonFunction: function_code,
            type: transformation_type,
            isGeneral: transformation_type === "General"
        });

    } catch (error) {
        console.error("Error generating function:", error.response?.data || error.message);
        res.status(500).json({ error: "Error generating function" });
    }
});


app.post("/apply_transformation", async (req, res) => {
  try {
    const { column_name, code, transformation_type, source_values, target_values, updateOriginalTable, performJoin, joinTable, joinColumn } = req.body;

    if (!column_name || !code) {
      return res.status(400).json({ error: "Column name and transformation code are required" });
    }
    
    // If no InputData is available but we have source values, create a test dataset
    if (!InputData || !InputData.rawData) {
      if (source_values && source_values.length > 0) {
        console.log("Creating test data from source values");
        // Create a simple test dataset using the source values
        InputData = {
          columns: [column_name],
          rawData: source_values.map(value => ({ [column_name]: value }))
        };
      } else {
        return res.status(400).json({ error: "No data available. Please upload a file or provide source values." });
      }
    }
    
    // Check if the requested column exists in the data
    const hasRequestedColumn = InputData.columns.includes(column_name);
    if (!hasRequestedColumn) {
      console.log(`Column '${column_name}' not found in data. Available columns: ${InputData.columns.join(', ')}`);
      
      // If the column doesn't exist but we have source values, recreate the input data with the correct column name
      if (source_values && source_values.length > 0) {
        console.log(`Recreating input data with column '${column_name}'`);
        InputData = {
          columns: [column_name],
          rawData: source_values.map(value => ({ [column_name]: value }))
        };
      }
    }
    
    // Standardize input data format to ensure consistency between SQL and file uploads
    InputData = standardizeDataFormat(InputData);
    
    console.log("Input data format:", {
      columns: InputData.columns,
      sampleRow: InputData.rawData[0],
      dataType: typeof InputData.rawData[0],
      hasColumn: InputData.rawData[0] && column_name in InputData.rawData[0]
    });

    // Handle GENERAL TRANSFORMATION
    const isGeneralTransformation =
      transformation_type === "General" ||
      (code && code.includes("General Knowledge Transformation"));

    if (isGeneralTransformation) {
      let relationship = "Unknown";
      if (code) {
        const match = code.match(/Relationship:\s*(.*)/);
        if (match && match[1]) {
          relationship = match[1].trim();
        }
      }

      let source_values_arr = source_values;
      let target_values_arr = target_values;

      if (!source_values_arr || !target_values_arr) {
        if (
          uploadedSourceData?.rawData &&
          uploadedTargetData?.rawData
        ) {
          const sourceCol = Object.keys(uploadedSourceData.rawData[0])[0];
          const targetCol = Object.keys(uploadedTargetData.rawData[0])[0];

          source_values_arr = uploadedSourceData.rawData.map(r => r[sourceCol]);
          target_values_arr = uploadedTargetData.rawData.map(r => r[targetCol]);

          console.log("Using fallback source/target from uploaded data.");
        } else {
          return res.status(400).json({
            error: "Source and target values are required for General transformations",
          });
        }
      }

      const inputColumnValues = InputData.rawData.map(row => row[column_name]);

      try {
        const response = await axios.post("https://524b-34-16-194-39.ngrok-free.app/apply_general", {
          source_list: source_values_arr,
          target_list: target_values_arr,
          test_sources: inputColumnValues,
        });

        const { transformed_values, relationship: detectedRelationship } = response.data;

        // Ensure we have the complete table data
        if (!InputData || !InputData.rawData || InputData.rawData.length === 0) {
          return res.status(400).json({
            error: "No input data available for transformation"
          });
        }

        // Log the structure of the input data to verify we have the complete table
        console.log("Input data structure:", {
          rowCount: InputData.rawData.length,
          columnCount: Object.keys(InputData.rawData[0] || {}).length,
          sampleColumns: Object.keys(InputData.rawData[0] || {})
        });

        // Create two versions of the updated rows:
        // 1. With transformed values in a new column (for comparison view)
        const updatedRowsWithBoth = InputData.rawData.map((row, index) => ({
          ...row,
          [`${column_name}_transformed`]: transformed_values[index] || "N/A",
        }));
        
        // 2. With transformed values replacing the original column (for replacement view)
        // Make sure we're preserving the entire table structure
        const updatedRowsReplaced = InputData.rawData.map((row, index) => {
          // Create a deep copy of the original row to preserve all columns
          const newRow = { ...row };
          // Only replace the value for the selected column
          newRow[column_name] = transformed_values[index] || row[column_name];
          return newRow;
        });
        
        // Log samples to verify the transformation
        console.log("Original table data sample:", {
          sampleRow: InputData.rawData[0],
          originalColumnValue: InputData.rawData[0]?.[column_name]
        });
        console.log("Transformed table data sample:", {
          sampleRow: updatedRowsReplaced[0],
          transformedColumnValue: updatedRowsReplaced[0]?.[column_name]
        });

        // If updateOriginalTable flag is true, update the original table in the database
        if (updateOriginalTable && global.transformationData.connectionString && global.transformationData.currentTable) {
          try {
            const tableName = global.transformationData.currentTable;
            const connectionString = global.transformationData.connectionString;
            
            // Get primary key column for the table
            const getPrimaryKeyQuery = `
              SELECT column_name 
              FROM information_schema.key_column_usage 
              WHERE table_name = '${tableName}' 
              AND constraint_name = 'PRIMARY'
            `;
            
            const pkResponse = await axios.post("http://localhost:5001/api/execute-sql", {
              connectionString,
              query: getPrimaryKeyQuery
            });
            
            if (!pkResponse.data.success || !pkResponse.data.results || pkResponse.data.results.length === 0) {
              console.error("Could not determine primary key for table:", tableName);
              throw new Error("Could not determine primary key for table");
            }
            
            const primaryKeyColumn = pkResponse.data.results[0].column_name;
            console.log(`Using primary key column '${primaryKeyColumn}' for updates`);
            
            // Create batch update statements
            const batchSize = 50; // Update in batches to avoid too large queries
            const totalBatches = Math.ceil(updatedRowsReplaced.length / batchSize);
            
            let updatedRowCount = 0;
            
            for (let batch = 0; batch < totalBatches; batch++) {
              const startIdx = batch * batchSize;
              const endIdx = Math.min((batch + 1) * batchSize, updatedRowsReplaced.length);
              const batchRows = updatedRowsReplaced.slice(startIdx, endIdx);
              
              // Create CASE statement for this batch
              const caseStatements = batchRows.map(row => {
                // Handle different data types appropriately
                const pkValue = typeof row[primaryKeyColumn] === 'string' 
                  ? `'${row[primaryKeyColumn].replace(/'/g, "''")}'` 
                  : row[primaryKeyColumn];
                  
                const colValue = typeof row[column_name] === 'string'
                  ? `'${row[column_name].replace(/'/g, "''")}'`
                  : row[column_name];
                  
                return `WHEN ${primaryKeyColumn} = ${pkValue} THEN ${colValue}`;
              }).join('\n              ');
              
              // Create the update query with CASE statement
              const updateQuery = `
                UPDATE ${tableName} 
                SET ${column_name} = CASE
              ${caseStatements}
                ELSE ${column_name}
                END
                WHERE ${primaryKeyColumn} IN (${batchRows.map(row => {
                  return typeof row[primaryKeyColumn] === 'string' 
                    ? `'${row[primaryKeyColumn].replace(/'/g, "''")}'` 
                    : row[primaryKeyColumn];
                }).join(', ')})
              `;
              
              // Execute the update query
              const updateResponse = await axios.post("http://localhost:5001/api/execute-sql", {
                connectionString,
                query: updateQuery
              });
              
              if (updateResponse.data.success) {
                updatedRowCount += batchRows.length;
                console.log(`Updated batch ${batch + 1}/${totalBatches} (${batchRows.length} rows)`);
              } else {
                console.error(`Failed to update batch ${batch + 1}:`, updateResponse.data.error);
                throw new Error(`Database update failed: ${updateResponse.data.error}`);
              }
            }
            
            console.log(`Successfully updated ${updatedRowCount} rows in the original table`);
            
            // If performJoin is true, perform a join operation with another table
            if (performJoin && joinTable && joinColumn) {
              try {
                const tableName = global.transformationData.currentTable;
                const connectionString = global.transformationData.connectionString;
                const joinedTableName = `${tableName}_joined_${joinTable}`;
                
                // Get columns for both tables
                const getColumnsQuery = async (table) => {
                  const query = `
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = '${table}'
                  `;
                  
                  const response = await axios.post("http://localhost:5001/api/execute-sql", {
                    connectionString,
                    query
                  });
                  
                  if (!response.data.success) {
                    throw new Error(`Failed to get columns for table ${table}`);
                  }
                  
                  return response.data.results.map(row => row.column_name);
                };
                
                const sourceColumns = await getColumnsQuery(tableName);
                const targetColumns = await getColumnsQuery(joinTable);
                
                // Create column lists with proper aliases to avoid duplicates
                const sourceColumnsList = sourceColumns.map(col => `${tableName}.${col} AS ${tableName}_${col}`).join(', ');
                const targetColumnsList = targetColumns
                  .filter(col => col !== joinColumn) // Exclude the join column from target to avoid duplicates
                  .map(col => `${joinTable}.${col} AS ${joinTable}_${col}`)
                  .join(', ');
                
                // Create SQL query for inner join with explicit column selection to avoid duplicates
                const joinQuery = `
                  CREATE TABLE ${joinedTableName} AS
                  SELECT ${sourceColumnsList}, ${targetColumnsList}
                  FROM ${tableName}
                  INNER JOIN ${joinTable}
                  ON ${tableName}.${joinColumn} = ${joinTable}.${joinColumn}
                `;
                
                // Execute the join query
                const joinResponse = await axios.post("http://localhost:5001/api/execute-sql", {
                  connectionString,
                  query: joinQuery
                });
                
                if (!joinResponse.data.success) {
                  throw new Error(`Failed to create joined table: ${joinResponse.data.error}`);
                }
                
                // Fetch preview of the joined table (first 20 rows)
                const previewQuery = `SELECT * FROM ${joinedTableName} LIMIT 20`;
                const previewResponse = await axios.post("http://localhost:5001/api/execute-sql", {
                  connectionString,
                  query: previewQuery
                });
                
                // Get row counts for source, target, and joined tables
                const sourceCountQuery = `SELECT COUNT(*) as count FROM ${tableName}`;
                const targetCountQuery = `SELECT COUNT(*) as count FROM ${joinTable}`;
                const joinedCountQuery = `SELECT COUNT(*) as count FROM ${joinedTableName}`;
                
                const [sourceCountRes, targetCountRes, joinedCountRes] = await Promise.all([
                  axios.post("http://localhost:5001/api/execute-sql", { connectionString, query: sourceCountQuery }),
                  axios.post("http://localhost:5001/api/execute-sql", { connectionString, query: targetCountQuery }),
                  axios.post("http://localhost:5001/api/execute-sql", { connectionString, query: joinedCountQuery })
                ]);
                
                const sourceCount = sourceCountRes.data.results[0].count;
                const targetCount = targetCountRes.data.results[0].count;
                const joinedCount = joinedCountRes.data.results[0].count;
                
                console.log(`Join operation completed: ${joinedTableName} created with ${joinedCount} rows`);
                
                return res.json({
                  updated_rows: updatedRowsWithBoth,
                  replaced_rows: updatedRowsReplaced,
                  relationship: detectedRelationship || relationship,
                  originalTableUpdated: true,
                  rowsUpdated: updatedRowCount,
                  joinPerformed: true,
                  joinedTable: {
                    name: joinedTableName,
                    preview: previewResponse.data.results,
                    counts: {
                      source: sourceCount,
                      target: targetCount,
                      joined: joinedCount
                    }
                  }
                });
              } catch (joinError) {
                console.error("Error performing join operation:", joinError);
                return res.json({
                  updated_rows: updatedRowsWithBoth,
                  replaced_rows: updatedRowsReplaced,
                  relationship: detectedRelationship || relationship,
                  originalTableUpdated: true,
                  rowsUpdated: updatedRowCount,
                  joinPerformed: false,
                  joinError: joinError.message
                });
              }
            }
            
            return res.json({
              updated_rows: updatedRowsWithBoth,
              replaced_rows: updatedRowsReplaced,
              relationship: detectedRelationship || relationship,
              originalTableUpdated: true,
              rowsUpdated: updatedRowCount,
              joinPerformed: false
            });
          } catch (dbError) {
            console.error("Error updating original table:", dbError);
            return res.status(500).json({
              error: "Error updating original table: " + dbError.message,
              updated_rows: updatedRowsWithBoth,
              replaced_rows: updatedRowsReplaced,
              relationship: detectedRelationship || relationship
            });
          }
        }

        return res.json({
          updated_rows: updatedRowsWithBoth,
          replaced_rows: updatedRowsReplaced,
          relationship: detectedRelationship || relationship,
          originalTableUpdated: false
        });
      } catch (err) {
        console.error("General transformation error:", err.response?.data || err.message);
        return res.status(500).json({ error: "Error applying general transformation: " + (err.response?.data?.error || err.message) });
      }
    }

    // Handle NON-GENERAL TRANSFORMATION using Python
    // Safely extract column data, with better error handling
    const columnData = InputData.rawData.map(row => {
      if (!row || typeof row !== 'object') {
        console.error('Invalid row format:', row);
        return null;
      }
      
      // Log the row and column name to help debug
      console.log('Processing row:', row, 'Looking for column:', column_name);
      
      // Check if the column exists in this row
      if (!(column_name in row)) {
        console.warn(`Column '${column_name}' not found in row. Available keys:`, Object.keys(row));
        return null;
      }
      
      return row[column_name];
    });
    
    // Log the extracted column data
    console.log('Extracted column data:', columnData.slice(0, 5));
    
    if (columnData.every(val => val === null)) {
      // If we have source values, use them directly instead of failing
      if (source_values && source_values.length > 0) {
        console.log('Using source values directly as column data');
        return res.status(400).json({ 
          error: `Column '${column_name}' not found in data. Please check your column selection.` 
        });
      } else {
        return res.status(400).json({ 
          error: `Column '${column_name}' not found in data. Available columns: ${InputData.columns.join(', ')}` 
        });
      }
    }
const sanitizedData = columnData.map(item => {
  if (item === null || item === undefined || String(item).trim() === "") {
    return "None";
  }
  const isNumeric = !isNaN(item);
  return isNumeric ? item : `"${String(item).trim()}"`;
});


    const functionName = extractFunctionName(code);
    if (!functionName) {
      return res.status(400).json({ error: "Could not extract function name from code" });
    }

    const wrappedCode = `
import json
import numpy as np

${code}

inputs = [${sanitizedData.join(", ")}]
results = []

for val in inputs:
    try:
        if val is None or val == "None":
            results.append("None")
            continue
        out = ${functionName}(val)
        if isinstance(out, float) and np.isnan(out):
            results.append("NaN")
        else:
            results.append(str(out))
    except Exception as e:
        results.append(f"Error: {e}")

print(json.dumps(results))
`.trim();

    const pythonProcess = spawn("python", ["-c", wrappedCode]);

    let output = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on("close", async () => {
      if (errorOutput && !errorOutput.includes("'NoneType' object has no attribute")) {
        return res.status(500).json({ error: errorOutput.trim() });
      }

      try {
        const transformedValues = JSON.parse(output.trim());
        // Create two versions of the updated rows:
        // 1. With transformed values in a new column (for comparison view)
        const updatedRowsWithBoth = InputData.rawData.map((row, index) => ({
          ...row,
          [`${column_name}_transformed`]: transformedValues[index],
        }));
        
        // 2. With transformed values replacing the original column (for replacement view)
        const updatedRowsReplaced = InputData.rawData.map((row, index) => {
          const newRow = { ...row };
          newRow[column_name] = transformedValues[index] || row[column_name];
          return newRow;
        });

        console.table(updatedRowsWithBoth.slice(0, 5));
        
        // If updateOriginalTable flag is true, update the original table in the database
        if (updateOriginalTable && global.transformationData.connectionString && global.transformationData.currentTable) {
          try {
            const tableName = global.transformationData.currentTable;
            const connectionString = global.transformationData.connectionString;
            
            // Get primary key column for the table
            const getPrimaryKeyQuery = `
              SELECT column_name 
              FROM information_schema.key_column_usage 
              WHERE table_name = '${tableName}' 
              AND constraint_name = 'PRIMARY'
            `;
            
            const pkResponse = await axios.post("http://localhost:5001/api/execute-sql", {
              connectionString,
              query: getPrimaryKeyQuery
            });
            
            if (!pkResponse.data.success || !pkResponse.data.results || pkResponse.data.results.length === 0) {
              console.error("Could not determine primary key for table:", tableName);
              throw new Error("Could not determine primary key for table");
            }
            
            const primaryKeyColumn = pkResponse.data.results[0].column_name;
            console.log(`Using primary key column '${primaryKeyColumn}' for updates`);
            
            // Create batch update statements
            const batchSize = 50; // Update in batches to avoid too large queries
            const totalBatches = Math.ceil(updatedRowsReplaced.length / batchSize);
            
            let updatedRowCount = 0;
            
            for (let batch = 0; batch < totalBatches; batch++) {
              const startIdx = batch * batchSize;
              const endIdx = Math.min((batch + 1) * batchSize, updatedRowsReplaced.length);
              const batchRows = updatedRowsReplaced.slice(startIdx, endIdx);
              
              // Create CASE statement for this batch
              const caseStatements = batchRows.map(row => {
                // Handle different data types appropriately
                const pkValue = typeof row[primaryKeyColumn] === 'string' 
                  ? `'${row[primaryKeyColumn].replace(/'/g, "''")}'` 
                  : row[primaryKeyColumn];
                  
                const colValue = typeof row[column_name] === 'string'
                  ? `'${row[column_name].replace(/'/g, "''")}'`
                  : row[column_name];
                  
                return `WHEN ${primaryKeyColumn} = ${pkValue} THEN ${colValue}`;
              }).join('\n              ');
              
              // Create the update query with CASE statement
              const updateQuery = `
                UPDATE ${tableName} 
                SET ${column_name} = CASE
              ${caseStatements}
                ELSE ${column_name}
                END
                WHERE ${primaryKeyColumn} IN (${batchRows.map(row => {
                  return typeof row[primaryKeyColumn] === 'string' 
                    ? `'${row[primaryKeyColumn].replace(/'/g, "''")}'` 
                    : row[primaryKeyColumn];
                }).join(', ')})
              `;
              
              // Execute the update query
              const updateResponse = await axios.post("http://localhost:5001/api/execute-sql", {
                connectionString,
                query: updateQuery
              });
              
              if (updateResponse.data.success) {
                updatedRowCount += batchRows.length;
                console.log(`Updated batch ${batch + 1}/${totalBatches} (${batchRows.length} rows)`);
              } else {
                console.error(`Failed to update batch ${batch + 1}:`, updateResponse.data.error);
                throw new Error(`Database update failed: ${updateResponse.data.error}`);
              }
            }
            
            console.log(`Successfully updated ${updatedRowCount} rows in the original table`);
            
            // If performJoin is true, perform a join operation with another table
            if (performJoin && joinTable && joinColumn) {
              try {
                const tableName = global.transformationData.currentTable;
                const connectionString = global.transformationData.connectionString;
                const joinedTableName = `${tableName}_joined_${joinTable}`;
                
                // Get columns for both tables
                const getColumnsQuery = async (table) => {
                  const query = `
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = '${table}'
                  `;
                  
                  const response = await axios.post("http://localhost:5001/api/execute-sql", {
                    connectionString,
                    query
                  });
                  
                  if (!response.data.success) {
                    throw new Error(`Failed to get columns for table ${table}`);
                  }
                  
                  return response.data.results.map(row => row.column_name);
                };
                
                const sourceColumns = await getColumnsQuery(tableName);
                const targetColumns = await getColumnsQuery(joinTable);
                
                // Create column lists with proper aliases to avoid duplicates
                const sourceColumnsList = sourceColumns.map(col => `${tableName}.${col} AS ${tableName}_${col}`).join(', ');
                const targetColumnsList = targetColumns
                  .filter(col => col !== joinColumn) // Exclude the join column from target to avoid duplicates
                  .map(col => `${joinTable}.${col} AS ${joinTable}_${col}`)
                  .join(', ');
                
                // Create SQL query for inner join with explicit column selection to avoid duplicates
                const joinQuery = `
                  CREATE TABLE ${joinedTableName} AS
                  SELECT ${sourceColumnsList}, ${targetColumnsList}
                  FROM ${tableName}
                  INNER JOIN ${joinTable}
                  ON ${tableName}.${joinColumn} = ${joinTable}.${joinColumn}
                `;
                
                // Execute the join query
                const joinResponse = await axios.post("http://localhost:5001/api/execute-sql", {
                  connectionString,
                  query: joinQuery
                });
                
                if (!joinResponse.data.success) {
                  throw new Error(`Failed to create joined table: ${joinResponse.data.error}`);
                }
                
                // Fetch preview of the joined table (first 20 rows)
                const previewQuery = `SELECT * FROM ${joinedTableName} LIMIT 20`;
                const previewResponse = await axios.post("http://localhost:5001/api/execute-sql", {
                  connectionString,
                  query: previewQuery
                });
                
                // Get row counts for source, target, and joined tables
                const sourceCountQuery = `SELECT COUNT(*) as count FROM ${tableName}`;
                const targetCountQuery = `SELECT COUNT(*) as count FROM ${joinTable}`;
                const joinedCountQuery = `SELECT COUNT(*) as count FROM ${joinedTableName}`;
                
                const [sourceCountRes, targetCountRes, joinedCountRes] = await Promise.all([
                  axios.post("http://localhost:5001/api/execute-sql", { connectionString, query: sourceCountQuery }),
                  axios.post("http://localhost:5001/api/execute-sql", { connectionString, query: targetCountQuery }),
                  axios.post("http://localhost:5001/api/execute-sql", { connectionString, query: joinedCountQuery })
                ]);
                
                const sourceCount = sourceCountRes.data.results[0].count;
                const targetCount = targetCountRes.data.results[0].count;
                const joinedCount = joinedCountRes.data.results[0].count;
                
                console.log(`Join operation completed: ${joinedTableName} created with ${joinedCount} rows`);
                
                res.json({
                  updated_rows: updatedRowsWithBoth,
                  replaced_rows: updatedRowsReplaced,
                  originalTableUpdated: true,
                  rowsUpdated: updatedRowCount,
                  joinPerformed: true,
                  joinedTable: {
                    name: joinedTableName,
                    preview: previewResponse.data.results,
                    counts: {
                      source: sourceCount,
                      target: targetCount,
                      joined: joinedCount
                    }
                  }
                });
              } catch (joinError) {
                console.error("Error performing join operation:", joinError);
                res.json({
                  updated_rows: updatedRowsWithBoth,
                  replaced_rows: updatedRowsReplaced,
                  originalTableUpdated: true,
                  rowsUpdated: updatedRowCount,
                  joinPerformed: false,
                  joinError: joinError.message
                });
              }
            } else {
              res.json({ 
                updated_rows: updatedRowsWithBoth,
                replaced_rows: updatedRowsReplaced,
                originalTableUpdated: true,
                rowsUpdated: updatedRowCount,
                joinPerformed: false
              });
            }
          } catch (dbError) {
            console.error("Error updating original table:", dbError);
            res.status(500).json({
              error: "Error updating original table: " + dbError.message,
              updated_rows: updatedRowsWithBoth,
              replaced_rows: updatedRowsReplaced
            });
          }
        } else {
          // If performJoin is true, perform a join operation with another table
          if (performJoin && joinTable && joinColumn) {
            try {
              const tableName = global.transformationData.currentTable;
              const connectionString = global.transformationData.connectionString;
              const joinedTableName = `${tableName}_joined_${joinTable}`;
              
              // Get columns for both tables
              const getColumnsQuery = async (table) => {
                const query = `
                  SELECT column_name 
                  FROM information_schema.columns 
                  WHERE table_name = '${table}'
                `;
                
                const response = await axios.post("http://localhost:5001/api/execute-sql", {
                  connectionString,
                  query
                });
                
                if (!response.data.success) {
                  throw new Error(`Failed to get columns for table ${table}`);
                }
                
                return response.data.results.map(row => row.column_name);
              };
              
              const sourceColumns = await getColumnsQuery(tableName);
              const targetColumns = await getColumnsQuery(joinTable);
              
              // Create column lists with proper aliases to avoid duplicates
              const sourceColumnsList = sourceColumns.map(col => `${tableName}.${col} AS ${tableName}_${col}`).join(', ');
              const targetColumnsList = targetColumns
                .filter(col => col !== joinColumn) // Exclude the join column from target to avoid duplicates
                .map(col => `${joinTable}.${col} AS ${joinTable}_${col}`)
                .join(', ');
              
              // Create SQL query for inner join with explicit column selection to avoid duplicates
              const joinQuery = `
                CREATE TABLE ${joinedTableName} AS
                SELECT ${sourceColumnsList}, ${targetColumnsList}
                FROM ${tableName}
                INNER JOIN ${joinTable}
                ON ${tableName}.${joinColumn} = ${joinTable}.${joinColumn}
              `;
              
              // Execute the join query
              const joinResponse = await axios.post("http://localhost:5001/api/execute-sql", {
                connectionString,
                query: joinQuery
              });
              
              if (!joinResponse.data.success) {
                throw new Error(`Failed to create joined table: ${joinResponse.data.error}`);
              }
              
              // Fetch preview of the joined table (first 20 rows)
              const previewQuery = `SELECT * FROM ${joinedTableName} LIMIT 20`;
              const previewResponse = await axios.post("http://localhost:5001/api/execute-sql", {
                connectionString,
                query: previewQuery
              });
              
              // Get row counts for source, target, and joined tables
              const sourceCountQuery = `SELECT COUNT(*) as count FROM ${tableName}`;
              const targetCountQuery = `SELECT COUNT(*) as count FROM ${joinTable}`;
              const joinedCountQuery = `SELECT COUNT(*) as count FROM ${joinedTableName}`;
              
              const [sourceCountRes, targetCountRes, joinedCountRes] = await Promise.all([
                axios.post("http://localhost:5001/api/execute-sql", { connectionString, query: sourceCountQuery }),
                axios.post("http://localhost:5001/api/execute-sql", { connectionString, query: targetCountQuery }),
                axios.post("http://localhost:5001/api/execute-sql", { connectionString, query: joinedCountQuery })
              ]);
              
              const sourceCount = sourceCountRes.data.results[0].count;
              const targetCount = targetCountRes.data.results[0].count;
              const joinedCount = joinedCountRes.data.results[0].count;
              
              console.log(`Join operation completed: ${joinedTableName} created with ${joinedCount} rows`);
              
              res.json({
                updated_rows: updatedRowsWithBoth,
                replaced_rows: updatedRowsReplaced,
                originalTableUpdated: false,
                joinPerformed: true,
                joinedTable: {
                  name: joinedTableName,
                  preview: previewResponse.data.results,
                  counts: {
                    source: sourceCount,
                    target: targetCount,
                    joined: joinedCount
                  }
                }
              });
            } catch (joinError) {
              console.error("Error performing join operation:", joinError);
              res.json({
                updated_rows: updatedRowsWithBoth,
                replaced_rows: updatedRowsReplaced,
                originalTableUpdated: false,
                joinPerformed: false,
                joinError: joinError.message
              });
            }
          } else {
            res.json({ 
              updated_rows: updatedRowsWithBoth,
              replaced_rows: updatedRowsReplaced,
              originalTableUpdated: false,
              joinPerformed: false
            });
          }
        }
      } catch (err) {
        res.status(500).json({ error: "Error parsing transformation output" });
      }
    });

  } catch (error) {
    console.error("Error applying transformation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/test_function", async (req, res) => {
  try {
    const { code, test_inputs } = req.body;

    if (!code || !Array.isArray(test_inputs)) {
      return res.status(400).json({ error: "Function code and test_inputs array are required" });
    }

    const functionName = extractFunctionName(code);
    if (!functionName) {
      return res.status(400).json({ error: "Could not extract function name from code" });
    }

    const sanitizedInputs = test_inputs.map(item => {
      if (item === null || item === undefined || String(item).trim() === "") {
        return "None";
      }
      const isNumeric = !isNaN(item);
      return isNumeric ? item : `"${String(item).trim()}"`;
    });

    const wrappedCode = `
import json
import numpy as np

${code}

inputs = [${sanitizedInputs.join(", ")}]
results = []

for val in inputs:
    try:
        if val is None or val == "None":
            results.append("None")
            continue
        out = ${functionName}(val)
        if isinstance(out, float) and np.isnan(out):
            results.append("NaN")
        else:
            results.append(str(out))
    except Exception as e:
        results.append(f"Error: {e}")

print(json.dumps(results))
`.trim();

    const pythonProcess = spawn("python", ["-c", wrappedCode]);

    let output = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on("close", async () => {
      if (errorOutput) {
        return res.status(500).json({ error: errorOutput.trim() });
      }

      try {
        const testResults = JSON.parse(output.trim());
        res.json({ test_results: testResults });
      } catch (err) {
        res.status(500).json({ error: "Failed to parse test results" });
      }
    });

  } catch (err) {
    console.error("Error testing function:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Function is now defined at the top of the file

// 🔹 Test function on one value using Python (consistent with the apply_transformation endpoint)
app.post("/test_function_single", async (req, res) => {
    try {
        console.log("Received test_function_single request");
        const { code, sample } = req.body;

        console.log("Request payload:", {
            codeLength: code?.length || 0,
            sampleValue: sample,
            sampleType: typeof sample
        });

        // More detailed validation
        if (!code || typeof code !== 'string' || code.trim() === '') {
            console.error("Invalid code provided:", code);
            return res.status(400).json({ error: "Valid function code is required" });
        }

        // Allow empty string as a valid sample
        if (sample === undefined) {
            console.error("Sample value is undefined");
            return res.status(400).json({ error: "Sample value is required" });
        }

        const functionName = extractFunctionName(code);
        console.log("Extracted function name:", functionName);
        
        if (!functionName) {
            console.error("Could not extract function name from code:", code.substring(0, 100));
            return res.status(400).json({ error: "Could not extract function name from the provided code. Make sure your function starts with 'def function_name(param):' syntax." });
        }

        // Determine if the sample is numerical and sanitize it appropriately
        const isNumerical = !isNaN(sample) && typeof sample !== 'boolean' && sample !== '';
        let sanitizedSample;
        
        if (isNumerical) {
            sanitizedSample = sample;
        } else if (typeof sample === 'boolean') {
            sanitizedSample = sample ? 'True' : 'False';
        } else if (sample === null) {
            sanitizedSample = 'None';
        } else if (sample === '') {
            sanitizedSample = '""';
        } else {
            // Escape quotes in string values
            sanitizedSample = `"${String(sample).trim().replace(/"/g, '\\"')}"`;
        }
        
        console.log("Sanitized sample:", sanitizedSample);

        // Use Python instead of JavaScript eval for consistency with apply_transformation
        // Fix the indentation issue by not wrapping the function definition in a try block
        const wrappedCode = `
import json
import numpy as np
import sys

# Define the function first, outside any try blocks
${code}

# Now test the function with proper error handling
try:
    val = ${sanitizedSample}
    result = ${functionName}(val)
    if isinstance(result, float) and np.isnan(result):
        print(json.dumps("NaN"))
    else:
        print(json.dumps(str(result)))
except Exception as e:
    error_type = type(e).__name__
    error_msg = str(e)
    print(json.dumps(f"Error: {error_type} - {error_msg}"), file=sys.stderr)
`.trim();

        console.log("Executing Python code:", wrappedCode.substring(0, 100) + "...");

        const pythonProcess = spawn("python", ["-c", wrappedCode]);
        
        let output = "";
        let errorOutput = "";
        
        pythonProcess.stdout.on("data", (data) => {
            output += data.toString();
        });
        
        pythonProcess.stderr.on("data", (data) => {
            errorOutput += data.toString();
        });
        
        pythonProcess.on("close", (code) => {
            console.log(`Python process exited with code ${code}`);
            console.log("Standard output:", output);
            
            if (errorOutput) {
                console.error("Python error output:", errorOutput);
                try {
                    // Try to parse the error as JSON
                    const parsedError = JSON.parse(errorOutput.trim());
                    return res.status(400).json({ error: parsedError });
                } catch {
                    // If not JSON, return as plain text
                    return res.status(400).json({ error: errorOutput.trim() });
                }
            }
            
            if (!output.trim()) {
                return res.status(500).json({ error: "No output from function execution" });
            }
            
            try {
                const result = JSON.parse(output.trim());
                return res.json({ result });
            } catch (err) {
                console.error("Failed to parse Python output:", err);
                return res.status(500).json({ 
                    error: "Failed to parse result", 
                    rawOutput: output.trim() 
                });
            }
        });
    } catch (err) {
        console.error("Function execution error:", err);
        return res.status(500).json({ 
            error: "Function execution failed", 
            details: err.message,
            stack: err.stack
        });
    }
});

// 🔹 Start Server
const PORT = process.env.PORT || 5000;
// Save transformed data to MongoDB
app.post('/save-transformed-data', async (req, res) => {
  try {
    const { 
      name, 
      description, 
      originalFileName, 
      columns, 
      transformedColumn, 
      transformationCode, 
      transformationType, 
      data 
    } = req.body;

    // Validate required fields
    if (!name || !columns || !transformedColumn || !data || !data.length) {
      return res.status(400).json({ 
        error: 'Missing required fields. Name, columns, transformedColumn, and data are required.' 
      });
    }

    // Create new transformed data document
    const transformedData = new TransformedData({
      name,
      description,
      originalFileName,
      columns,
      transformedColumn,
      transformationCode,
      transformationType,
      data,
      // If authentication is implemented, add userId from req.user
      // userId: req.user._id
    });

    // Save to MongoDB
    await transformedData.save();

    return res.status(201).json({
      success: true,
      message: 'Transformed data saved successfully',
      id: transformedData._id
    });
  } catch (error) {
    console.error('Error saving transformed data:', error);
    return res.status(500).json({ 
      error: 'Failed to save transformed data', 
      details: error.message 
    });
  }
});

// Get all transformed data
app.get('/transformed-data', async (req, res) => {
  try {
    // Get all transformed data, sorted by most recent first
    const transformedDataList = await TransformedData.find()
      .sort({ createdAt: -1 })
      .select('name description originalFileName transformedColumn transformationType createdAt');

    return res.json({
      success: true,
      data: transformedDataList
    });
  } catch (error) {
    console.error('Error fetching transformed data:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch transformed data', 
      details: error.message 
    });
  }
});

// Get transformed data by ID
app.get('/transformed-data/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find transformed data by ID
    const transformedData = await TransformedData.findById(id);
    
    if (!transformedData) {
      return res.status(404).json({ error: 'Transformed data not found' });
    }
    
    return res.json({
      success: true,
      data: transformedData
    });
  } catch (error) {
    console.error('Error fetching transformed data:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch transformed data', 
      details: error.message 
    });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
