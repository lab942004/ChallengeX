import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ADMIN_ROUTES } from '../constants';
import { AdminAuthLayout } from '../layouts/AdminAuthLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { AdminErrorLayout } from '../layouts/AdminErrorLayout';
import { AdminProtectedRoute } from './AdminProtectedRoute';
import { SuperAdminRoute } from './SuperAdminRoute';

import { AdminLoginPage } from '../pages/auth/AdminLoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { UsersPage } from '../pages/users/UsersPage';
import { UserDetailsPage } from '../pages/users/UserDetailsPage';
import { IdeasPage } from '../pages/ideas/IdeasPage';
import { IdeaDetailsPage } from '../pages/ideas/IdeaDetailsPage';
import { TrialsPage } from '../pages/trials/TrialsPage';
import { TrialDetailsPage } from '../pages/trials/TrialDetailsPage';
import { QuestionsPage } from '../pages/questions/QuestionsPage';
import { CategoriesPage } from '../pages/categories/CategoriesPage';
import { RiskRulesPage } from '../pages/risk-rules/RiskRulesPage';
import { RoadmapTemplatesPage } from '../pages/roadmaps/RoadmapTemplatesPage';
import { ExperimentsPage } from '../pages/experiments/ExperimentsPage';
import { AnalyticsPage } from '../pages/analytics/AnalyticsPage';
import { AdminUsersPage } from '../pages/admins/AdminUsersPage';
import { SettingsPage } from '../pages/settings/SettingsPage';

export function AdminRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Guest login */}
        <Route element={<AdminAuthLayout />}>
          <Route path={ADMIN_ROUTES.login} element={<AdminLoginPage />} />
        </Route>

        {/* Protected admin area */}
        <Route
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route path={ADMIN_ROUTES.dashboard} element={<DashboardPage />} />
          <Route path={ADMIN_ROUTES.users} element={<UsersPage />} />
          <Route path="/admin/users/:id" element={<UserDetailsPage />} />
          <Route path={ADMIN_ROUTES.ideas} element={<IdeasPage />} />
          <Route path="/admin/ideas/:id" element={<IdeaDetailsPage />} />
          <Route path={ADMIN_ROUTES.trials} element={<TrialsPage />} />
          <Route path="/admin/trials/:id" element={<TrialDetailsPage />} />
          <Route path={ADMIN_ROUTES.questions} element={<QuestionsPage />} />
          <Route path={ADMIN_ROUTES.categories} element={<CategoriesPage />} />
          <Route path={ADMIN_ROUTES.riskRules} element={<RiskRulesPage />} />
          <Route path={ADMIN_ROUTES.roadmaps} element={<RoadmapTemplatesPage />} />
          <Route path={ADMIN_ROUTES.experiments} element={<ExperimentsPage />} />
          <Route path={ADMIN_ROUTES.analytics} element={<AnalyticsPage />} />
          <Route
            path={ADMIN_ROUTES.admins}
            element={
              <SuperAdminRoute>
                <AdminUsersPage />
              </SuperAdminRoute>
            }
          />
          <Route
            path={ADMIN_ROUTES.settings}
            element={
              <SuperAdminRoute>
                <SettingsPage />
              </SuperAdminRoute>
            }
          />
        </Route>

        {/* Errors */}
        <Route element={<AdminErrorLayout />}>
          <Route path="/admin/404" element={<p className="admin-title text-sm text-sand-light">Page not found</p>} />
          <Route path="*" element={<Navigate to="/admin/404" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
