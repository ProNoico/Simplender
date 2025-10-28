import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';

import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoadingSpinner from './components/shared/LoadingSpinner';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const Sales = lazy(() => import('./pages/Sales'));
const Customers = lazy(() => import('./pages/Customers'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Profile = lazy(() => import('./pages/Profile'));
const Expenses = lazy(() => import('./pages/Expenses')); // 1. Importar la nueva página
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppProvider>
                <BrowserRouter>
                    <Suspense fallback={<div className="w-full h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>}>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/terms" element={<TermsOfService />} />
                            <Route path="/privacy" element={<PrivacyPolicy />} />
                            <Route element={<ProtectedRoute />}>
                                <Route element={<MainLayout />}>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/products" element={<Products />} />
                                    <Route path="/sales" element={<Sales />} />
                                    <Route path="/customers" element={<Customers />} />
                                    <Route path="/tasks" element={<Tasks />} />
                                    <Route path="/profile" element={<Profile />} />
                                    {/* 2. AÑADIR LA NUEVA RUTA */}
                                    <Route path="/expenses" element={<Expenses />} />
                                </Route>
                            </Route>
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Suspense>
                </BrowserRouter>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        // ... (opciones de toast sin cambios)
                        success: {
                            style: {
                                background: 'white',
                                color: '#16a34a',
                            },
                            iconTheme: {
                                primary: '#16a34a',
                                secondary: 'white',
                            },
                        },
                        error: {
                            style: {
                                background: 'white',
                                color: '#dc2626',
                            },
                             iconTheme: {
                                primary: '#dc2626',
                                secondary: 'white',
                            },
                        },
                    }}
                />
            </AppProvider>
        </AuthProvider>
    );
};

export default App;