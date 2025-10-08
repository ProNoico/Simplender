import React, { useMemo } from 'react';
import { Product } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { Inbox, X, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../shared/Button';

const NotificationItem: React.FC<{ product: Product, isRead: boolean, onClick: () => void }> = ({ product, isRead, onClick }) => (
    <div 
        onClick={onClick} 
        className={`p-3 rounded-lg cursor-pointer transition-colors ${isRead ? 'opacity-60' : 'hover:bg-neutral-100 dark:hover:bg-neutral-700/50'}`}
    >
        <p className={`font-semibold ${isRead ? 'text-neutral-500' : ''}`}>{product.name}</p>
        <p className={`text-sm ${isRead ? 'text-yellow-700 dark:text-yellow-600' : 'text-yellow-600 dark:text-yellow-400'}`}>
            Stock bajo: {product.current_stock} restantes (Alerta en {product.min_stock_alert})
        </p>
    </div>
);


const NotificationsDropdown: React.FC = () => {
    const { 
        isNotificationsOpen, 
        lowStockProducts, 
        setNotificationsOpen,
        readNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead 
    } = useAppContext();
    const navigate = useNavigate();

    const sortedProducts = useMemo(() => {
        return [...lowStockProducts].sort((a, b) => {
            const aIsRead = readNotifications.has(a.id);
            const bIsRead = readNotifications.has(b.id);
            if (aIsRead === bIsRead) return 0;
            return aIsRead ? 1 : -1;
        });
    }, [lowStockProducts, readNotifications]);

    if (!isNotificationsOpen) return null;
    
    const handleItemClick = (product: Product) => {
        markNotificationAsRead(product.id);
        navigate('/products');
        setNotificationsOpen(false);
    };

    // --- INICIO DE LA CORRECCIÓN ---
    const handleMarkAllAsRead = () => {
        markAllNotificationsAsRead();
        // Agregamos un pequeño retraso para que el usuario perciba el cambio antes de que se cierre.
        setTimeout(() => {
            setNotificationsOpen(false);
        }, 200); 
    };
    // --- FIN DE LA CORRECCIÓN ---

    return (
        <div className="absolute top-16 right-4 w-80 bg-white dark:bg-neutral-800 rounded-xl shadow-soft border dark:border-neutral-700 z-50 animate-scale-in">
            <div className="flex justify-between items-center p-4 border-b dark:border-neutral-700">
                <h3 className="font-bold">Notificaciones</h3>
                <button onClick={() => setNotificationsOpen(false)} className="text-neutral-500 hover:text-primary-500">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <div className="p-2 max-h-80 overflow-y-auto">
                {sortedProducts.length > 0 ? (
                    sortedProducts.map(product => (
                        <NotificationItem 
                            key={product.id} 
                            product={product} 
                            isRead={readNotifications.has(product.id)}
                            onClick={() => handleItemClick(product)} 
                        />
                    ))
                ) : (
                    <div className="text-center p-8 text-neutral-500 dark:text-neutral-400">
                        <Inbox className="w-12 h-12 mx-auto text-neutral-400" />
                        <p className="mt-4 font-semibold">¡Todo en orden!</p>
                        <p className="text-sm mt-1">No hay productos con stock bajo.</p>
                    </div>
                )}
            </div>
            {lowStockProducts.length > 0 && (
                <div className="p-2 border-t dark:border-neutral-700">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full"
                        onClick={handleMarkAllAsRead} // Usamos la nueva función
                    >
                        <CheckCheck className="w-4 h-4 mr-2" />
                        Marcar todas como leídas
                    </Button>
                </div>
            )}
        </div>
    );
};

export default NotificationsDropdown;