import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppLayout } from './components/layout/AppLayout';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AITutorPage } from './pages/AITutorPage';
import { NotesStudioPage } from './pages/NotesStudioPage';
import { DocumentDetailPage } from './pages/DocumentDetailPage';
import { QuizArenaPage } from './pages/QuizArenaPage';
import { QuizTakePage } from './pages/QuizTakePage';
import { QuizResultsPage } from './pages/QuizResultsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ConceptMapPage } from './pages/ConceptMapPage';
import { StudyPlannerPage } from './pages/StudyPlannerPage';
import { FlashcardsPage } from './pages/FlashcardsPage';
import { MemoryPreferencesPage } from './pages/MemoryPreferencesPage';
import { SharedKnowledgePage } from './pages/SharedKnowledgePage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-xs">
        Loading learner profile...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Application Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tutor" element={<AITutorPage />} />
            <Route path="/notes" element={<NotesStudioPage />} />
            <Route path="/notes/:id" element={<DocumentDetailPage />} />
            <Route path="/quizzes" element={<QuizArenaPage />} />
            <Route path="/quizzes/take/:id" element={<QuizTakePage />} />
            <Route path="/quizzes/results/:id" element={<QuizResultsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/concept-maps" element={<ConceptMapPage />} />
            <Route path="/study-planner" element={<StudyPlannerPage />} />
            <Route path="/flashcards" element={<FlashcardsPage />} />
            <Route path="/memory" element={<MemoryPreferencesPage />} />
            <Route path="/shared-knowledge" element={<SharedKnowledgePage />} />
            <Route path="/settings" element={<ProfileSettingsPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
