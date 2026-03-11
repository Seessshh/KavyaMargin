import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, UserCircle, Menu, LogOut, Settings, User, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const Navbar = ({ onMenuClick }) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const userRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userRef.current && !userRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const notifications = [
    { id: 1, title: 'Margin Alert', message: 'Project Alpha margin dropped below 15%', time: '2m ago', read: false },
    { id: 2, title: 'New Contract', message: 'SLA analysis ready for review', time: '1h ago', read: false },
    { id: 3, title: 'System Update', message: 'KavyaMargin v4.2 now live', time: '5h ago', read: true },
  ];

  const handleSignOut = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  return (
    <header className="h-16 bg-slate-950 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
      <div className="flex items-center gap-2 md:gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-slate-800 rounded-lg lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5 text-slate-400" />
        </button>
        
        <form onSubmit={handleSearch} className="relative group hidden md:block">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search analytics, projects..."
            className="pl-10 pr-10 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm w-64 lg:w-80 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-slate-200 transition-all"
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </form>

        {/* Mobile Search Icon */}
        <button className="p-2 md:hidden hover:bg-slate-800 rounded-lg transition-colors text-slate-400">
          <Search className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-1 md:gap-3">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 hover:bg-slate-800 rounded-lg text-slate-400 relative transition-colors ${showNotifications ? 'bg-slate-800' : ''}`}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950 shadow-sm" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 md:w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 p-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-slate-100 text-sm">Notifications</h3>
                <button className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:underline">Mark all as read</button>
              </div>
              <div className="max-h-80 overflow-y-auto py-2 scrollbar-hide">
                {notifications.map(notif => (
                  <div key={notif.id} className="p-3 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start">
                      <p className={`text-xs font-bold ${notif.read ? 'text-slate-400' : 'text-slate-100'}`}>{notif.title}</p>
                      <span className="text-[10px] text-slate-500 font-medium">{notif.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{notif.message}</p>
                  </div>
                ))}
              </div>
              <button className="w-full mt-2 py-2 text-center text-xs font-bold text-slate-400 hover:bg-slate-800 rounded-lg transition-colors">
                View All Notifications
              </button>
            </div>
          )}
        </div>
        
        <div className="h-8 w-[1px] bg-slate-800 mx-1 md:mx-2" />
        
        {/* User Dropdown */}
        <div className="relative" ref={userRef}>
          <button 
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className={`flex items-center gap-2 md:gap-3 pl-2 pr-1 py-1 hover:bg-slate-800 rounded-full transition-colors group ${showUserDropdown ? 'bg-slate-800' : ''}`}
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-100 leading-none">{currentUser?.fullName || 'Guest User'}</p>
              <p className="text-[10px] text-slate-500 mt-1 font-black uppercase tracking-widest">{currentUser?.role || 'User'}</p>
            </div>
            <div className="w-8 h-8 md:w-9 md:h-9 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center font-black text-xs md:text-sm border-2 border-blue-500/20 group-hover:border-blue-500/50 transition-all">
              {getInitials(currentUser?.fullName)}
            </div>
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 p-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-3 mb-2 bg-slate-800/50 rounded-xl">
                <p className="text-xs font-bold text-slate-100">{currentUser?.fullName || 'Guest User'}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{currentUser?.email || 'guest@kavyamargin.com'}</p>
              </div>
              <div className="space-y-1">
                <Link to="/settings" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-blue-400 rounded-lg transition-colors group font-bold">
                  <User className="w-4 h-4 text-slate-500 group-hover:text-blue-500" />
                  My Profile
                </Link>
                <Link to="/settings" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-blue-400 rounded-lg transition-colors group font-bold">
                  <Settings className="w-4 h-4 text-slate-500 group-hover:text-blue-500" />
                  Account Settings
                </Link>
                <div className="h-[1px] bg-slate-800 my-1 mx-2" />
                <button 
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors w-full group font-bold"
                >
                  <LogOut className="w-4 h-4 text-rose-400 group-hover:text-rose-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
