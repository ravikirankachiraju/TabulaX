const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const pg = require('pg');
const mssql = require('mssql');
const oracledb = require('oracledb');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

// Parse connection string to get database configuration
const parseConnectionString = (connectionString) => {
  try {
    const url = new URL(connectionString);
    const protocol = url.protocol.replace(':', '');
    
    // Extract database type from protocol
    let dbType = protocol.split('+')[0];
    
    return {
      dbType,
      host: url.hostname,
      port: url.port,
      database: url.pathname.substring(1), // Remove leading slash
      username: url.username,
      password: url.password
    };
  } catch (error) {
    console.error('Error parsing connection string:', error);
    throw new Error('Invalid connection string format');
  }
};

// Connect to database and get tables
router.post('/connect', async (req, res) => {
  try {
    const { connectionString } = req.body;
    
    if (!connectionString) {
      return res.status(400).json({ success: false, error: 'Connection string is required' });
    }
    
    const config = parseConnectionString(connectionString);
    let tables = [];
    
    switch (config.dbType) {
      case 'mysql':
        // Connect to MySQL
        const mysqlConnection = await mysql.createConnection({
          host: config.host,
          port: config.port,
          user: config.username,
          password: config.password,
          database: config.database
        });
        
        // Get tables
        const [mysqlRows] = await mysqlConnection.execute(
          'SELECT table_name FROM information_schema.tables WHERE table_schema = ?',
          [config.database]
        );
        
        tables = mysqlRows.map(row => row.table_name);
        await mysqlConnection.end();
        break;
        
      case 'postgresql':
        // Connect to PostgreSQL
        const pgClient = new pg.Client({
          host: config.host,
          port: config.port,
          user: config.username,
          password: config.password,
          database: config.database
        });
        
        await pgClient.connect();
        
        // Get tables
        const pgResult = await pgClient.query(
          "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        );
        
        tables = pgResult.rows.map(row => row.table_name);
        await pgClient.end();
        break;
        
      case 'mssql':
        // Connect to SQL Server
        await mssql.connect({
          server: config.host,
          port: parseInt(config.port),
          user: config.username,
          password: config.password,
          database: config.database,
          options: {
            trustServerCertificate: true
          }
        });
        
        // Get tables
        const mssqlResult = await mssql.query`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_type = 'BASE TABLE'
        `;
        
        tables = mssqlResult.recordset.map(row => row.table_name);
        await mssql.close();
        break;
        
      case 'oracle':
        // Connect to Oracle
        oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
        const oracleConnection = await oracledb.getConnection({
          user: config.username,
          password: config.password,
          connectString: `${config.host}:${config.port}/${config.database}`
        });
        
        // Get tables
        const oracleResult = await oracleConnection.execute(
          `SELECT table_name FROM user_tables`
        );
        
        tables = oracleResult.rows.map(row => row.TABLE_NAME);
        await oracleConnection.close();
        break;
        
      case 'sqlite':
        // Connect to SQLite
        const sqliteDb = await open({
          filename: config.database,
          driver: sqlite3.Database
        });
        
        // Get tables
        const sqliteRows = await sqliteDb.all(
          `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
        );
        
        tables = sqliteRows.map(row => row.name);
        await sqliteDb.close();
        break;
        
      default:
        return res.status(400).json({ 
          success: false, 
          error: `Unsupported database type: ${config.dbType}` 
        });
    }
    
    return res.json({ success: true, tables });
    
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ 
      success: false, 
      error: `Failed to connect to database: ${error.message}` 
    });
  }
});

// Get columns for a specific table
router.post('/tables/:table/columns', async (req, res) => {
  try {
    const { table } = req.params;
    const { connectionString } = req.body;
    
    if (!connectionString) {
      return res.status(400).json({ success: false, error: 'Connection string is required' });
    }
    
    const config = parseConnectionString(connectionString);
    let columns = [];
    
    switch (config.dbType) {
      case 'mysql':
        // Connect to MySQL
        const mysqlConnection = await mysql.createConnection({
          host: config.host,
          port: config.port,
          user: config.username,
          password: config.password,
          database: config.database
        });
        
        // Get columns
        const [mysqlRows] = await mysqlConnection.execute(
          'SELECT column_name FROM information_schema.columns WHERE table_schema = ? AND table_name = ?',
          [config.database, table]
        );
        
        columns = mysqlRows.map(row => row.column_name);
        await mysqlConnection.end();
        break;
        
      case 'postgresql':
        // Connect to PostgreSQL
        const pgClient = new pg.Client({
          host: config.host,
          port: config.port,
          user: config.username,
          password: config.password,
          database: config.database
        });
        
        await pgClient.connect();
        
        // Get columns
        const pgResult = await pgClient.query(
          'SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2',
          ['public', table]
        );
        
        columns = pgResult.rows.map(row => row.column_name);
        await pgClient.end();
        break;
        
      case 'mssql':
        // Connect to SQL Server
        await mssql.connect({
          server: config.host,
          port: parseInt(config.port),
          user: config.username,
          password: config.password,
          database: config.database,
          options: {
            trustServerCertificate: true
          }
        });
        
        // Get columns
        const mssqlResult = await mssql.query`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = ${table}
        `;
        
        columns = mssqlResult.recordset.map(row => row.column_name);
        await mssql.close();
        break;
        
      case 'oracle':
        // Connect to Oracle
        oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
        const oracleConnection = await oracledb.getConnection({
          user: config.username,
          password: config.password,
          connectString: `${config.host}:${config.port}/${config.database}`
        });
        
        // Get columns
        const oracleResult = await oracleConnection.execute(
          `SELECT column_name FROM user_tab_columns WHERE table_name = :table`,
          { table: table.toUpperCase() }
        );
        
        columns = oracleResult.rows.map(row => row.COLUMN_NAME);
        await oracleConnection.close();
        break;
        
      case 'sqlite':
        // Connect to SQLite
        const sqliteDb = await open({
          filename: config.database,
          driver: sqlite3.Database
        });
        
        // Get columns
        const sqliteRows = await sqliteDb.all(
          `PRAGMA table_info(${table})`
        );
        
        columns = sqliteRows.map(row => row.name);
        await sqliteDb.close();
        break;
        
      default:
        return res.status(400).json({ 
          success: false, 
          error: `Unsupported database type: ${config.dbType}` 
        });
    }
    
    return res.json({ success: true, columns });
    
  } catch (error) {
    console.error('Error fetching columns:', error);
    return res.status(500).json({ 
      success: false, 
      error: `Failed to fetch columns: ${error.message}` 
    });
  }
});

// Fetch data from a table
router.post('/tables/:table/data', async (req, res) => {
  try {
    const { table } = req.params;
    const { connectionString, column } = req.body;
    
    if (!connectionString) {
      return res.status(400).json({ success: false, error: 'Connection string is required' });
    }
    
    const config = parseConnectionString(connectionString);
    let data = [];
    
    switch (config.dbType) {
      case 'mysql':
        // Connect to MySQL
        const mysqlConnection = await mysql.createConnection({
          host: config.host,
          port: config.port,
          user: config.username,
          password: config.password,
          database: config.database
        });
        
        // Get data
        let query = `SELECT * FROM ${table}`;
        if (column) {
          query = `SELECT ${column} FROM ${table}`;
        }
        
        const [mysqlRows] = await mysqlConnection.execute(query);
        data = mysqlRows;
        await mysqlConnection.end();
        break;
        
      case 'postgresql':
        // Connect to PostgreSQL
        const pgClient = new pg.Client({
          host: config.host,
          port: config.port,
          user: config.username,
          password: config.password,
          database: config.database
        });
        
        await pgClient.connect();
        
        // Get data
        let pgQuery = `SELECT * FROM ${table}`;
        if (column) {
          pgQuery = `SELECT ${column} FROM ${table}`;
        }
        
        const pgResult = await pgClient.query(pgQuery);
        data = pgResult.rows;
        await pgClient.end();
        break;
        
      case 'mssql':
        // Connect to SQL Server
        await mssql.connect({
          server: config.host,
          port: parseInt(config.port),
          user: config.username,
          password: config.password,
          database: config.database,
          options: {
            trustServerCertificate: true
          }
        });
        
        // Get data
        let mssqlQuery = `SELECT * FROM ${table}`;
        if (column) {
          mssqlQuery = `SELECT ${column} FROM ${table}`;
        }
        
        const mssqlResult = await mssql.query(mssqlQuery);
        data = mssqlResult.recordset;
        await mssql.close();
        break;
        
      case 'oracle':
        // Connect to Oracle
        oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
        const oracleConnection = await oracledb.getConnection({
          user: config.username,
          password: config.password,
          connectString: `${config.host}:${config.port}/${config.database}`
        });
        
        // Get data
        let oracleQuery = `SELECT * FROM ${table}`;
        if (column) {
          oracleQuery = `SELECT ${column} FROM ${table}`;
        }
        
        const oracleResult = await oracleConnection.execute(oracleQuery);
        data = oracleResult.rows;
        await oracleConnection.close();
        break;
        
      case 'sqlite':
        // Connect to SQLite
        const sqliteDb = await open({
          filename: config.database,
          driver: sqlite3.Database
        });
        
        // Get data
        let sqliteQuery = `SELECT * FROM ${table}`;
        if (column) {
          sqliteQuery = `SELECT ${column} FROM ${table}`;
        }
        
        const sqliteRows = await sqliteDb.all(sqliteQuery);
        data = sqliteRows;
        await sqliteDb.close();
        break;
        
      default:
        return res.status(400).json({ 
          success: false, 
          error: `Unsupported database type: ${config.dbType}` 
        });
    }
    
    // Format data for the frontend
    const columns = data.length > 0 ? Object.keys(data[0]) : [];
    const rawData = data;
    
    return res.json({ 
      success: true, 
      columns,
      rawData,
      samples: data.slice(0, 5)
    });
    
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ 
      success: false, 
      error: `Failed to fetch data: ${error.message}` 
    });
  }
});

module.exports = router;
