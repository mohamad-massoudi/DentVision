"use client";

import { useState } from "react";
import { rolePermissions, type AuthSession, type Role } from "@/lib/auth";
import { useSession } from "@/lib/useSession";
import AnalysisView from "./AnalysisView";
import Layout, { type DashboardView } from "./Layout";
import PatientPortalView from "./PatientPortalView";
import PatientsView from "./PatientsView";
import SettingsView from "./SettingsView";
import SummaryView from "./SummaryView";
import UploadView from "./UploadView";
import ClinicsView from "./ClinicsView";
import UsersView from "./UsersView";
import NotificationsView from "./NotificationsView";

const defaultView: Record<Role, DashboardView> = {
  SUPER_ADMIN: "clinics",
  DENTIST: "analysis",
  STAFF: "patients",
  PATIENT: "my-record",
};

export default function Dashboard() {
  const { session, isLoading, logout, refresh } = useSession();

  if (isLoading || !session) {
    return <div className="grid min-h-screen place-items-center bg-slate-50"><div className="text-center"><span className="mx-auto block size-8 animate-spin rounded-full border-4 border-sky-100 border-t-sky-500" /><p className="mt-4 text-sm text-slate-500">در حال آماده‌سازی داشبورد...</p></div></div>;
  }

  return <AuthenticatedDashboard key={session.user.role} session={session} onLogout={logout} onRefresh={refresh} />;
}

function AuthenticatedDashboard({ session, onLogout, onRefresh }: { session: AuthSession; onLogout: () => Promise<void>; onRefresh: () => Promise<void> }) {
  const [activeView, setActiveView] = useState<DashboardView>(defaultView[session.user.role]);
  const allowedViews = rolePermissions[session.user.role] as DashboardView[];
  const safeView = allowedViews.includes(activeView)
    ? activeView
    : defaultView[session.user.role];

  const views: Record<DashboardView, React.ReactNode> = {
    analysis: <AnalysisView />,
    patients: <PatientsView />,
    records: <SummaryView />,
    upload: <UploadView />,
    "my-record": <PatientPortalView mode="record" user={session.user} />,
    reports: <PatientPortalView mode="reports" user={session.user} />,
    settings: <SettingsView user={session.user} refresh={onRefresh} />,
    clinics: <ClinicsView />,
    users: <UsersView role={session.user.role} />,
    notifications: <NotificationsView />,
  };

  return (
    <Layout
      user={session.user}
      activeView={safeView}
      onViewChange={(view) => {
        if (allowedViews.includes(view)) setActiveView(view);
      }}
      onLogout={() => void onLogout()}
    >
      {views[safeView]}
    </Layout>
  );
}
