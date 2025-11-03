import React, { useState } from "react";
import Sidebar from "../components2/Sidebar";
import MainContent from "../components2/MainContent";
import "../../pages-css/home.css";

interface HomeProps {
  user: {
    id: string;
    name: string;
    email?: string;
  };
  currentTheme: string;
  changeTheme: (theme: string) => void;
}

export default function Home({ user, currentTheme, changeTheme }: HomeProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  return (
    <div className="main-layout">
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        user={user}
        currentTheme={currentTheme}
        changeTheme={changeTheme}
      />
      <div className="main-content">
        <MainContent user={user} />
      </div>
    </div>
  );
}