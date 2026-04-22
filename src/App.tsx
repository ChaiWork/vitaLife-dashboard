/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { testFirestoreConnection } from './lib/firebase';

// Components
import { LoginPage } from './components/Auth/LoginPage';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { DashboardMain } from './components/dashboard/DashboardMain';

// Hooks
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    testFirestoreConnection();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-minimal-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-minimal-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-minimal-blue">Initializing Core Bio-Stream...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <ErrorBoundary>
      <DashboardMain user={user} profile={profile} />
    </ErrorBoundary>
  );
}
