import jsPDF from 'jspdf';

// fix: Use an intersection type to correctly combine the jsPDF instance type with the autoTable method.
// This resolves errors where standard jsPDF methods were not found on the custom type.
type jsPDFWithAutoTable = jsPDF & {
  autoTable: (options: any) => jsPDF;
};

// Helper to escape CSV values for cells containing commas, quotes, or newlines
const escapeCSV = (value: any): string => {
    const stringValue = String(value ?? '');
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
};

/**
 * Exports data to a CSV file.
 * @param headers - Array of objects with `label` (for display) and `key` (for data access).
 * @param data - Array of data objects.
 * @param filename - The name of the downloaded file.
 */
export const exportToCSV = (headers: {label: string, key: string}[], data: any[], filename: string) => {
    if (data.length === 0) {
        alert("No data to export.");
        return;
    }
    
    const csvContent = [
        headers.map(h => h.label).join(','),
        ...data.map(row => 
            headers.map(h => escapeCSV(row[h.key])).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Exports data to a PDF document using jsPDF-autoTable.
 * @param title - The title of the document.
 * @param headers - Array of objects with `label` (for table header) and `key` (for data access).
 * @param data - Array of data objects.
 * @param filename - The name of the downloaded file.
 */
export const exportToPDF = (title: string, headers: {label: string, key: string}[], data: any[], filename: string) => {
    if (data.length === 0) {
        alert("No data to export.");
        return;
    }

    const doc = new jsPDF() as jsPDFWithAutoTable;
    
    const tableColumn = headers.map(h => h.label);
    const tableRows = data.map(row => headers.map(h => String(row[h.key] ?? '')));
    
    // Check if autoTable method exists, assuming it's loaded from CDN
    if (typeof doc.autoTable === 'function') {
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 25,
            didDrawPage: function (pageData: any) {
                // Header
                doc.setFontSize(18);
                doc.setTextColor(40);
                doc.text(title, pageData.settings.margin.left, 20);
            },
        });
    } else {
        // Fallback for simple text rendering if autoTable is not available
        console.warn("jsPDF-autoTable not found. Falling back to basic text rendering.");
        doc.text(title, 14, 15);
        let y = 30;
        doc.setFontSize(10);
        doc.text(tableColumn.join("  |  "), 14, y);
        y += 10;
        tableRows.forEach(row => {
            if (y > 280) { // Naive page break
                doc.addPage();
                y = 20;
            }
            doc.text(row.join("  |  "), 14, y);
            y += 10;
        });
    }

    doc.save(filename);
};