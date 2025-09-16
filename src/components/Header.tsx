import React from 'react';
import { User as UserIcon, ChevronDown, Menu, Moon, Sun } from 'lucide-react';
import { User, UserRole } from '../types';
import { Theme } from '../hooks/useTheme';

interface HeaderProps {
  user: User;
  onRoleChange: (role: UserRole) => void;
  onMenuToggle: () => void;
  theme: Theme;
  onThemeToggle: () => void;
}

const roleLabels: Record<UserRole, string> = {
  client: 'Client',
  okw: 'OKW Team',
  cdd: 'CDD Team',
};

const Header: React.FC<HeaderProps> = ({ user, onRoleChange, onMenuToggle, theme, onThemeToggle }) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ClientFlow</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Account Management Workflow</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={onThemeToggle}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
          
          {/* Menu Toggle */}
          <button
            onClick={onMenuToggle}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          
          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-4 py-2 transition-colors"
            >
              <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{roleLabels[user.role]}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Switch Role</p>
                </div>
                {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      onRoleChange(role);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      user.role === role 
                        ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {roleLabels[role]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;