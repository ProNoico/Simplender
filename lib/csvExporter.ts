// Objeto que define una columna, con la clave para acceder al dato y la etiqueta a mostrar.
interface CsvColumn {
    key: string;
    label: string;
}

// Función para escapar caracteres especiales para el formato CSV
const escapeCsvCell = (cell: any): string => {
    if (cell === null || cell === undefined) {
        return '';
    }
    const cellString = String(cell);
    if (/[",\n\r]/.test(cellString)) {
        return `"${cellString.replace(/"/g, '""')}"`;
    }
    return cellString;
};

// La función ahora acepta un array de objetos CsvColumn
export const exportToCsv = (filename: string, columns: CsvColumn[], data: Record<string, any>[]) => {
    // La primera fila del CSV serán las etiquetas en español
    const headerRow = columns.map(col => col.label).join(',');

    // Mapeamos los datos usando las claves de las columnas
    const csvRows = data.map(row =>
        columns.map(col => escapeCsvCell(row[col.key])).join(',')
    );

    // Unimos los encabezados y las filas
    const csvString = [headerRow, ...csvRows].join('\r\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};