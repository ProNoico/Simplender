import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { useAppContext } from '../contexts/AppContext';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import Input from '../components/shared/Input';
import toast from 'react-hot-toast';
import AvatarUploader from '../components/shared/AvatarUploader';

const profileSchema = z.object({
    full_name: z.string().min(3, { message: 'Tu nombre debe tener al menos 3 caracteres.' }),
    business_name: z.string().optional(),
    phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const Profile: React.FC = () => {
    const { user, loading, updateProfile, signOut } = useAuth();
    const { theme, toggleTheme } = useAppContext();
    
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
    });

    useEffect(() => {
        if (user) {
            reset({
                full_name: user.user_metadata.full_name || '',
                business_name: user.user_metadata.business_name || '',
                phone: user.user_metadata.phone || '',
            });
        }
    }, [user, reset]);

    const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
        const { error } = await updateProfile(data);

        if (error) {
            toast.error('No se pudo actualizar tu perfil. Intenta de nuevo.');
        } else {
            toast.success('¡Perfil actualizado con éxito!');
        }
    };

    if (loading || !user) {
        return <div className="flex justify-center items-center h-full"><LoadingSpinner size="lg" /></div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 px-4 sm:px-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800 dark:text-neutral-200">Mi Perfil</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="lg:col-span-2 space-y-6 md:space-y-8">
                    <Card className="p-4 sm:p-6">
                         <h2 className="text-lg sm:text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-4">Avatar</h2>
                         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex-shrink-0">
                                <AvatarUploader />
                            </div>
                            <div className="flex-grow">
                                <p className="text-neutral-600 dark:text-neutral-400 text-sm">Arrastra o haz clic para subir una imagen.</p>
                                <p className="text-neutral-500 dark:text-neutral-500 text-xs mt-1">PNG, JPG, GIF (max 1MB).</p>
                            </div>
                         </div>
                    </Card>

                    <Card>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                                <h2 className="text-lg sm:text-xl font-semibold text-neutral-700 dark:text-neutral-300">Datos del Usuario</h2>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">Email</label>
                                    <input type="email" value={user.email || ''} disabled className="w-full h-10 sm:h-12 px-3 sm:px-4 py-2 border bg-neutral-100 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-500 dark:text-neutral-400 cursor-not-allowed" />
                                </div>
                                
                                <Input
                                    label="Nombre Completo"
                                    registration={register('full_name')}
                                    error={errors.full_name?.message}
                                    className="h-10 sm:h-12"
                                />
                                <Input
                                    label="Nombre del Negocio"
                                    registration={register('business_name')}
                                    error={errors.business_name?.message}
                                    className="h-10 sm:h-12"
                                />
                                <Input
                                    label="Teléfono"
                                    type="tel"
                                    registration={register('phone')}
                                    error={errors.phone?.message}
                                    className="h-10 sm:h-12"
                                />
                            </div>
                            <div className="bg-neutral-50 dark:bg-neutral-800/50 px-4 sm:px-6 py-3 sm:py-4 rounded-b-xl text-right">
                                <Button type="submit" disabled={isSubmitting} className="h-10 sm:h-12 w-full sm:w-auto">
                                    {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
                <div className="space-y-6 md:space-y-8">
                     <Card className="p-4 sm:p-6">
                         <h2 className="text-lg sm:text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-4">Plan Actual</h2>
                         <div className="flex items-center justify-between">
                            <p className="text-base sm:text-lg text-neutral-800 dark:text-neutral-200">Plan Actual</p>
                            <span className="px-3 py-1 text-xs sm:text-sm font-semibold text-primary-700 bg-primary-100 rounded-full capitalize">
                                {user.app_metadata.plan === 'pro' ? 'PRO' : 'Gratuito'}
                                {user.app_metadata.plan !== 'pro' && user.app_metadata.trial_ends_at && new Date(user.app_metadata.trial_ends_at) > new Date() ? ' (Prueba)' : ''}
                            </span>
                         </div>
                          {user.app_metadata.plan !== 'pro' && (
                            <Button variant="secondary" className="w-full mt-6 h-10 sm:h-12" onClick={() => alert('La página de pago se implementará en una futura versión.')}>
                                Actualizar a PRO
                            </Button>
                          )}
                    </Card>
                     <Card className="p-4 sm:p-6">
                         <h2 className="text-lg sm:text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-4">Apariencia</h2>
                         <div className="flex items-center justify-between">
                            <p className="text-neutral-600 dark:text-neutral-400">Modo Oscuro</p>
                            <button onClick={toggleTheme} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-primary-500' : 'bg-neutral-300'}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                         </div>
                    </Card>
                     <Card className="p-4 sm:p-6">
                         <h2 className="text-lg sm:text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-4">Cuenta</h2>
                         <Button variant="danger" className="w-full h-10 sm:h-12" onClick={signOut}>Cerrar Sesión</Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;