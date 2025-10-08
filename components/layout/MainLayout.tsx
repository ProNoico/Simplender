import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAppContext } from '../../contexts/AppContext';
import ModalManager from '../global/ModalManager';
import NotificationsDropdown from './NotificationsDropdown'; // 1. Importar el dropdown

const MainLayout: React.FC = () => {
    const { isSidebarOpen, setSidebarOpen } = useAppContext();

    return (
        <div className="min-h-screen bg-neutral-100 lg:flex dark:bg-neutral-900">
            <Sidebar />
            
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" 
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            <div className="flex-1 flex flex-col">
                <Navbar />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 relative"> {/* 2. Añadir `relative` para posicionar el dropdown */}
                    <Outlet />
                    <NotificationsDropdown /> {/* 3. Renderizar el dropdown aquí */}
                </main>
            </div>
            
            <ModalManager />
        </div>
    );
};

export default MainLayout;