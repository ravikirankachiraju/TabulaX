import { FaGoogle, FaFacebook, FaLinkedin } from 'react-icons/fa';

export function GoogleLoginButton() {
  const handleGoogleLogin = () => {
    // TODO: Integrate Google OAuth
    window.location.href = 'http://localhost:5000/auth/google';
  };
  return (
    <button onClick={handleGoogleLogin} className="btn btn-outline w-full flex items-center gap-2 justify-center">
      <FaGoogle className="text-lg" /> Sign in with Google
    </button>
  );
}

export function FacebookLoginButton() {
  const handleFacebookLogin = () => {
    // TODO: Integrate Facebook OAuth
    alert('Facebook login coming soon!');
  };
  return (
    <button onClick={handleFacebookLogin} className="btn btn-outline w-full flex items-center gap-2 justify-center">
      <FaFacebook className="text-lg text-blue-600" /> Sign in with Facebook
    </button>
  );
}

export function LinkedInLoginButton() {
  const handleLinkedInLogin = () => {
    // TODO: Integrate LinkedIn OAuth
    alert('LinkedIn login coming soon!');
  };
  return (
    <button onClick={handleLinkedInLogin} className="btn btn-outline w-full flex items-center gap-2 justify-center">
      <FaLinkedin className="text-lg text-blue-700" /> Sign in with LinkedIn
    </button>
  );
}
