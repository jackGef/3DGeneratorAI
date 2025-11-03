import React, { useState, useRef, useEffect } from "react";
import { Settings, Palette, User as UserIcon, LogOut } from "lucide-react";
import { Button } from "../components/ui/button";
import { User } from "/entities/User";

export default function ProfileSection({ user, isCollapsed, currentTheme, changeTheme }) {
  const [showSettings, setShowSettings] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await User.logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const themes = [
    { name: 'Dark', value: 'dark', color: '#2f2f2f' },
    { name: 'Light', value: 'light', color: '#ffffff' },
    { name: 'Blue', value: 'blue', color: '#2d3748' }
  ];

  if (isCollapsed) {
    return (
      <div className="p-2 relative" ref={dropdownRef}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSettings(!showSettings)}
          className="w-full theme-hover theme-text-secondary hover:theme-text-primary transition-colors"
        >
          <UserIcon className="w-5 h-5" />
        </Button>
        
        {showSettings && (
          <div className="absolute bottom-full left-16 mb-2 theme-bg-secondary theme-border border rounded-lg theme-shadow z-50 min-w-48">
            <div className="p-3 border-b theme-border">
              <p className="font-medium theme-text-primary text-sm">
                {user?.full_name || "User"}
              </p>
              <p className="theme-text-muted text-xs">{user?.email}</p>
            </div>
            
            <div className="p-2">
              <div className="mb-2">
                <p className="theme-text-secondary text-xs font-medium mb-2 px-2">Theme</p>
                <div className="space-y-1">
                  {themes.map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => changeTheme(theme.value)}
                      className={`w-full text-left px-2 py-1.5 rounded theme-hover theme-text-secondary text-xs flex items-center gap-2 ${
                        currentTheme === theme.value ? 'theme-accent' : ''
                      }`}
                    >
                      <div 
                        className="w-3 h-3 rounded-full border theme-border"
                        style={{ backgroundColor: theme.color }}
                      ></div>
                      {theme.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full text-left px-2 py-1.5 rounded theme-hover theme-text-secondary text-xs flex items-center gap-2"
              >
                <LogOut className="w-3 h-3" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 relative" ref={dropdownRef}>
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="w-full flex items-center gap-3 p-3 theme-hover rounded-lg transition-all duration-200 group"
      >
        <div className="w-8 h-8 rounded-full theme-accent-bg flex items-center justify-center text-white font-semibold text-sm">
          {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="font-medium theme-text-primary text-sm truncate">
            {user?.full_name || "User"}
          </p>
          <p className="theme-text-muted text-xs truncate">{user?.email}</p>
        </div>
        <Settings className="w-4 h-4 theme-text-muted group-hover:theme-text-primary transition-colors" />
      </button>

      {showSettings && (
        <div className="absolute bottom-full left-4 right-4 mb-2 theme-bg-secondary theme-border border rounded-lg theme-shadow z-50">
          <div className="p-4">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4 theme-text-primary" />
                <span className="font-medium theme-text-primary text-sm">Choose Theme</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {themes.map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => changeTheme(theme.value)}
                    className={`p-2 rounded-lg border transition-all duration-200 ${
                      currentTheme === theme.value 
                        ? 'theme-accent-bg text-white border-transparent' 
                        : 'theme-border theme-hover theme-text-secondary'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: theme.color }}
                      ></div>
                      <span className="text-xs">{theme.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 p-2 theme-hover rounded-lg theme-text-secondary hover:theme-text-primary transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}