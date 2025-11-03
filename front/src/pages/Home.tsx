import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import MainContent from "../components/MainContent";

// Define the type for the props
interface HomeProps {
  user: {
    id: string;
    name: string;
    email?: string;
    // Add other user properties as needed
  };
  currentTheme: string;
  changeTheme: (theme: string) => void;
}

export default function Home({ user, currentTheme, changeTheme }: HomeProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  return (
    <>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        user={user}
        currentTheme={currentTheme}
        changeTheme={changeTheme}
      />
      <MainContent 
        user={user}
        isCollapsed={isSidebarCollapsed}
        currentTheme={currentTheme}
        changeTheme={changeTheme}
      />
    </>
  );
}
