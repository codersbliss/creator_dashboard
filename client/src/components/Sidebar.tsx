import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Bookmark, User, Users, BarChart2, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { logout, isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home className="h-5 w-5" /> },
    { name: 'Feed', path: '/feed', icon: <LayoutGrid className="h-5 w-5" /> },
    { name: 'Saved', path: '/saved', icon: <Bookmark className="h-5 w-5" /> },
    { name: 'Profile', path: '/profile', icon: <User className="h-5 w-5" /> },
  ];
  
  const adminNavItems = [
    { name: 'Admin Dashboard', path: '/admin/dashboard', icon: <BarChart2 className="h-5 w-5" /> },
    { name: 'Manage Users', path: '/admin/users', icon: <Users className="h-5 w-5" /> },
  ];
  
  const handleLogout = () => {
    logout();
  };
  
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };
  
  return (
    <div className={`flex flex-col bg-gray-800 text-white transition-all duration-300 ease-in-out ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
        {!collapsed && (
          <span className="text-xl font-bold tracking-wider">Creator Hub</span>
        )}
        <button
          onClick={toggleCollapse}
          className={`p-1 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 ${collapsed ? 'mx-auto' : ''}`}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <nav className="mt-5 px-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `group flex items-center px-2 py-3 text-sm font-medium rounded-md ${
                    isActive 
                      ? 'bg-gray-900 text-blue-400' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } transition-all duration-200 ${
                    collapsed ? 'justify-center' : ''
                  }`
                }
              >
                <div className={`${collapsed ? '' : 'mr-3'}`}>{item.icon}</div>
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            ))}
          </div>
          
          {isAdmin && (
            <>
              <div className={`mt-10 ${collapsed ? 'px-2' : 'px-3'}`}>
                <h3 className={`text-xs font-semibold text-gray-400 uppercase tracking-wider ${collapsed ? 'text-center' : ''}`}>
                  {collapsed ? 'Admin' : 'Administration'}
                </h3>
                <div className="mt-2 space-y-1">
                  {adminNavItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) => 
                        `group flex items-center px-2 py-3 text-sm font-medium rounded-md ${
                          isActive 
                            ? 'bg-gray-900 text-purple-400' 
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        } transition-all duration-200 ${
                          collapsed ? 'justify-center' : ''
                        }`
                      }
                    >
                      <div className={`${collapsed ? '' : 'mr-3'}`}>{item.icon}</div>
                      {!collapsed && <span>{item.name}</span>}
                    </NavLink>
                  ))}
                </div>
              </div>
            </>
          )}
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className={`flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white w-full ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className={`h-5 w-5 ${collapsed ? '' : 'mr-3'}`} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;