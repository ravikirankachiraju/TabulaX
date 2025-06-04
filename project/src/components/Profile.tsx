import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import {
  UserCircleIcon,
  EnvelopeIcon,
  ArrowRightOnRectangleIcon,
  PencilIcon,
  LockClosedIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';

const Profile = () => {
  const [user, setUser] = useState<{ 
    email?: string; 
    name?: string; 
    lastLogin?: string; 
    profilePicture?: File | null; 
  }>({});
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUser({
          email: decoded.email || 'N/A',
          name: decoded.name || 'User',
          lastLogin: decoded.lastLogin || 'N/A',
          profilePicture: decoded.profilePicture || null,
        });
      } catch {
        setUser({});
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/signin');
  };

  const handleEditProfile = () => {
    if (editing) {
      // Save the changes to the server or local storage
      const updatedUser = { name: newName, email: newEmail, profilePicture: newProfilePicture };
      // Simulate a server update
      setUser({ ...user, ...updatedUser });
    }
    setEditing(!editing);
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setNewProfilePicture(file);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white px-6">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-md p-8 text-center">
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-blue-200 text-blue-600 flex items-center justify-center text-4xl font-bold shadow-lg">
            {user.profilePicture ? (
              user.profilePicture instanceof File ? (
                <img src={URL.createObjectURL(user.profilePicture)} alt="Profile" className="w-full h-full object-cover rounded-full" />
              ) : (
                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover rounded-full" />
              )
            ) : (
              user.name?.[0]?.toUpperCase() || 'U'
            )}
          </div>
        </div>

        <h1 className="text-3xl font-semibold text-gray-800 mb-4">
          Welcome, {user.name || 'User'}!
        </h1>

        <div className="text-left space-y-6 mb-6">
          <div className="flex items-center gap-4 text-gray-700">
            <UserCircleIcon className="w-6 h-6 text-blue-500" />
            <div>
              <div className="text-sm font-medium">Full Name</div>
              <div className="text-gray-900 text-lg">{editing ? <input type="text" value={newName || user.name} onChange={(e) => setNewName(e.target.value)} className="border p-2 rounded-lg" /> : user.name}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-gray-700">
            <EnvelopeIcon className="w-6 h-6 text-blue-500" />
            <div>
              <div className="text-sm font-medium">Email</div>
              <div className="text-gray-900 text-lg">{editing ? <input type="email" value={newEmail || user.email} onChange={(e) => setNewEmail(e.target.value)} className="border p-2 rounded-lg" /> : user.email}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-gray-700">
            <DevicePhoneMobileIcon className="w-6 h-6 text-blue-500" />
            <div>
              <div className="text-sm font-medium">Last Login</div>
              <div className="text-gray-900 text-lg">{user.lastLogin || 'Not available'}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-gray-700">
            <input type="file" onChange={handleProfilePictureChange} className="mt-2" />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handleEditProfile}
            className="inline-flex items-center gap-2 px-6 py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 transition rounded-xl font-medium shadow-md"
          >
            <PencilIcon className="w-5 h-5" />
            {editing ? 'Save Changes' : 'Edit Profile'}
          </button>
          <button
            onClick={() => navigate('/account-settings')}
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-600 text-gray-600 hover:bg-gray-50 transition rounded-xl font-medium shadow-md"
          >
            <LockClosedIcon className="w-5 h-5" />
            Account Settings
          </button>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-6 py-3 border border-red-600 text-red-600 hover:bg-red-50 transition rounded-xl font-medium shadow-md"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
