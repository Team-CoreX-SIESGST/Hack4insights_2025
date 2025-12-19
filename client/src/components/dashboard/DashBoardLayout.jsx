"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { Bell, Search, Filter, Database } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const DashboardLayout = ({
  children,
  activeSection,
  onSectionChange,
  dataRange,
  setDataRange,
  rangeOptions,
  totalRecords,
  getCurrentRangeDisplay,
  isLoading,
}) => {
  const { user } = useAuth();

  // Get user initials from name
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleRangeSelect = (option) => {
    if (setDataRange) {
      setDataRange(option.value.start, option.value.end);
    }
  };

  const rangeDisplay = getCurrentRangeDisplay ? getCurrentRangeDisplay() : null;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-72 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              {/* Data Range Selector - Only show for non-AI sections */}
              {rangeOptions && dataRange && activeSection !== "ask_ai" && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border">
                    <Database className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground font-medium">
                      Data Range:
                    </span>
                  </div>

                  <select
                    value={`${dataRange.start} - ${dataRange.end}`}
                    onChange={(e) => {
                      const selected = rangeOptions.find(
                        (opt) => opt.label === e.target.value
                      );
                      if (selected) handleRangeSelect(selected);
                    }}
                    disabled={isLoading}
                    className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-w-[180px]"
                  >
                    {rangeOptions.map((option) => (
                      <option key={option.label} value={option.label}>
                        {option.label}{" "}
                        {option.label === "0 - 500" ? "(Default)" : ""}
                      </option>
                    ))}
                  </select>

                  {rangeDisplay && (
                    <div className="text-xs text-muted-foreground bg-secondary/50 px-3 py-2 rounded-lg">
                      <Filter className="w-3 h-3 inline mr-1" />
                      Showing {rangeDisplay.current} of {rangeDisplay.total}{" "}
                      {rangeDisplay.label}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
              </button>

              <div className="flex items-center gap-3 pl-4 border-l border-border">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-sm font-medium text-primary-foreground">
                  {user ? getInitials(user.name) : "U"}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-foreground">
                    {user?.name || "Guest User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email || "guest@example.com"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
