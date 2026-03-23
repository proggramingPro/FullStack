import { Search, Menu, User, LogOut, CircleUser as UserCircle, Shield } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import HostModal from './HostModal';

interface HeaderProps {
  onSearchClick: () => void;
  onProfileClick?: () => void;
  onAdminClick?: () => void;
}

export default function Header({ onSearchClick, onProfileClick, onAdminClick }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showHostModal, setShowHostModal] = useState(false);

  const isAdmin = user?.email === import.meta.env.VITE_ADMIN_EMAIL;

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 hidden sm:block">HOR</h1>
            </div>

            <button
              onClick={onSearchClick}
              className="flex-1 max-w-md mx-4 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full border border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Search Place...</span>
                <Search className="w-4 h-4 text-gray-400" />
              </div>
            </button>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => user ? setShowHostModal(true) : setShowAuthModal(true)}
                className="hidden md:block text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Become a Host
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div className="relative">
                <button
                  onClick={() => user ? setShowUserMenu(!showUserMenu) : setShowAuthModal(true)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <User className="w-5 h-5 text-gray-600" />
                </button>
                {showUserMenu && user && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onProfileClick?.();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <UserCircle className="w-4 h-4" />
                      <span>My Profile</span>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onAdminClick?.();
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showHostModal && <HostModal onClose={() => setShowHostModal(false)} />}
    </>
  );
}
