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