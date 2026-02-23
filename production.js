// production.js

document.addEventListener("DOMContentLoaded", () => {
  // Populate the manufactured product dropdown
  const mfgProducts = getData("mfg_products");
  const select = document.getElementById("prod-product");
  select.innerHTML = mfgProducts
    .map((item) => `<option value="${item}">${item}</option>`)
    .join("");

  // Event listeners for dynamic calculations
  document
    .getElementById("prod-qty-used")
    .addEventListener("input", calcProductionStats);
  document
    .getElementById("prod-qty-final")
    .addEventListener("input", calcProductionStats);

  // Form submission
  document
    .getElementById("production-form")
    .addEventListener("submit", saveProduction);
});

function calcProductionStats() {
  let rawQty = parseFloat(document.getElementById("prod-qty-used").value) || 0;
  let finalQty =
    parseFloat(document.getElementById("prod-qty-final").value) || 0;

  // Calculate Wastage Percentage
  if (rawQty > 0 && finalQty > 0) {
    let waste = ((rawQty - finalQty) / rawQty) * 100;

    // Prevent negative wastage (if they yield more than they put in)
    waste = waste < 0 ? 0 : waste;

    document.getElementById("prod-waste").innerText = waste.toFixed(2) + "%";
  } else {
    document.getElementById("prod-waste").innerText = "0%";
  }

  // Note: To accurately calculate "Estimated Cost Price per KG" here,
  // we will later link this to the "Mfg Details (Recipes)" database
  // once that page is built, to pull the exact cost of the raw materials used.
}

function saveProduction(e) {
  e.preventDefault();

  const productionLog = {
    date: document.getElementById("prod-date").value,
    product: document.getElementById("prod-product").value,
    rawUsedKg: parseFloat(document.getElementById("prod-qty-used").value),
    finalQtyKg: parseFloat(document.getElementById("prod-qty-final").value),
    wastePercent: document.getElementById("prod-waste").innerText,
  };

  let productions = getData("productions");
  productions.push(productionLog);
  saveData("productions", productions); // Saves via core.js

  alert("Production Log Saved Successfully!");
  e.target.reset();
  document.getElementById("prod-date").valueAsDate = new Date(); // Reset to today
  document.getElementById("prod-waste").innerText = "0%";
}
