import React from 'react';
import Button from './Button';
import { Rocket } from 'lucide-react';

interface UpgradeModalProps {
    onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose }) => {

    const handleUpgradeClick = () => {
        alert('Aquí se iniciaría el proceso de pago.');
    };

    return (
        <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 mb-4">
                <Rocket className="h-6 w-6 text-primary-500" />
            </div>
            <h3 className="text-lg font-medium leading-6 text-neutral-900 dark:text-neutral-100">
                ¡Alcanzaste el Límite de tu Plan Gratuito!
            </h3>
            <div className="mt-2 px-7 py-3">
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    Para seguir creciendo sin límites y acceder a todas las funcionalidades, es hora de pasar al plan PRO.
                </p>
            </div>
            <div className="items-center px-4 py-3">
                <Button className="w-full h-12" onClick={handleUpgradeClick}>
                    Actualizar a PRO
                </Button>
                <Button variant="ghost" className="w-full h-12 mt-2" onClick={onClose}>
                    Cancelar
                </Button>
            </div>
        </div>
    );
};

export default UpgradeModal;