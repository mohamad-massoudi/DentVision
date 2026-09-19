"use client";

import { useState } from "react";
import AnalysisView from "./AnalysisView";
import Layout, { type DashboardView } from "./Layout";
import SummaryView from "./SummaryView";

export default function Dashboard() {
  const [activeView, setActiveView] = useState<DashboardView>("analysis");

  return (
    <Layout activeView={activeView} onViewChange={setActiveView}>
      {activeView === "analysis" ? <AnalysisView /> : <SummaryView />}
    </Layout>
  );
}
