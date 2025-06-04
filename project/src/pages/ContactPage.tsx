import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Users, Building2, Check } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: '',
    agreement: false
  });
  
  const [formSuccess, setFormSuccess] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would send this data to your backend
    console.log('Form submitted:', formData);
    
    // Simulate form submission success
    setTimeout(() => {
      setFormSuccess(true);
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        subject: '',
        message: '',
        agreement: false
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setFormSuccess(false);
      }, 5000);
    }, 1000);
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container-custom">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="mb-6">Contact Us</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Have questions about TabulaX? Our team is here to help. Reach out to us for support, 
            demos, or partnership opportunities.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Information */}
          <div className="lg:col-span-1 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-white">Get in Touch</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <Mail className="mr-4 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-white mb-1">Email Us</h3>
                  <p className="text-blue-100">info@tabulax.io</p>
                  <p className="text-blue-100">support@tabulax.io</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="mr-4 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-white mb-1">Call Us</h3>
                  <p className="text-blue-100">+1 (555) 123-4567</p>
                  <p className="text-blue-100">Mon-Fri, 9AM-6PM EST</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="mr-4 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-white mb-1">Visit Us</h3>
                  <p className="text-blue-100">
                    TabulaX Headquarters<br />
                    100 Innovation Way<br />
                    Cambridge, MA 02142
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MessageCircle className="mr-4 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-white mb-1">Live Chat</h3>
                  <p className="text-blue-100">
                    Chat with our support team.<br />
                    Available 24/7.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-10 pt-8 border-t border-blue-500">
              <h3 className="font-semibold text-white mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="bg-white/10 hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center transition-colors" aria-label="Twitter">
                  <svg width="20" height="20" fill="currentColor" className="text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                  </svg>
                </a>
                <a href="#" className="bg-white/10 hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center transition-colors" aria-label="LinkedIn">
                  <svg width="20" height="20" fill="currentColor" className="text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
                <a href="#" className="bg-white/10 hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center transition-colors" aria-label="GitHub">
                  <svg width="20" height="20" fill="currentColor" className="text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
            
            {formSuccess ? (
              <div className="bg-green-100 border border-green-200 text-green-800 rounded-lg p-4 mb-6 flex items-start">
                <Check className="mr-3 mt-1 text-green-600 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold">Message Sent!</h3>
                  <p>Thank you for contacting us. We'll get back to you shortly.</p>
                </div>
              </div>
            ) : null}
            
            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-1">
                    Company
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 size={16} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full pl-10 rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone size={16} className="text-slate-400" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Product Demo">Request a Demo</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Pricing">Pricing Information</option>
                  <option value="Partnership">Partnership Opportunity</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  required
                ></textarea>
              </div>
              
              <div className="mb-6">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="agreement"
                    name="agreement"
                    checked={formData.agreement}
                    onChange={handleCheckboxChange}
                    className="mt-1 rounded border-slate-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-offset-0"
                    required
                  />
                  <label htmlFor="agreement" className="ml-2 block text-sm text-slate-600">
                    I agree to the <a href="#" className="text-blue-600 hover:text-blue-800">Privacy Policy</a> and 
                    consent to TabulaX storing my information for contact purposes.
                  </label>
                </div>
              </div>
              
              <button
                type="submit"
                className="btn btn-primary w-full md:w-auto"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="bg-slate-50 rounded-xl p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-600 max-w-3xl mx-auto">
              Find quick answers to common questions about TabulaX.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-2">How quickly can I get started with TabulaX?</h3>
              <p className="text-slate-600">
                You can start using TabulaX immediately after signing up. Our user-friendly interface allows you to 
                upload data and see transformations within minutes.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-2">Is my data secure with TabulaX?</h3>
              <p className="text-slate-600">
                Yes, we take data security seriously. All data is encrypted in transit and at rest, and we comply 
                with GDPR, HIPAA, and other data protection regulations.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-2">Can TabulaX handle large datasets?</h3>
              <p className="text-slate-600">
                Absolutely! TabulaX is built to handle datasets of all sizes, from small tables to enterprise-scale 
                data warehouses with millions of rows.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-2">Do you offer custom integrations?</h3>
              <p className="text-slate-600">
                Yes, our Enterprise plan includes custom integrations with your existing data infrastructure. 
                Contact our sales team to discuss your specific needs.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <a href="#" className="text-blue-600 font-medium hover:text-blue-800">
              View all FAQs
            </a>
          </div>
        </div>
        
        {/* Office Locations */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Our Offices</h2>
            <p className="text-slate-600 max-w-3xl mx-auto">
              TabulaX has a global presence with offices in key technology hubs around the world.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl overflow-hidden shadow-md">
              <div className="h-40 bg-slate-300 relative">
                <img 
                  src="https://images.pexels.com/photos/2129796/pexels-photo-2129796.png?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Boston Office" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-1">Boston</h3>
                <p className="text-slate-600 mb-4">
                  100 Innovation Way<br />
                  Cambridge, MA 02142
                </p>
                <p className="text-blue-600">+1 (555) 123-4567</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl overflow-hidden shadow-md">
              <div className="h-40 bg-slate-300 relative">
                <img 
                  src="https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="San Francisco Office" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-1">San Francisco</h3>
                <p className="text-slate-600 mb-4">
                  555 Market Street<br />
                  San Francisco, CA 94105
                </p>
                <p className="text-blue-600">+1 (555) 987-6543</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl overflow-hidden shadow-md">
              <div className="h-40 bg-slate-300 relative">
                <img 
                  src="https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="London Office" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-1">London</h3>
                <p className="text-slate-600 mb-4">
                  25 Innovation Centre<br />
                  London, UK EC2A 4PU
                </p>
                <p className="text-blue-600">+44 20 1234 5678</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;