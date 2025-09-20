import React, { useState } from "react";
import ModernSidebar from "./ModernSidebar";
import ModernTopbar from "./ModernTopbar";
import ModernDashboard from "../Dashboard/ModernDashboard";
import SettingsSection from "../Settings/SettingsSection";
import Navbar from "./Navbar"; // agar old navbar bhi use karna ho to

interface ModernLayoutProps {
  defaultSection?: string;
}

const ModernLayout: React.FC<ModernLayoutProps> = ({ defaultSection = "dashboard" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(defaultSection);

  // yaha tu sections add kar sakta hai jaise dashboard, reports, settings etc.
  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <ModernDashboard setActiveSection={setActiveSection} />;
      case "reports":
        return <div className="p-6">Reports Page 🚀</div>;
      case "settings":
        return <SettingsSection />;
      default:
        return <div className="p-6">Coming soon...</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <ModernSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <ModernTopbar
          setSidebarOpen={setSidebarOpen}
          setActiveSection={setActiveSection}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default ModernLayout;
