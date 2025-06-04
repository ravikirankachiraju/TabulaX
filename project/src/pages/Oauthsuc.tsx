import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // Importing useNavigate from react-router-dom

const Oauthsuc = () => {
  const navigate = useNavigate();  // Initialize useNavigate hook
  
  useEffect(() => {
    // Check if there's a token in the URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (token) {
      // Store the token in localStorage or sessionStorage
      localStorage.setItem('token', token);  // Or sessionStorage.setItem('authToken', token);
      
      // Redirect the user to the home page or dashboard
      setTimeout(() => {
        navigate('/');
      }, 100); // Or redirect to '/home' or wherever you want the user to go after login
    } else {
      // If no token, redirect to login page or show an error
      navigate('/signin');
    }
  }, [navigate]);  // Add navigate to dependency array
  
  return <div>Loading...</div>;
};

export default Oauthsuc;
