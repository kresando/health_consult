import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Users, BookOpen, LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      to: '/consultation',
      icon: MessageSquare,
      label: 'AI Chat',
    },
    {
      to: '/global-chat',
      icon: Users,
      label: 'Global Chat',
    },
    {
      to: '/articles',
      icon: BookOpen,
      label: 'Articles',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/50 backdrop-blur-lg border-t border-border sm:top-0 sm:bottom-auto z-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - visible only on desktop */}
          <Link to="/" className="hidden sm:flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-xl font-bold text-primary"
            >
              Health Consultation
            </motion.div>
          </Link>

          {/* Navigation Items */}
          <div className="flex-1 flex justify-around sm:justify-center sm:flex-initial sm:gap-8">
            {navItems.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-3 py-2 text-sm transition-colors ${
                  isActive(to)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
                <span className="text-xs sm:text-sm">{label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu - visible only on desktop */}
          <div className="hidden sm:flex items-center gap-4">
            {user && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-primary-foreground" />
                    )}
                  </div>
                  <span className="text-sm font-medium">
                    {user.displayName || 'User'}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
