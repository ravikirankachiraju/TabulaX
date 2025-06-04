import React from 'react';
import { Link } from 'react-router-dom';
import { Database, Github, Twitter, Mail } from 'lucide-react';
import { FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="text-blue-400">
                <Database size={28} />
              </div>
              <span className="font-bold text-xl text-white">TabulaX</span>
            </Link>
            <p className="text-slate-300 text-sm">
              AI-powered table transformation tool that converts your data seamlessly.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="https://github.com/shasha-0206" className="text-slate-300 hover:text-white transition-colors" aria-label="GitHub">
                <Github size={20} />
              </a>
              <a href="https://x.com/krk_sharma45?t=oXOIV_QKsj61SKq_BYtpaQ&s=09" className="text-slate-300 hover:text-white transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="https://mail.google.com/mail/u/0/?tab=rm&ogbl#inbox?compose=VpCqJVFffNfDCLlKTQmcjzqMRbssVGmvbRhTrSQRJPPbgnBdtDSVqlqgsTSsHBBRtQvVtxb" className="text-slate-300 hover:text-white transition-colors" aria-label="Email">
                <Mail size={20} />
              </a>
               
               <a href="https://www.instagram.com/asir_576?igsh=MTZvM3BocGFtdXB6Mg==" className="text-slate-300 hover:text-white transition-colors" aria-label="Instagram">
                <FaInstagram size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-lg text-white">Product</h3>
            <ul className="space-y-2">
              <li><Link to="/features" className="text-slate-300 hover:text-white transition-colors">Features</Link></li>
              <li><Link to="/demo" className="text-slate-300 hover:text-white transition-colors">Transform</Link></li>
              <li><Link to="/about" className="text-slate-300 hover:text-white transition-colors">About</Link></li>
              
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-lg text-white">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors">How to use?</a></li>
              <li><a href="https://arxiv.org/pdf/2411.17110" className="text-slate-300 hover:text-white transition-colors">Research Paper</a></li>

            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-lg text-white">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex"><Mail size={20} />&nbsp;<a href="https://mail.google.com/mail/u/0/?tab=rm&ogbl#inbox?compose=VpCqJVFffNfDCLlKTQmcjzqMRbssVGmvbRhTrSQRJPPbgnBdtDSVqlqgsTSsHBBRtQvVtxb" className="text-slate-300 hover:text-white transition-colors">grandhi.navneetsai@gmail.com</a></li>
              <li className="flex"><Mail size={20} />&nbsp;<a href="https://mail.google.com/mail/u/0/?tab=rm&ogbl#inbox?compose=VpCqJVFffNfDCLlKTQmcjzqMRbssVGmvbRhTrSQRJPPbgnBdtDSVqlqgsTSsHBBRtQvVtxb" className="text-slate-300 hover:text-white transition-colors">abhimanyuu.partha@gmail.com</a></li>
              <li className="flex"><Mail size={20} />&nbsp;<a href="https://mail.google.com/mail/u/0/?tab=rm&ogbl#inbox?compose=GTvVlcSDbFhMjnxqCDsgRSlKHLSxfBGCsspTLflSVVWLZFJRKZfsZmhSmTwmvwZZCwcCnJNBrHPDw" className="text-slate-300 hover:text-white transition-colors">harshathgaini@gmail.com</a></li>



            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} TabulaX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;