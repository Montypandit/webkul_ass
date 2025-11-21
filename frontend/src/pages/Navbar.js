import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import AuthContext from '../context/AuthContext';

export default function Navbar() {
  const { user, logoutUser } = useContext(AuthContext);

  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    setIsOpen(false);
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsOpen(false);
  };

  return (
    <nav className="bg-blue-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link 
              to={user ? "/profile" : "/login"}
              className="text-white font-bold text-2xl hover:text-blue-200 transition"
            >
              Social_Network
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* User Info */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-white text-sm font-medium">{user?.username || 'User'}</p>
                  </div>
                  
                  {/* Profile Icon/Avatar */}
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 transition text-white font-semibold"
                    title="Go to profile"
                  >
                    <User size={20} />
                  </button>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                {/* Login and Register Buttons */}
                <Link
                  to="/login"
                  className="px-4 py-2 bg-white text-blue-900 hover:bg-blue-100 rounded-lg transition font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-blue-200 transition"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden bg-blue-800 border-t border-blue-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {user ? (
                <>
                  {/* Mobile User Info */}
                  <div className="px-3 py-2 border-b border-blue-700">
                    <p className="text-white text-sm font-medium">{user?.email || 'User'}</p>
                  </div>

                  {/* Mobile Profile Button */}
                  <button
                    onClick={handleProfileClick}
                    className="w-full text-left px-3 py-2 text-white hover:bg-blue-700 rounded-lg transition flex items-center gap-2"
                  >
                    <User size={18} />
                    <span>My Profile</span>
                  </button>

                  {/* Mobile Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-white hover:bg-red-600 rounded-lg transition flex items-center gap-2"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Mobile Login/Register */}
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-white hover:bg-blue-700 rounded-lg transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 text-white hover:bg-blue-700 rounded-lg transition"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
