// raw-dashboard.js

let rawChartInstance = null;

document.addEventListener("DOMContentLoaded", () => {
  populateRawDropdowns();
  renderRawTopBottom();
  renderRawChart();
  calcRawOverallQty();
});

function populateRawDropdowns() {
  const products = getData("raw_products");
  const productOptions = products
    .map((p) => `<option value="${p}">${p}</option>`)
    .join("");

  document.getElementById("raw-chart-product").innerHTML = productOptions;
  document
    .getElementById("raw-overall-product")
    .insertAdjacentHTML("beforeend", productOptions);
}

function filterByDays(records, days) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - parseInt(days));
  return records.filter((r) => new Date(r.date) >= cutoff);
}

// Section 1: Top & Bottom Purchased
function renderRawTopBottom() {
  const purchases = getData("purchases");
  const totals = {};

  purchases.forEach((p) => {
    totals[p.product] = (totals[p.product] || 0) + parseFloat(p.qtyKg);
  });

  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);

  const topList = document.getElementById("raw-top-list");
  const bottomList = document.getElementById("raw-bottom-list");

  topList.innerHTML =
    sorted
      .slice(0, 3)
      .map(
        (item) =>
          `<li><strong>${item[0]}</strong>: ${item[1].toFixed(2)} KG</li>`,
      )
      .join("") || "<li>No data yet</li>";

  const bottoms = [...sorted].reverse().slice(0, 3);
  bottomList.innerHTML =
    bottoms
      .map(
        (item) =>
          `<li><strong>${item[0]}</strong>: ${item[1].toFixed(2)} KG</li>`,
      )
      .join("") || "<li>No data yet</li>";
}

// Section 2: Chart (Pricing)
function renderRawChart() {
  const prodName = document.getElementById("raw-chart-product").value;
  const days = document.getElementById("raw-chart-time").value;

  let purchases = getData("purchases").filter((p) => p.product === prodName);
  purchases = filterByDays(purchases, days);

  purchases.sort((a, b) => new Date(a.date) - new Date(b.date));

  const dates = purchases.map((p) => p.date);
  const prices = purchases.map((p) => parseFloat(p.pricePerKg));

  const statsDiv = document.getElementById("raw-chart-stats");
  if (prices.length > 0) {
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2);
    statsDiv.innerText = `Highest Price: ₹${max} | Lowest Price: ₹${min} | Average Price: ₹${avg}`;
  } else {
    statsDiv.innerText = "No purchase data found for this period.";
  }

  const ctx = document.getElementById("raw-chart").getContext("2d");
  if (rawChartInstance) rawChartInstance.destroy();

  rawChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: `Purchase Price - ${prodName} (₹ per KG)`,
          data: prices,
          borderColor: "#e67e22", // Orange for raw materials
          backgroundColor: "rgba(230, 126, 34, 0.2)",
          fill: true,
          tension: 0.1,
          pointRadius: 5,
          pointHoverRadius: 8,
        },
      ],
    },
  });
}

// Section 3: Overall Quantity (Locked to last 30 days per your instructions)
function calcRawOverallQty() {
  const prodName = document.getElementById("raw-overall-product").value;

  // Hardcoded to 30 days as requested
  let purchases = filterByDays(getData("purchases"), 30);

  if (prodName !== "Overall") {
    purchases = purchases.filter((p) => p.product === prodName);
  }

  const total = purchases.reduce((sum, p) => sum + parseFloat(p.qtyKg), 0);
  document.getElementById("raw-total-qty-display").innerText = total.toFixed(2);
}
