import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DashboardStats } from '../types';
import { formatCurrency } from './utils';

export const generateReport = (stats: DashboardStats, userName: string, businessName: string, rangeLabel: string) => {
    const doc = new jsPDF();
    const today = new Date();
    const formattedDate = format(today, "dd 'de' MMMM 'de' yyyy", { locale: es });

    doc.setFontSize(22);
    doc.setTextColor(38, 38, 38);
    doc.text(`Reporte de Ventas - ${businessName}`, 14, 22);

    doc.setFontSize(12);
    doc.setTextColor(115, 115, 115);
    doc.text(`Generado para: ${userName}`, 14, 30);
    // Corregimos el texto del período para usar la etiqueta dinámica
    doc.text(`Período: ${rangeLabel}`, 14, 36);
    doc.text(`Fecha de generación: ${formattedDate}`, 14, 42);

    doc.setFontSize(16);
    doc.setTextColor(38, 38, 38);
    doc.text(`Resumen del Período (${rangeLabel})`, 14, 56);
    
    // Corregimos la etiqueta de la métrica y usamos el valor dinámico `monthly_sales`
    const statsData = [
        [`Ventas Totales (${rangeLabel})`, formatCurrency(stats.monthly_sales)],
        ['Meta Mensual', formatCurrency(stats.monthly_goal)],
        [`Producto Más Vendido (${rangeLabel})`, `${stats.most_sold_product?.name || 'N/A'} (${stats.most_sold_product?.quantity || 0} u.)`],
        [`Clientes Activos (${rangeLabel})`, stats.active_customers.toString()],
    ];

    autoTable(doc, {
        startY: 61,
        head: [['Métrica', 'Valor']],
        body: statsData,
        theme: 'striped',
        headStyles: { fillColor: [236, 72, 153] },
    });
    
    const tableStartY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.text('Últimas 5 Ventas Registradas', 14, tableStartY);

    const salesBody = stats.last_5_sales.map((sale: any) => [
        format(new Date(sale.created_at), 'dd/MM/yyyy'),
        sale.product_name || 'N/A',
        sale.customer_name || 'Sin cliente',
        formatCurrency(sale.amount),
    ]);

    autoTable(doc, {
        startY: tableStartY + 5,
        head: [['Fecha', 'Producto', 'Cliente', 'Monto']],
        body: salesBody,
        theme: 'grid',
        headStyles: { fillColor: [236, 72, 153] },
    });
    
    doc.save(`Reporte_${businessName.replace(/\s+/g, '_')}_${rangeLabel.replace(/\s+/g, '_')}.pdf`);
};