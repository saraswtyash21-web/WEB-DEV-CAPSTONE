import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import BooksPage from './pages/BooksPage';
import LoansPage from './pages/LoansPage';
import ReportsPage from './pages/ReportsPage';
import TeamPage from './pages/TeamPage';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter><AuthProvider><Routes>
  <Route path="/login" element={<AuthPage />} />
  <Route path="/register" element={<AuthPage mode="register" />} />
  <Route element={<ProtectedRoute />}><Route element={<Layout />}>
    <Route index element={<HomePage />} />
    <Route path="books" element={<BooksPage />} />
    <Route path="loans" element={<LoansPage />} />
    <Route element={<ProtectedRoute roles={['librarian', 'admin']} />}><Route path="reports" element={<ReportsPage />} /></Route>
    <Route element={<ProtectedRoute roles={['admin']} />}><Route path="team" element={<TeamPage />} /></Route>
  </Route></Route>
  <Route path="*" element={<AuthPage />} />
</Routes></AuthProvider></BrowserRouter></React.StrictMode>);
