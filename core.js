// core.js - Shared LocalStorage Logic

const initData = () => {
    if (!localStorage.getItem('asm_initialized')) {
        const sampleRaw = ['Pearl Millet (Bajra)', 'Finger Millet (Ragi)', 'Organic Cumin', 'Organic Pepper'];
        const sampleMfg = ['Spiced Millet Mix', 'Ragi Malt'];
        
        localStorage.setItem('raw_products', JSON.stringify(sampleRaw));
        localStorage.setItem('mfg_products', JSON.stringify(sampleMfg));
        localStorage.setItem('purchases', JSON.stringify([]));
        localStorage.setItem('recipes', JSON.stringify([]));
        localStorage.setItem('productions', JSON.stringify([]));
        localStorage.setItem('asm_initialized', 'true');
    }
};

// Helper functions to get and save data
const getData = (key) => JSON.parse(localStorage.getItem(key)) || [];
const saveData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Set Default Dates to Today for any date input on the page
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('input[type="date"]').forEach(el => {
        el.valueAsDate = new Date();
    });
});

// Boot the database
initData();
// --- EXPORT TO CSV FEATURE ---

// Helper function to convert JSON arrays to CSV format
function convertToCSV(objArray) {
    if (!objArray || objArray.length === 0) return '';
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    
    // Create the Header row
    let headers = Object.keys(array[0]);
    str += headers.join(',') + '\r\n';
    
    // Create the Data rows
    for (let i = 0; i < array.length; i++) {
        let line = '';
        for (let index in array[i]) {
            if (line !== '') line += ',';
            // Wrap values in quotes to prevent issues with commas in data
            let value = array[i][index] !== null ? array[i][index].toString() : '';
            line += `"${value.replace(/"/g, '""')}"`;
        }
        str += line + '\r\n';
    }
    return str;
}

// Helper function to trigger the browser's download prompt
function downloadCSV(csv, filename) {
    let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    let link = document.createElement("a");
    let url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Main function triggered by the user
function exportAllToCSV() {
    const purchases = getData('purchases');
    const productions = getData('productions');

    let exportedSomething = false;

    if (purchases.length > 0) {
        let purCSV = convertToCSV(purchases);
        downloadCSV(purCSV, 'ASM_Purchases_Backup.csv');
        exportedSomething = true;
    } 

    if (productions.length > 0) {
        let prodCSV = convertToCSV(productions);
        downloadCSV(prodCSV, 'ASM_Productions_Backup.csv');
        exportedSomething = true;
    }

    if (!exportedSomething) {
        alert("There is no purchase or production data to export yet!");
    }
}