import React from 'react';
import { 
  Users, 
  Lightbulb, 
  Code, 
  Database, 
  PieChart,
  Zap,
  Award
} from 'lucide-react';

const AboutPage = () => {
  

  return (
    <div className="pt-24 pb-16">
      <div className="container-custom">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="mb-6">About TabulaX</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            We're on a mission to revolutionize how people work with data by automating complex table transformations.
          </p>
        </div>
        
        {/* Our Story */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="mb-6">Our Story</h2>
            <p className="text-slate-600 mb-4">
              TabulaX began as a research project at University of Alberta,Canada in 2024, 
              focusing on applying large language models to solve challenging data transformation problems.
            </p>
            <p className="text-slate-600 mb-4">
              After publishing our groundbreaking research paper, we received overwhelming interest from data 
              professionals who were spending countless hours manually transforming tables.
            </p>
            <p className="text-slate-600">
              Today, TabulaX has evolved into a powerful platform that combines cutting-edge AI research with 
              an intuitive interface, helping thousands of users save time and reduce errors in their data workflows.
            </p>
          </div>
          <div className="bg-slate-100 p-8 rounded-xl">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-blue-600 mb-4">
                <Award size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Research Background</h3>
              <p className="text-slate-600 mb-4">
                Our approach is based on the peer-reviewed research paper 
                <strong> "TabulaX: Learning Contextual Table Transformations via Self-Supervised Methods"</strong> 
                presented at NeurIPS 2023.
              </p>
              <a 
                href="#"
                className="text-blue-600 font-medium inline-flex items-center hover:text-blue-800"
              >
                Read the paper
                <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        {/* Our Values */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="mb-4">Our Values</h2>
            <p className="text-slate-600 max-w-3xl mx-auto">
              The principles that guide our product development and company culture.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card">
              <div className="rounded-full bg-blue-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <Lightbulb className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Innovation</h3>
              <p className="text-slate-600">
                We continuously push the boundaries of what's possible with AI and data transformation technologies.
              </p>
            </div>
            
            <div className="card">
              <div className="rounded-full bg-green-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <Code className="text-green-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Transparency</h3>
              <p className="text-slate-600">
                We believe users should understand the logic behind transformations, not just see the results.
              </p>
            </div>
            
            <div className="card">
              <div className="rounded-full bg-violet-100 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <Zap className="text-violet-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Empowerment</h3>
              <p className="text-slate-600">
                We build tools that give users superpowers, automating tedious tasks so they can focus on high-value work.
              </p>
            </div>
          </div>
        </div>
        
        
        
        
        
        {/* CTA */}
        <div className="text-center">
          <h2 className="mb-6">Ready to Transform Your Data Workflow?</h2>
          <p className="text-slate-600 max-w-3xl mx-auto mb-8">
            Join thousands of data professionals who use TabulaX to automate their table transformations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/demo" className="btn btn-primary">
              Try TabulaX Now
            </a>
            <a href="/contact" className="btn btn-secondary">
              Contact Sales
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;