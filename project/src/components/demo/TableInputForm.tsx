import React from 'react';
import { FileUp, RefreshCw } from 'lucide-react';

interface TableInputFormProps {
  sourceValue: string;
  targetValue: string;
  onSourceChange: (value: string) => void;
  onTargetChange: (value: string) => void;
  onTransform: () => void;
  isLoading: boolean;
}

const TableInputForm: React.FC<TableInputFormProps> = ({
  sourceValue,
  targetValue,
  onSourceChange,
  onTargetChange,
  onTransform,
  isLoading
}) => {
  const handleSourceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        onSourceChange(text);
      };
      reader.readAsText(file);
    }
  };
  
  const handleTargetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        onTargetChange(text);
      };
      reader.readAsText(file);
    }
  };
  
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <div className="mb-4">
          <label htmlFor="sourceTable" className="block font-medium text-slate-700 mb-2">
            Source Table (CSV)
          </label>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="file"
              id="sourceFileUpload"
              className="hidden"
              accept=".csv,.txt"
              onChange={handleSourceUpload}
            />
            <label
              htmlFor="sourceFileUpload"
              className="btn btn-secondary text-sm py-2 inline-flex items-center cursor-pointer"
            >
              <FileUp size={16} className="mr-1" />
              Upload CSV
            </label>
            <span className="text-sm text-slate-500">or paste below</span>
          </div>
          <textarea
            id="sourceTable"
            rows={10}
            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            placeholder="ID,Name,Value
1,apple,10.5
2,banana,15.0
3,cherry,7.25"
            value={sourceValue}
            onChange={(e) => onSourceChange(e.target.value)}
          ></textarea>
        </div>
      </div>
      
      <div>
        <div className="mb-4">
          <label htmlFor="targetTable" className="block font-medium text-slate-700 mb-2">
            Target Table Format (CSV)
          </label>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="file"
              id="targetFileUpload"
              className="hidden"
              accept=".csv,.txt"
              onChange={handleTargetUpload}
            />
            <label
              htmlFor="targetFileUpload"
              className="btn btn-secondary text-sm py-2 inline-flex items-center cursor-pointer"
            >
              <FileUp size={16} className="mr-1" />
              Upload CSV
            </label>
            <span className="text-sm text-slate-500">or paste below</span>
          </div>
          <textarea
            id="targetTable"
            rows={10}
            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            placeholder="ProductID,Item,Price
001,Apple,$10.50
002,Banana,$15.00
003,Cherry,$7.25"
            value={targetValue}
            onChange={(e) => onTargetChange(e.target.value)}
          ></textarea>
        </div>
      </div>
      
      <div className="md:col-span-2 flex justify-center mt-4">
        <button
          className="btn btn-primary inline-flex items-center"
          onClick={onTransform}
          disabled={isLoading || !sourceValue.trim() || !targetValue.trim()}
        >
          {isLoading ? (
            <>
              <RefreshCw size={20} className="mr-2 animate-spin" />
              Transforming...
            </>
          ) : (
            <>
              Transform Data
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TableInputForm;