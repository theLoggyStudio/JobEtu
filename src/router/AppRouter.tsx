import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@constants/variable.constant';
import { MainLayout } from '../layouts/MainLayout';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { EntrepriseDashboardPage } from '../pages/entreprise/EntrepriseDashboardPage';
import { EtudiantDashboardPage } from '../pages/etudiant/EtudiantDashboardPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminQuestionnairesPage } from '../pages/admin/AdminQuestionnairesPage';
import { AdminMatchesPage } from '../pages/admin/AdminMatchesPage';
import { AdminSubmissionsPage } from '../pages/admin/AdminSubmissionsPage';
import { PaiementSoumissionPage } from '../pages/paiement/PaiementSoumissionPage';
import { QuestionnaireFlowPage } from '../pages/questionnaire/QuestionnaireFlowPage';
import { EntrepriseMatchesPage, EtudiantMatchesPage } from '../pages/matches/MyMatchesHubPage';
import { ProtectedRoute } from './ProtectedRoute';
import { AccountPage } from '../pages/account/AccountPage';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={ROUTE_PATHS.home} element={<HomePage />} />
        <Route path={ROUTE_PATHS.login} element={<LoginPage />} />
        <Route path={ROUTE_PATHS.register} element={<RegisterPage />} />
        <Route
          path={ROUTE_PATHS.account}
          element={
            <ProtectedRoute roles={['admin', 'entreprise', 'etudiant', 'particulier']}>
              <AccountPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTE_PATHS.entrepriseDashboard}
          element={
            <ProtectedRoute roles={['entreprise']}>
              <EntrepriseDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTE_PATHS.entrepriseMatches}
          element={
            <ProtectedRoute roles={['entreprise']}>
              <EntrepriseMatchesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTE_PATHS.entrepriseMatchChat}
          element={
            <ProtectedRoute roles={['entreprise']}>
              <EntrepriseMatchesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTE_PATHS.etudiantDashboard}
          element={
            <ProtectedRoute roles={['etudiant', 'particulier']}>
              <EtudiantDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTE_PATHS.etudiantMatches}
          element={
            <ProtectedRoute roles={['etudiant', 'particulier']}>
              <EtudiantMatchesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTE_PATHS.etudiantMatchChat}
          element={
            <ProtectedRoute roles={['etudiant', 'particulier']}>
              <EtudiantMatchesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTE_PATHS.adminDashboard}
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTE_PATHS.adminQuestionnaires}
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminQuestionnairesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTE_PATHS.adminSubmissions}
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminSubmissionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTE_PATHS.adminMatches}
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminMatchesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTE_PATHS.paiementSoumission}
          element={
            <ProtectedRoute roles={['entreprise', 'etudiant', 'particulier']}>
              <PaiementSoumissionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTE_PATHS.questionnaireEntreprise}
          element={
            <ProtectedRoute roles={['entreprise']}>
              <QuestionnaireFlowPage userType="entreprise" />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTE_PATHS.questionnaireEtudiant}
          element={
            <ProtectedRoute roles={['etudiant', 'particulier']}>
              <QuestionnaireFlowPage userType="etudiant" />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={ROUTE_PATHS.home} replace />} />
      </Route>
    </Routes>
  );
}
