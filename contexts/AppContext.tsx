import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { Product, Customer, Expense } from '../types';
import { supabaseClient } from '../lib/supabase';
import { useAuth } from './AuthContext';

type Theme = 'light' | 'dark';
type ModalType = 'newSale' | 'newProduct' | 'editProduct' | 'newCustomer' | 'editCustomer' | 'newTask' | 'upgrade' | 'newExpense' | 'editExpense' | 'customerPurchases' | null;
type ModalPayload = Product | Customer | Expense | null;

interface AppContextType {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    setSidebarOpen: (isOpen: boolean) => void;
    
    activeModal: ModalType;
    modalPayload: ModalPayload;
    openModal: (modal: ModalType, payload?: ModalPayload) => void;
    closeModal: () => void;

    refreshId: number;
    triggerRefresh: () => void;

    theme: Theme;
    toggleTheme: () => void;

    isNotificationsOpen: boolean;
    setNotificationsOpen: (isOpen: boolean) => void;
    lowStockProducts: Product[];

    // --- NUEVOS ESTADOS Y FUNCIONES PARA GESTIONAR NOTIFICACIONES LEÍDAS ---
    readNotifications: Set<string>;
    markNotificationAsRead: (productId: string) => void;
    markAllNotificationsAsRead: () => void;
    // --------------------------------------------------------------------
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getInitialTheme = (): Theme => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const storedPrefs = window.localStorage.getItem('theme');
        if (typeof storedPrefs === 'string' && (storedPrefs === 'light' || storedPrefs === 'dark')) {
            return storedPrefs;
        }
        const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
        if (userMedia.matches) {
            return 'dark';
        }
    }
    return 'light';
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [modalPayload, setModalPayload] = useState<ModalPayload>(null);
    const [refreshId, setRefreshId] = useState(0);
    const [theme, setTheme] = useState<Theme>(getInitialTheme);

    const [isNotificationsOpen, setNotificationsOpen] = useState(false);
    const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
    
    // Usamos un Set para un manejo eficiente de los IDs de las notificaciones leídas
    const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());

    const markNotificationAsRead = (productId: string) => {
        setReadNotifications(prev => new Set(prev).add(productId));
    };

    const markAllNotificationsAsRead = () => {
        const allProductIds = new Set(lowStockProducts.map(p => p.id));
        setReadNotifications(allProductIds);
    };

    const fetchLowStockProducts = useCallback(async () => {
        if (!user) return;
        const { data, error } = await supabaseClient.rpc('get_low_stock_products');
        if (error) {
            console.error('Error fetching low stock products:', error);
        } else {
            setLowStockProducts(data || []);
        }
    }, [user]);

    useEffect(() => {
        fetchLowStockProducts();
    }, [fetchLowStockProducts, refreshId]);
    
    const toggleTheme = () => {
        setTheme(prevTheme => {
            const newTheme = prevTheme === 'light' ? 'dark' : 'light';
            window.localStorage.setItem('theme', newTheme);
            return newTheme;
        });
    };
    
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
    }, [theme]);
    
    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
    const setSidebarOpen = (isOpen: boolean) => setIsSidebarOpen(isOpen);
    
    const openModal = (modal: ModalType, payload: ModalPayload = null) => {
        setActiveModal(modal);
        setModalPayload(payload);
    };

    const closeModal = () => {
        setActiveModal(null);
        setModalPayload(null);
    };
    
    const triggerRefresh = useCallback(() => setRefreshId(id => id + 1), []);

    const value = {
        isSidebarOpen,
        toggleSidebar,
        setSidebarOpen,
        activeModal,
        modalPayload,
        openModal,
        closeModal,
        refreshId,
        triggerRefresh,
        theme,
        toggleTheme,
        isNotificationsOpen,
        setNotificationsOpen,
        lowStockProducts,
        readNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
    return context;
};