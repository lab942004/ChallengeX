import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ROUTES } from '../constants';

import { AuthLayout } from '../layouts/AuthLayout';
import { GateLayout } from '../layouts/GateLayout';
import { AppLayout } from '../layouts/AppLayout';
import { ErrorLayout } from '../layouts/ErrorLayout';

import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';

import { GatePage } from '../pages/app/GatePage';
import { PathsPage } from '../pages/app/PathsPage';
import { IdeaPage } from '../pages/app/IdeaPage';
import { TrialPage } from '../pages/app/TrialPage';
import { VerdictPage } from '../pages/app/VerdictPage';
import { GeneratePage } from '../pages/app/GeneratePage';
import { RoadmapPage } from '../pages/app/RoadmapPage';
import { HistoryPage } from '../pages/app/HistoryPage';
import { DashboardPage } from '../pages/app/DashboardPage';
import { ProfilePage } from '../pages/app/ProfilePage';
import { NotificationsPage } from '../pages/app/NotificationsPage';

import { NotFoundPage } from '../pages/errors/NotFoundPage';
import { ForbiddenPage } from '../pages/errors/ForbiddenPage';
import { ServerErrorPage } from '../pages/errors/ServerErrorPage';
import { NetworkErrorPage } from '../pages/errors/NetworkErrorPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ── */}
        <Route path={ROUTES.home} element={<LandingPage />} />

        {/* ── Guest-only auth pages ── */}
        <Route
          element={
            <PublicRoute>
              <AuthLayout />
            </PublicRoute>
          }
        >
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route path={ROUTES.signup} element={<SignupPage />} />
          <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
          <Route path={ROUTES.resetPassword} element={<ResetPasswordPage />} />
        </Route>

        {/* ── Cinematic gate (protected) ── */}
        <Route
          path={ROUTES.gate}
          element={
            <ProtectedRoute>
              <GateLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<GatePage />} />
        </Route>

        {/* ── Authenticated application ── */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.paths} element={<PathsPage />} />
          <Route path={ROUTES.idea} element={<IdeaPage />} />
          <Route path={`${ROUTES.trial}/:trialId`} element={<TrialPage />} />
          <Route path={`${ROUTES.verdict}/:trialId`} element={<VerdictPage />} />
          <Route path={ROUTES.generate} element={<GeneratePage />} />
          <Route path={`${ROUTES.roadmap}/:trialId`} element={<RoadmapPage />} />
          <Route path={ROUTES.history} element={<HistoryPage />} />
          <Route path={ROUTES.dashboard} element={<DashboardPage />} />
          <Route path={ROUTES.profile} element={<ProfilePage />} />
          <Route path={ROUTES.notifications} element={<NotificationsPage />} />
        </Route>

        {/* ── Themed error pages ── */}
        <Route element={<ErrorLayout />}>
          <Route path="/401" element={<ForbiddenPage />} />
          <Route path="/500" element={<ServerErrorPage />} />
          <Route path="/network" element={<NetworkErrorPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
