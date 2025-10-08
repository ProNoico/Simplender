import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import Modal from '../shared/Modal';
import ProductForm from '../products/ProductForm';
import SaleForm from '../sales/SaleForm';
import TaskForm from '../tasks/TaskForm';
import CustomerForm from '../customers/CustomerForm';
import UpgradeModal from '../shared/UpgradeModal';
import ExpenseForm from '../expenses/ExpenseForm';
import CustomerPurchasesModal from '../customers/CustomerPurchasesModal'; // 1. Importar
import { Product, Customer, Expense } from '../../types';

const ModalManager: React.FC = () => {
    const { activeModal, closeModal, modalPayload } = useAppContext();
    if (!activeModal) return null;

    const renderModalContent = () => {
        switch (activeModal) {
            case 'newProduct':
                return { title: 'Nuevo Producto', content: <ProductForm onSuccess={closeModal} onCancel={closeModal} /> };
            case 'editProduct':
                return { title: 'Editar Producto', content: <ProductForm onSuccess={closeModal} onCancel={closeModal} productToEdit={modalPayload as Product} /> };
            
            case 'newCustomer':
                return { title: 'Nuevo Cliente', content: <CustomerForm onSuccess={closeModal} onCancel={closeModal} /> };
            case 'editCustomer':
                return { title: 'Editar Cliente', content: <CustomerForm onSuccess={closeModal} onCancel={closeModal} customerToEdit={modalPayload as Customer} /> };

            case 'newSale':
                return { title: 'Registrar Venta Rápida', content: <SaleForm onSuccess={closeModal} onCancel={closeModal} /> };
            case 'newTask':
                 return { title: 'Nueva Tarea', content: <TaskForm onSuccess={closeModal} onCancel={closeModal} /> };
            
            case 'newExpense':
                return { title: 'Nuevo Gasto', content: <ExpenseForm onSuccess={closeModal} onCancel={closeModal} /> };
            case 'editExpense':
                return { title: 'Editar Gasto', content: <ExpenseForm onSuccess={closeModal} onCancel={closeModal} expenseToEdit={modalPayload as Expense} /> };
            
            // --- 2. AÑADIR CASO PARA EL HISTORIAL DE COMPRAS ---
            case 'customerPurchases':
                const customer = modalPayload as Customer;
                return { title: `Historial de ${customer.name}`, content: <CustomerPurchasesModal customer={customer} /> };
            // ---------------------------------------------------
            
            case 'upgrade':
                 return { title: 'Mejorá tu Plan', content: <UpgradeModal onClose={closeModal} /> };
            default:
                return null;
        }
    };

    const modalDetails = renderModalContent();
    if (!modalDetails) return null;

    return (
        <Modal isOpen={!!activeModal} onClose={closeModal} title={modalDetails.title}>
            {modalDetails.content}
        </Modal>
    );
};

export default ModalManager;