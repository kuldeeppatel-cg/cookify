import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CookNow from './pages/CookNow';
import RecipeDetail from './pages/RecipeDetail';
import Collections from './pages/Collections';
import { RecipeProvider } from './context/RecipeContext';

// Custom PrivateRoute component
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbarPaths = ['/login', '/signup'];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      {children}
    </>
  );
};

function App() {
  return (
    <RecipeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/cook-now"
              element={
                <PrivateRoute>
                  <CookNow />
                </PrivateRoute>
              }
            />
            <Route
              path="/recipe/:id"
              element={
                <PrivateRoute>
                  <RecipeDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/saved"
              element={
                <PrivateRoute>
                  <Collections />
                </PrivateRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <PrivateRoute>
                  <Collections />
                </PrivateRoute>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </RecipeProvider>
  );
}

export default App;
