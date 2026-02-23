// price-list.js

document.addEventListener("DOMContentLoaded", () => {
    renderPriceList();
});

function renderPriceList() {
    const purchases = getData('purchases');
    const rawProducts = getData('raw_products');
    const tbody = document.querySelector('#price-table tbody');
    
    tbody.innerHTML = ''; // Clear existing rows

    rawProducts.forEach(product => {
        // Filter purchases for this specific product and sort by date (newest first)
        const prodPurchases = purchases
            .filter(p => p.product === product)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        let lastPrice = 'N/A';
        let lastDate = 'N/A';
        
        // If we have purchase history, grab the most recent one
        if (prodPurchases.length > 0) {
            lastPrice = `₹${prodPurchases[0].pricePerKg}`;
            lastDate = prodPurchases[0].date;
        }
        
        // Append the row to the table
        const row = `<tr>
            <td>${product}</td>
            <td>${lastPrice}</td>
            <td>${lastDate}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
}