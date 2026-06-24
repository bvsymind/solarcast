"use client";

import { useState } from "react";
import {
  PanelLeftClose,
  PanelLeft,
  PanelRightClose,
  PanelRight,
  GripVertical,
  Home,
  MapPin,
  BarChart3,
  MapIcon,
  X,
} from "lucide-react";
import { Sidebar } from "./sidebar";
import { MapContainer, type MapLocation } from "./map-container";
import { ResultsPanel } from "./results-panel";
import { useDashboardStore } from "@/store";
import { useSolarDataQuery } from "@/hooks";
import { useResizable, useMediaQuery } from "@/hooks/use-resizable";
import Link from "next/link";

function ResizeHandle({
  onMouseDown,
  isDragging,
  side,
}: {
  onMouseDown: (e: React.MouseEvent) => void;
  isDragging: boolean;
  side: "left" | "right";
}) {
  return (
    <div
      className={`group relative z-20 w-3 shrink-0 cursor-col-resize transition-colors ${
        isDragging ? "bg-primary-100/60" : "hover:bg-gray-100/60"
      }`}
      onMouseDown={onMouseDown}
    >
      <div
        className={`absolute top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 ${
          isDragging ? "opacity-100" : ""
        } ${side === "left" ? "-right-0.5" : "-left-0.5"}`}
      >
        <GripVertical className="h-5 w-3 text-gray-400" />
      </div>
      {isDragging && (
        <div className="pointer-events-none fixed inset-0 z-50" />
      )}
    </div>
  );
}

function MobileSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white shadow-soft transition-transform duration-300 ease-out md:hidden ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "85vh" }}
      >
        {/* Handle + title */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <div className="mx-auto h-1 w-10 rounded-full bg-gray-300" />
        </div>
        <div className="flex items-center justify-between px-5 pb-3">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(85vh - 60px)" }}>
          {children}
        </div>
      </div>
    </>
  );
}

function MobileTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: "map" | "location" | "results";
  onTabChange: (tab: "map" | "location" | "results") => void;
}) {
  const tabs = [
    { id: "map" as const, icon: MapIcon, label: "Map" },
    { id: "location" as const, icon: MapPin, label: "Location" },
    { id: "results" as const, icon: BarChart3, label: "Results" },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 flex border-t border-gray-200 bg-white/90 backdrop-blur-glass md:hidden safe-bottom">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
            activeTab === tab.id
              ? "text-primary-500"
              : "text-gray-400"
          }`}
        >
          <tab.icon className="h-5 w-5" />
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function DashboardShell() {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [mobileTab, setMobileTab] = useState<"map" | "location" | "results">("map");

  const isMobile = useMediaQuery("(max-width: 767px)");

  const leftResize = useResizable({
    defaultWidth: 320,
    minWidth: 240,
    maxWidth: 480,
    storageKey: "solarcast:sidebarWidth",
  });

  const rightResize = useResizable({
    defaultWidth: 320,
    minWidth: 280,
    maxWidth: 600,
    storageKey: "solarcast:resultsWidth",
    invert: true,
  });

  const selectedLocation = useDashboardStore((s) => s.selectedLocation);
  const setSelectedLocation = useDashboardStore((s) => s.setSelectedLocation);

  useSolarDataQuery();

  const handleLocationSelect = (loc: MapLocation) => {
    setSelectedLocation(loc);
    if (isMobile) setMobileTab("results");
  };

  const leftWidth = leftResize.width;
  const rightWidth = rightResize.width;

  /* ─── Mobile Layout ─── */
  if (isMobile) {
    return (
      <div className="relative h-screen overflow-hidden">
        {/* Map full screen */}
        <MapContainer
          onLocationSelect={handleLocationSelect}
          selectedLocation={selectedLocation}
          isMobile
        />

        {/* Home button */}
        <Link
          href="/"
          className="absolute top-4 left-4 z-30 rounded-xl border border-gray-200 bg-white/90 p-2 text-gray-500 shadow-card backdrop-blur-sm transition-all hover:text-primary-500"
          aria-label="Back to home"
        >
          <Home className="h-4 w-4" />
        </Link>

        {/* Location Sheet */}
        <MobileSheet
          open={mobileTab === "location"}
          onClose={() => setMobileTab("map")}
          title="Location"
        >
          <div className="px-4 pb-6">
            <Sidebar
              collapsed={false}
              selectedLocation={selectedLocation}
              onLocationSelect={handleLocationSelect}
              width={1000} // full width — Sidebar uses this only for desktop
              isMobile
            />
          </div>
        </MobileSheet>

        {/* Results Sheet */}
        <MobileSheet
          open={mobileTab === "results"}
          onClose={() => setMobileTab("map")}
          title="Analysis Results"
        >
          <div className="px-4 pb-6">
            <ResultsPanel collapsed={false} width={1000} isMobile />
          </div>
        </MobileSheet>

        {/* Bottom Tab Bar */}
        <MobileTabBar activeTab={mobileTab} onTabChange={setMobileTab} />
      </div>
    );
  }

  /* ─── Desktop Layout ─── */
  return (
    <div className="relative flex h-screen overflow-hidden">
      {/* ── Left panel toggle buttons ── */}
      {leftCollapsed && (
        <button
          onClick={() => setLeftCollapsed(false)}
          className="absolute top-4 left-4 z-30 rounded-xl border border-gray-200 bg-white p-2 text-gray-500 shadow-card transition-all hover:text-primary-500"
          aria-label="Open sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
      )}

      {!leftCollapsed && (
        <button
          onClick={() => setLeftCollapsed(true)}
          className="absolute top-4 z-30 rounded-xl border border-gray-200 bg-white p-2 text-gray-400 shadow-card transition-all hover:text-gray-600"
          style={{ left: leftWidth + 4 }}
          aria-label="Close sidebar"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      )}

      {/* ── Left Sidebar ── */}
      <Sidebar
        collapsed={leftCollapsed}
        selectedLocation={selectedLocation}
        onLocationSelect={handleLocationSelect}
        width={leftWidth}
      />

      {/* ── Left resize handle ── */}
      {!leftCollapsed && (
        <ResizeHandle
          onMouseDown={leftResize.onMouseDown}
          isDragging={leftResize.isDragging}
          side="left"
        />
      )}

      {/* ── Home button ── */}
      <Link
        href="/"
        className="absolute top-4 z-30 rounded-xl border border-gray-200 bg-white p-2 text-gray-400 shadow-card transition-all hover:border-primary-200 hover:text-primary-500"
        style={{ left: leftCollapsed ? 52 : leftWidth + 44 }}
        aria-label="Back to home"
      >
        <Home className="h-4 w-4" />
      </Link>

      {/* ── Center Map ── */}
      <MapContainer
        onLocationSelect={handleLocationSelect}
        selectedLocation={selectedLocation}
      />

      {/* ── Right resize handle ── */}
      {!rightCollapsed && (
        <ResizeHandle
          onMouseDown={rightResize.onMouseDown}
          isDragging={rightResize.isDragging}
          side="right"
        />
      )}

      {/* ── Right panel toggle buttons ── */}
      {rightCollapsed && (
        <button
          onClick={() => setRightCollapsed(false)}
          className="absolute top-4 right-4 z-30 rounded-xl border border-gray-200 bg-white p-2 text-gray-500 shadow-card transition-all hover:text-primary-500"
          aria-label="Open results"
        >
          <PanelRight className="h-4 w-4" />
        </button>
      )}

      {!rightCollapsed && (
        <button
          onClick={() => setRightCollapsed(true)}
          className="absolute top-4 z-30 rounded-xl border border-gray-200 bg-white p-2 text-gray-400 shadow-card transition-all hover:text-gray-600"
          style={{ right: rightWidth + 4 }}
          aria-label="Close results"
        >
          <PanelRightClose className="h-4 w-4" />
        </button>
      )}

      {/* ── Right Results Panel ── */}
      <ResultsPanel collapsed={rightCollapsed} width={rightWidth} />
    </div>
  );
}
