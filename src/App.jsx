import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Consultation from './pages/Consultation';
import Articles from './pages/Articles';
import GlobalChat from './pages/GlobalChat';

// Protected Route component
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen w-screen overflow-x-hidden">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <Layout>
                <Home />
              </Layout>
            } />
            <Route path="/consultation" element={
              <ProtectedRoute>
                <Layout>
                  <Consultation />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/global-chat" element={
              <Layout>
                <GlobalChat />
              </Layout>
            } />
            <Route path="/articles" element={
              <Layout>
                <Articles />
              </Layout>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
