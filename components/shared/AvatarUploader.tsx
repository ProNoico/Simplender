// components/shared/AvatarUploader.tsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../contexts/AuthContext';
import { supabaseClient } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { UploadCloud, Loader } from 'lucide-react';

const AvatarUploader: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const [uploading, setUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (!user) return;
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}.${fileExt}`;
        const filePath = `${fileName}`;

        setUploading(true);
        toast.loading('Subiendo imagen...');

        try {
            const { error: uploadError } = await supabaseClient.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabaseClient.storage
                .from('avatars')
                .getPublicUrl(filePath);
            
            // Forzamos la recarga de la imagen en el navegador añadiendo un timestamp
            const finalUrl = `${publicUrl}?t=${new Date().getTime()}`;

            const { error: updateError } = await updateProfile({ avatar_url: finalUrl });

            if (updateError) {
                throw updateError;
            }

            toast.dismiss();
            toast.success('¡Avatar actualizado!');
        } catch (error: any) {
            toast.dismiss();
            toast.error('Error al subir la imagen: ' + error.message);
        } finally {
            setUploading(false);
        }
    }, [user, updateProfile]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png', '.gif'] },
        maxSize: 1048576, // 1MB
        multiple: false,
        onDropRejected: (fileRejections) => {
            const error = fileRejections[0].errors[0];
            if (error.code === 'file-too-large') {
                toast.error('La imagen es muy pesada. El límite es 1MB.');
            } else {
                toast.error(error.message);
            }
        },
    });

    return (
        <div {...getRootProps()} className={`relative w-32 h-32 rounded-full cursor-pointer group border-2 border-dashed  transition-all ${isDragActive ? 'border-primary-500' : 'border-neutral-300 dark:border-neutral-600'}`}>
            <img
                src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user?.user_metadata?.full_name || '?'}&size=128`}
                alt="Avatar"
                className="w-full h-full rounded-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploading ? (
                    <Loader className="animate-spin text-white" />
                ) : (
                    <>
                        <UploadCloud className="w-8 h-8 text-white" />
                        <p className="text-white text-xs text-center mt-1">Subir imagen</p>
                    </>
                )}
            </div>
            <input {...getInputProps()} />
        </div>
    );
};

export default AvatarUploader;