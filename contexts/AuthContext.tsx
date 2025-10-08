import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabaseClient } from '../lib/supabase';
import { Session, User } from '../types';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    updateProfile: (updates: { full_name?: string; business_name?: string; phone?: string; }) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
            setSession(session as Session | null);
            setUser(session?.user as User | null ?? null);
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);
    
    const signInWithGoogle = useCallback(async () => {
        setLoading(true);
        try {
            const { error } = await supabaseClient.auth.signInWithOAuth({
                provider: 'google',
            });
            if (error) throw error;
        } catch (error) {
            console.error('Error signing in with Google:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const signOut = async () => {
        setLoading(true);
        await supabaseClient.auth.signOut();
        setSession(null);
        setUser(null);
        setLoading(false);
    };

    const updateProfile = useCallback(async (updates: { full_name?: string; business_name?: string; phone?: string; }) => {
        if (!user) return { error: 'No user logged in' };
        
        const { data, error } = await supabaseClient.auth.updateUser({
            data: updates
        })

        if (!error && data.user) {
            setUser(data.user as User)
            if(session){
                const updatedSession = {...session, user: data.user as User};
                setSession(updatedSession);
            }
        }
        
        return { error };
    }, [user, session]);


    const value = {
        session,
        user,
        loading,
        signInWithGoogle,
        signOut,
        updateProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};