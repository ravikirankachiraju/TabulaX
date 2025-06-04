import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Database, UserCircle2 } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
        }
      } catch {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, [location]);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navItems = [
  { name: 'Home', path: '/' },
  ...(isLoggedIn ? [{ name: 'Transform', path: '/demo' }] : []),
  { name: 'Features', path: '/features' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];


  return (
    <header
     className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-3' : 'py-5'}`}
     style={!isScrolled ? { backgroundColor: '#F9FBFD' } : {}}>

      <div className="container-custom">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-blue-600">
              <Database size={32} />
            </div>
            <span className="font-bold text-2xl text-slate-900">TabulaX</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8 items-center">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`font-medium transition-colors duration-200 ${
                  location.pathname === item.path
                    ? 'text-blue-600'
                    : 'text-slate-700 hover:text-blue-600'
                }`}
              >
                {item.name}
              </Link>
            ))}

            {isLoggedIn && (
                <>
                  <Link to="/demo" className="btn btn-primary text-center">Try It Now</Link>
                  <Link to="/table-uploader" className="btn btn-secondary text-center mt-2">Table Uploader</Link>
                </>
              )}
            {!isLoggedIn ? (
              <>
                <Link to="/signin" className="btn btn-outline ml-2">Sign In</Link>
                <Link to="/signup" className="btn btn-link ml-1">Sign Up</Link>
              </>
            ) : (
              <div className="ml-4 flex items-center space-x-3">
                <Link to="/profile">
                  <UserCircle2 className="text-blue-600 cursor-pointer" size={32} />
                </Link>
                
              </div>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-slate-700" onClick={toggleMenu} aria-label="Toggle menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg animate-fade-in">
          <div className="container-custom py-4">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`py-2 font-medium ${
                    location.pathname === item.path
                      ? 'text-blue-600'
                      : 'text-slate-700'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <Link to="/demo" className="btn btn-primary text-center">Try It Now</Link>

              {!isLoggedIn ? (
                <>
                  <Link to="/signin" className="btn btn-outline text-center mt-2">Sign In</Link>
                  <Link to="/signup" className="btn btn-link text-center mt-1">Sign Up</Link>
                </>
              ) : (
                <div className="flex justify-center mt-3 space-x-3">
                  <Link to="/profile">
                    <UserCircle2 className="text-blue-600 cursor-pointer" size={32} />
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
