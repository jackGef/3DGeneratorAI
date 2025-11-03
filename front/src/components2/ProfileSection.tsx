import React, { useState, useRef, useEffect } from "react";
import { Settings, Palette, User as UserIcon, LogOut } from "lucide-react";
import { Button } from "../components/ui/button";
import { User } from "../entities/User";

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

  return (
    <div className="profile">
      <div className="profile__avatar">
        {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
      </div>
      <div className="profile__info">
        <div className="profile__name">{user?.full_name || "User"}</div>
        <div className="profile__status">{user?.email}</div>
      </div>
    </div>
  );
}