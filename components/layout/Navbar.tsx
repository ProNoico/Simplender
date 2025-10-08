import React from 'react';
import { Menu, Sun, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppContext } from '../../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import Button from '../shared/Button'; // <-- ¡AQUÍ ESTÁ LA LÍNEA QUE FALTABA!

const Navbar: React.FC = () => {
    const { user } = useAuth();
    const { toggleSidebar, isNotificationsOpen, setNotificationsOpen, lowStockProducts, readNotifications } = useAppContext();
    const navigate = useNavigate();

    const unreadCount = lowStockProducts.filter(p => !readNotifications.has(p.id)).length;

    const getAvatarUrl = () => {
        if (user?.user_metadata?.avatar_url) {
            return user.user_metadata.avatar_url;
        }
        if (user?.user_metadata?.full_name) {
            return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata.full_name)}&background=ec4899&color=fff`;
        }
        return `https://ui-avatars.com/api/?name=?&background=ec4899&color=fff`;
    };

    return (
        <header className="sticky top-0 bg-white/80 backdrop-blur-sm shadow-sm z-20 dark:bg-neutral-900/80 dark:border-b dark:border-neutral-800">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                <button
                    onClick={toggleSidebar}
                    className="text-neutral-500 hover:text-primary-500 lg:hidden"
                    aria-label="Abrir menú"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="lg:hidden">
                    <div className="flex items-center gap-2 text-primary-500">
                       <Sun className="w-5 h-5"/>
                       <span className="font-bold text-lg">Simplender</span>
                    </div>
                </div>

                <div className="hidden lg:block" />

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setNotificationsOpen(!isNotificationsOpen)}
                            aria-label="Abrir notificaciones"
                        >
                            <Bell className="w-6 h-6" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                    {unreadCount}
                                </span>
                            )}
                        </Button>
                    </div>
                     <div 
                        className="flex items-center gap-3 cursor-pointer" 
                        onClick={() => navigate('/profile')}
                        title="Ir al perfil"
                     >
                        <div className="text-right hidden sm:block">
                            <p className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">{user?.user_metadata.full_name}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{user?.user_metadata.business_name}</p>
                        </div>
                        <img
                            src={getAvatarUrl()}
                            alt="Avatar de usuario"
                            className="w-10 h-10 rounded-full object-cover border-2 border-primary-200"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;