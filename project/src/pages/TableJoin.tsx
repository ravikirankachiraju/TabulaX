import React, { useState } from 'react';
import TableJoinComponent from '../components/TableJoinComponent';

const TableJoinPage: React.FC = () => {
  // Example: you may want to manage connection string, table selection, etc. here
  // For now, let's assume these are provided via props or context, or you can enhance as needed
  const [connectionString, setConnectionString] = useState('');
  const [sourceTable, setSourceTable] = useState('');
  const [transformedColumn, setTransformedColumn] = useState('');
  const [joinedTableName, setJoinedTableName] = useState('');

  // When join completes, update state (for UX, navigation, etc)
  const handleJoinComplete = (name: string) => {
    setJoinedTableName(name);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-slate-50 to-white">
      <div className="container-custom max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-slate-800">Table Join & Data Integration</h1>
        {/* TODO: Add selectors for connectionString, sourceTable, transformedColumn, or use context */}
        <TableJoinComponent
          connectionString={connectionString}
          sourceTable={sourceTable}
          transformedColumn={transformedColumn}
          onJoinComplete={handleJoinComplete}
        />
        {/* Optionally show joinedTableName, download/save UX here */}
      </div>
    </div>
  );
};

export default TableJoinPage;
