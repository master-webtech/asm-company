// purchase.js - Logic specific to the purchase page

document.addEventListener("DOMContentLoaded", () => {
  // Populate the dropdown using core.js helper
  const products = getData("raw_products");
  const select = document.getElementById("pur-product");
  select.innerHTML = products
    .map((item) => `<option value="${item}">${item}</option>`)
    .join("");

  // Event Listeners for calculating price dynamically
  document
    .getElementById("pur-price")
    .addEventListener("input", calcPurchasePerKg);
  document
    .getElementById("pur-qty")
    .addEventListener("input", calcPurchasePerKg);
  document
    .getElementById("pur-unit")
    .addEventListener("change", calcPurchasePerKg);

  // Form submission
  document
    .getElementById("purchase-form")
    .addEventListener("submit", savePurchase);
});

function calcPurchasePerKg() {
  let qty = parseFloat(document.getElementById("pur-qty").value) || 0;
  let unit = document.getElementById("pur-unit").value;
  let price = parseFloat(document.getElementById("pur-price").value) || 0;

  if (unit === "g") qty = qty / 1000; // Convert Grams to KG

  if (qty > 0) {
    let perKg = (price / qty).toFixed(2);
    document.getElementById("pur-price-kg").innerText = perKg;
  } else {
    document.getElementById("pur-price-kg").innerText = "0.00";
  }
}

function savePurchase(e) {
  e.preventDefault();
  let unit = document.getElementById("pur-unit").value;
  let qty = parseFloat(document.getElementById("pur-qty").value);
  let kgQty = unit === "g" ? qty / 1000 : qty;
  let price = parseFloat(document.getElementById("pur-price").value);

  const purchase = {
    date: document.getElementById("pur-date").value,
    product: document.getElementById("pur-product").value,
    qtyKg: kgQty,
    overallPrice: price,
    pricePerKg: parseFloat((price / kgQty).toFixed(2)),
  };

  let purchases = getData("purchases");
  purchases.push(purchase);
  saveData("purchases", purchases); // Saves via core.js

  alert("Purchase Saved Successfully!");
  e.target.reset();
  document.getElementById("pur-date").valueAsDate = new Date();
  document.getElementById("pur-price-kg").innerText = "0.00";
}
