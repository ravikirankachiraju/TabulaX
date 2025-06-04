import { Link } from 'react-router-dom';
import { ArrowRight, Code, BarChart2, RefreshCw, Download, Zap, Upload } from 'lucide-react';
import FeatureCard from '../components/ui/FeatureCard';

const HomePage = () => {
  const features = [
    {
      icon: <Upload className="text-blue-500" size={24} />,
      title: "Simple Data Import",
      description: "Upload CSV, Excel or paste your source and target tables directly."
    },
    {
      icon: <Zap className="text-violet-500" size={24} />,
      title: "AI-Powered Transformation",
      description: "Our AI analyzes your data and automatically finds the best transformation rules."
    },
    {
      icon: <BarChart2 className="text-emerald-500" size={24} />,
      title: "Dynamic Dashboard",
      description: "Visualize your data with interactive charts and filtering options."
    },
    {
      icon: <Code className="text-amber-500" size={24} />,
      title: "Transparent Logic",
      description: "View and customize the transformation code that powers your data conversion."
    },
    {
      icon: <RefreshCw className="text-rose-500" size={24} />,
      title: "Iterative Refinement",
      description: "Fine-tune transformations by providing additional examples."
    },
    {
      icon: <Download className="text-cyan-500" size={24} />,
      title: "Export Options",
      description: "Download transformed data in multiple formats, including the transformation code."
    }
  ];



  return (
    <div>
      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="font-bold mb-6 leading-tight">
                 <span className="text-blue-400">Transform Tables Intelligently</span>
              </h1>
              <p className="text-slate-300 text-xl mb-8">
                TabulaX uses AI to automatically find and apply the best transformation rules between your source and target data tables.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/demo" className="btn btn-primary">
                  Try It Now
                </Link>
                <Link to="/features" className="btn btn-secondary text-slate-800">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="animate-fade-in hidden md:block">
              <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="text-blue-300 font-medium mb-2">Source Table</h4>
                    <div className="bg-slate-800/70 rounded p-2 text-xs font-mono overflow-hidden">
                      <pre className="text-slate-300">
{`ID,Name,Value
1,apple,10.5
2,banana,15.0
3,cherry,7.25`}
                      </pre>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="text-green-300 font-medium mb-2">Target Table</h4>
                    <div className="bg-slate-800/70 rounded p-2 text-xs font-mono overflow-hidden">
                      <pre className="text-slate-300">
{`ProductID,Item,Price
001,Apple,$10.50
002,Banana,$15.00
003,Cherry,$7.25`}
                      </pre>
                    </div>
                  </div>
                  <div className="col-span-2 bg-white/10 rounded-lg p-4 mt-2">
                    <h4 className="text-violet-300 font-medium mb-2">Transformation Code</h4>
                    <div className="bg-slate-800/70 rounded p-2 text-xs font-mono overflow-hidden">
                      <pre className="text-slate-300">
{`def transform(row):
  return {
    "ProductID": f"00{row['ID']}",
    "Item": row['Name'].title(),
    "Price": f"$\{parseFloat(row['Value']).toFixed(2)}"
  }`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="mb-4">How TabulaX Works</h2> 
            <p className="max-w-3xl mx-auto text-slate-600">
              Our AI-powered platform automatically discovers and applies transformations between tables, 
              saving you hours of manual data wrangling.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-600 font-bold text-2xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Upload Your Data</h3>
              <p className="text-slate-600">
                Import your source table and an example of how you want your data to be transformed.
              </p>
            </div>
            
            <div className="card text-center animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-600 font-bold text-2xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Analysis</h3>
              <p className="text-slate-600">
                Our AI engine analyzes the patterns between your source and target, inferring the transformation rules.
              </p>
            </div>
            
            <div className="card text-center animate-slide-up" style={{animationDelay: '0.3s'}}>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-600 font-bold text-2xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Transform & Visualize</h3>
              <p className="text-slate-600">
                Get your transformed data with interactive visualization and exportable transformation code.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link to="/demo" className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800">
              Try using TabulaX
              <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-slate-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="mb-4">Powerful Features</h2>
            <p className="max-w-3xl mx-auto text-slate-600">
              TabulaX combines AI intelligence with intuitive design to make table transformations effortless.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={(index + 1) * 0.1}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container-custom text-center">
          <h2 className="mb-6 text-white">Ready to Transform Your Data?</h2>
          <p className="max-w-3xl mx-auto mb-8 text-blue-100 text-lg">
            Join thousands of data professionals who use TabulaX to streamline their data transformation workflows.
          </p>
          <Link to="/demo" className="btn bg-white text-blue-600 hover:bg-blue-50">
            Try TabulaX Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;