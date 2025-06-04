import React from 'react';

interface DemoExample {
  title: string;
  description: string;
  source: string;
  target: string;
}

interface DemoExamplesProps {
  onSelectExample: (example: { source: string, target: string }) => void;
}

const DemoExamples: React.FC<DemoExamplesProps> = ({ onSelectExample }) => {
  const examples: DemoExample[] = [
    {
      title: "Product Catalog",
      description: "Format product data with proper IDs and pricing",
      source: `ID,Name,Value
1,apple,10.5
2,banana,15.0
3,cherry,7.25
4,dragonfruit,12.75
5,elderberry,9.99`,
      target: `ProductID,Item,Price
001,Apple,$10.50
002,Banana,$15.00
003,Cherry,$7.25
004,Dragonfruit,$12.75
005,Elderberry,$9.99`
    },
    {
      title: "Contact Information",
      description: "Reformat contact details with proper formatting",
      source: `id,first,last,phone,email
1,john,doe,5551234567,johndoe@email.com
2,jane,smith,5559876543,jsmith@email.com
3,bob,johnson,5551112222,bob.j@email.com`,
      target: `ContactID,Name,PhoneNumber,EmailAddress
C001,John Doe,(555) 123-4567,johndoe@email.com
C002,Jane Smith,(555) 987-6543,jsmith@email.com
C003,Bob Johnson,(555) 111-2222,bob.j@email.com`
    },
    {
      title: "Date Reformatting",
      description: "Convert between date formats",
      source: `event_id,event_name,date
1001,Conference,2023-05-15
1002,Workshop,2023-06-22
1003,Meeting,2023-07-10`,
      target: `ID,Event,FormattedDate,Month
EV-1001,Conference,May 15, 2023,May
EV-1002,Workshop,June 22, 2023,June
EV-1003,Meeting,July 10, 2023,July`
    }
  ];
  
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {examples.map((example, index) => (
        <div 
          key={index} 
          className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
          onClick={() => onSelectExample({
            source: example.source,
            target: example.target
          })}
        >
          <h4 className="font-medium text-slate-800 mb-1">{example.title}</h4>
          <p className="text-sm text-slate-600 mb-2">{example.description}</p>
          <div className="text-blue-600 text-sm font-medium">Try this example →</div>
        </div>
      ))}
    </div>
  );
};

export default DemoExamples;