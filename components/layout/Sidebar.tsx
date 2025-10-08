import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, TrendingUp, Users, CheckSquare, User as UserIcon, LogOut, Sun, Receipt } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppContext } from '../../contexts/AppContext';
import { NavItem } from '../../types';

// --- INICIO DE LA MODIFICACIÓN ---
// Cambiamos la etiqueta 'Dashboard' por 'Resumen'
const navItems: NavItem[] = [
    { path: '/', label: 'Resumen', icon: LayoutDashboard },
    { path: '/products', label: 'Productos', icon: Package },
    { path: '/sales', label: 'Ventas', icon: TrendingUp },
    { path: '/expenses', label: 'Gastos', icon: Receipt },
    { path: '/customers', label: 'Clientes', icon: Users },
    { path: '/tasks', label: 'Tareas', icon: CheckSquare },
    { path: '/profile', label: 'Perfil', icon: UserIcon },
];
// --- FIN DE LA MODIFICACIÓN ---

const Sidebar: React.FC = () => {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const { isSidebarOpen, setSidebarOpen } = useAppContext();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };
    
    const handleLinkClick = () => {
        if(window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    }

    return (
        <aside className={`fixed top-0 left-0 h-full bg-white shadow-lg w-64 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex lg:flex-shrink-0 z-40 dark:bg-neutral-900 dark:border-r dark:border-neutral-800`}>
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-center h-20 border-b dark:border-neutral-800">
                    <div className="flex items-center gap-2 text-primary-500">
                        <Sun className="w-8 h-8"/>
                        <span className="font-bold text-2xl">Simplender</span>
                    </div>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={handleLinkClick}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 ${
                                    isActive
                                        ? 'bg-primary-100 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
                                        : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="px-4 py-6 border-t dark:border-neutral-800">
                    <button
                        onClick={handleSignOut}
                        className="flex w-full items-center px-4 py-3 text-base font-medium rounded-lg text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition-colors duration-200"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;