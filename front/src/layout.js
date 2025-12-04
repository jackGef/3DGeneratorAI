import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";

const themes = {
  dark: {
    '--bg-primary': '#212121',
    '--bg-secondary': '#2f2f2f',
    '--bg-tertiary': '#404040',
    '--text-primary': '#ffffff',
    '--text-secondary': '#b3b3b3',
    '--text-muted': '#8e8e8e',
    '--accent-primary': '#10a37f',
    '--accent-secondary': '#1a7f64',
    '--border-color': '#4d4d4d',
    '--hover-color': 'rgba(255, 255, 255, 0.1)',
    '--shadow': '0 4px 6px rgba(0, 0, 0, 0.3)'
  },
  light: {
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f7f7f8',
    '--bg-tertiary': '#ececec',
    '--text-primary': '#2d3748',
    '--text-secondary': '#4a5568',
    '--text-muted': '#718096',
    '--accent-primary': '#10a37f',
    '--accent-secondary': '#0d8c73',
    '--border-color': '#e2e8f0',
    '--hover-color': 'rgba(0, 0, 0, 0.05)',
    '--shadow': '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  blue: {
    '--bg-primary': '#1a202c',
    '--bg-secondary': '#2d3748',
    '--bg-tertiary': '#4a5568',
    '--text-primary': '#ffffff',
    '--text-secondary': '#cbd5e0',
    '--text-muted': '#a0aec0',
    '--accent-primary': '#3182ce',
    '--accent-secondary': '#2b77cb',
    '--border-color': '#4a5568',
    '--hover-color': 'rgba(255, 255, 255, 0.1)',
    '--shadow': '0 4px 6px rgba(0, 0, 0, 0.3)'
  }
};

export default function Layout({ children, currentPageName }) {
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (error) {
        console.log("User not logged in");
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setCurrentTheme(savedTheme);
  }, []);

  const changeTheme = (theme) => {
    setCurrentTheme(theme);
    localStorage.setItem('theme', theme);
  };

  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={themes[currentTheme]}
    >
      <style>{`
        :root {
          ${Object.entries(themes[currentTheme]).map(([key, value]) => `${key}: ${value};`).join('\n          ')}
        }
        
        .theme-bg-primary { background-color: var(--bg-primary); }
        .theme-bg-secondary { background-color: var(--bg-secondary); }
        .theme-bg-tertiary { background-color: var(--bg-tertiary); }
        .theme-text-primary { color: var(--text-primary); }
        .theme-text-secondary { color: var(--text-secondary); }
        .theme-text-muted { color: var(--text-muted); }
        .theme-accent { color: var(--accent-primary); }
        .theme-accent-bg { background-color: var(--accent-primary); }
        .theme-border { border-color: var(--border-color); }
        .theme-hover:hover { background-color: var(--hover-color); }
        .theme-shadow { box-shadow: var(--shadow); }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: var(--text-muted);
        }
      `}</style>
      <div className="flex h-screen theme-bg-primary">
        {React.cloneElement(children, { user, currentTheme, changeTheme })}
      </div>
    </div>
  );
}