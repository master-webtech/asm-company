// index.js (Manufacture Dashboard)

let mfgChartInstance = null;

document.addEventListener("DOMContentLoaded", () => {
  populateMfgDropdowns();
  renderMfgTopBottom();
  renderMfgChart();
  calcMfgOverallQty();
});

function populateMfgDropdowns() {
  const products = getData("mfg_products");
  const productOptions = products
    .map((p) => `<option value="${p}">${p}</option>`)
    .join("");

  document.getElementById("mfg-chart-product").innerHTML = productOptions;
  // Add specific products to the "Overall" dropdown (which already has an "Overall" option)
  document
    .getElementById("mfg-overall-product")
    .insertAdjacentHTML("beforeend", productOptions);
}

// Helper: Filter records by date (last X days)
function filterByDays(records, days) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - parseInt(days));
  return records.filter((r) => new Date(r.date) >= cutoff);
}

// Section 1: Top & Bottom Performers
function renderMfgTopBottom() {
  const productions = getData("productions");
  const totals = {};

  // Sum quantities per product
  productions.forEach((p) => {
    totals[p.product] = (totals[p.product] || 0) + parseFloat(p.finalQtyKg);
  });

  // Sort products by quantity descending
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);

  const topList = document.getElementById("mfg-top-list");
  const bottomList = document.getElementById("mfg-bottom-list");

  topList.innerHTML =
    sorted
      .slice(0, 3)
      .map(
        (item) =>
          `<li><strong>${item[0]}</strong>: ${item[1].toFixed(2)} KG</li>`,
      )
      .join("") || "<li>No data yet</li>";

  // Bottom 3 (reverse the array to get lowest, then slice top 3)
  const bottoms = [...sorted].reverse().slice(0, 3);
  bottomList.innerHTML =
    bottoms
      .map(
        (item) =>
          `<li><strong>${item[0]}</strong>: ${item[1].toFixed(2)} KG</li>`,
      )
      .join("") || "<li>No data yet</li>";
}

// Section 2: Chart
function renderMfgChart() {
  const prodName = document.getElementById("mfg-chart-product").value;
  const days = document.getElementById("mfg-chart-time").value;

  let productions = getData("productions").filter(
    (p) => p.product === prodName,
  );
  productions = filterByDays(productions, days);

  // Sort chronologically for the chart
  productions.sort((a, b) => new Date(a.date) - new Date(b.date));

  const dates = productions.map((p) => p.date);
  const quantities = productions.map((p) => parseFloat(p.finalQtyKg));

  // Calculate Stats
  const statsDiv = document.getElementById("mfg-chart-stats");
  if (quantities.length > 0) {
    const min = Math.min(...quantities);
    const max = Math.max(...quantities);
    const avg = (
      quantities.reduce((a, b) => a + b, 0) / quantities.length
    ).toFixed(2);
    statsDiv.innerText = `Highest: ${max} KG | Lowest: ${min} KG | Average: ${avg} KG`;
  } else {
    statsDiv.innerText = "No production data found for this period.";
  }

  // Render Chart
  const ctx = document.getElementById("mfg-chart").getContext("2d");
  if (mfgChartInstance) mfgChartInstance.destroy();

  mfgChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: `Qty Manufactured - ${prodName} (KG)`,
          data: quantities,
          borderColor: "#3498db",
          backgroundColor: "rgba(52, 152, 219, 0.2)",
          fill: true,
          tension: 0.1,
          pointRadius: 5,
          pointHoverRadius: 8,
        },
      ],
    },
  });
}

// Section 3: Overall Quantity
function calcMfgOverallQty() {
  const prodName = document.getElementById("mfg-overall-product").value;
  const days = document.getElementById("mfg-overall-time").value;

  let productions = getData("productions");
  productions = filterByDays(productions, days);

  if (prodName !== "Overall") {
    productions = productions.filter((p) => p.product === prodName);
  }

  const total = productions.reduce(
    (sum, p) => sum + parseFloat(p.finalQtyKg),
    0,
  );
  document.getElementById("mfg-total-qty-display").innerText = total.toFixed(2);
}
