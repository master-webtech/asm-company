// mfg-details.js

document.addEventListener("DOMContentLoaded", () => {
  renderRecipes();
  // Add one empty ingredient row by default if the form is opened
  addIngredientRow();
});

function toggleRecipeForm() {
  const form = document.getElementById("mfg-recipe-form");
  form.style.display = form.style.display === "none" ? "block" : "none";
  if (form.style.display === "none") {
    document.getElementById("recipe-summary").style.display = "none"; // hide summary on close
  }
}

function toggleRoastPrice() {
  const isRoasted = document.getElementById("recipe-roasted").checked;
  document.getElementById("recipe-roast-price").style.display = isRoasted
    ? "block"
    : "none";
}

function addIngredientRow() {
  const rawProducts = getData("raw_products");
  const container = document.getElementById("recipe-ingredients");

  const rowId = "ing-" + Date.now();

  // Generate options for the dropdown
  const options = rawProducts
    .map((p) => `<option value="${p}">${p}</option>`)
    .join("");

  const rowHtml = `
        <div id="${rowId}" class="ingredient-row" style="display: flex; gap: 10px; align-items: center; margin-top: 10px;">
            <select class="ing-name" style="flex: 2;">${options}</select>
            <input type="number" class="ing-qty" placeholder="Qty" step="0.01" required style="flex: 1;">
            <select class="ing-unit" style="flex: 1;">
                <option value="kg">KG</option>
                <option value="g">Gram</option>
            </select>
            <button type="button" onclick="document.getElementById('${rowId}').remove()" style="margin-top: 0; background-color: #e74c3c; width: auto;">X</button>
        </div>
    `;

  container.insertAdjacentHTML("beforeend", rowHtml);
}

// Helper to get the most recent purchase price for a specific raw material
function getLatestPrice(productName) {
  const purchases = getData("purchases")
    .filter((p) => p.product === productName)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return purchases.length > 0 ? purchases[0].pricePerKg : 0;
}

function calculateAndSaveRecipe() {
  const recipeName = document.getElementById("recipe-name").value;
  if (!recipeName) return alert("Please enter a Manufactured Product Name.");

  const ingredientRows = document.querySelectorAll(".ingredient-row");
  if (ingredientRows.length === 0)
    return alert("Please add at least one raw material.");

  let totalQtyKg = 0;
  let totalCost = 0;
  const ingredients = [];

  // Loop through dynamic rows
  ingredientRows.forEach((row) => {
    const name = row.querySelector(".ing-name").value;
    let qty = parseFloat(row.querySelector(".ing-qty").value) || 0;
    const unit = row.querySelector(".ing-unit").value;

    let qtyKg = unit === "g" ? qty / 1000 : qty;

    if (qtyKg > 0) {
      const latestPrice = getLatestPrice(name);
      const rowCost = qtyKg * latestPrice;

      totalQtyKg += qtyKg;
      totalCost += rowCost;

      ingredients.push({ name, qtyKg, latestPrice, rowCost });
    }
  });

  // Roasting Cost Logic
  const isRoasted = document.getElementById("recipe-roasted").checked;
  const roastPricePerKg =
    parseFloat(document.getElementById("recipe-roast-price").value) || 0;

  if (isRoasted) {
    totalCost += roastPricePerKg * totalQtyKg;
  }

  const overallCostPerKg =
    totalQtyKg > 0 ? (totalCost / totalQtyKg).toFixed(2) : 0;

  // Show Preview
  const summaryDiv = document.getElementById("recipe-summary");
  summaryDiv.style.display = "block";
  summaryDiv.innerHTML = `
        <h4>Review Calculation for: ${recipeName}</h4>
        <p><strong>Total Input Quantity:</strong> ${totalQtyKg.toFixed(2)} KG</p>
        <p><strong>Estimated Total Cost:</strong> ₹${totalCost.toFixed(2)}</p>
        <p><strong>Cost per KG:</strong> ₹${overallCostPerKg}</p>
        ${isRoasted ? `<p style="color: #d35400; font-weight: bold;">Includes Roasting Processing (₹${roastPricePerKg}/kg)</p>` : ""}
        <button onclick="saveRecipeFinal('${recipeName}', '${JSON.stringify(ingredients)}', ${isRoasted}, ${roastPricePerKg}, ${totalQtyKg}, ${totalCost})" style="background-color: #27ae60;">Confirm & Save Recipe</button>
    `;
}

function saveRecipeFinal(
  name,
  ingredientsStr,
  isRoasted,
  roastPricePerKg,
  totalQtyKg,
  totalCost,
) {
  const ingredients = JSON.parse(ingredientsStr);

  const recipe = {
    id: Date.now().toString(),
    name,
    ingredients,
    isRoasted,
    roastPricePerKg,
    totalQtyKg,
    totalCost,
    costPerKg: parseFloat((totalCost / totalQtyKg).toFixed(2)),
    lastUpdated: new Date().toISOString().split("T")[0],
  };

  let recipes = getData("recipes");

  // Check if updating existing or adding new
  const existingIndex = recipes.findIndex((r) => r.name === name);
  if (existingIndex > -1) {
    recipes[existingIndex] = recipe;
  } else {
    recipes.push(recipe);
  }

  saveData("recipes", recipes);

  // Add to mfg_products list if it doesn't exist
  let mfgProducts = getData("mfg_products");
  if (!mfgProducts.includes(name)) {
    mfgProducts.push(name);
    saveData("mfg_products", mfgProducts);
  }

  alert("Recipe Saved Successfully!");
  document.getElementById("mfg-recipe-form").style.display = "none";
  document.getElementById("recipe-summary").style.display = "none";

  // Reset inputs
  document.getElementById("recipe-name").value = "";
  document.getElementById("recipe-ingredients").innerHTML = "";
  document.getElementById("recipe-roasted").checked = false;
  toggleRoastPrice();
  addIngredientRow();

  renderRecipes();
}

function renderRecipes() {
  const recipes = getData("recipes");
  const container = document.getElementById("recipe-list");
  container.innerHTML = "";

  recipes.forEach((r) => {
    const ingList = r.ingredients
      .map((i) => `<li>${i.name}: ${i.qtyKg} KG (@ ₹${i.latestPrice}/kg)</li>`)
      .join("");
    const roastBadge = r.isRoasted
      ? `<span style="background: #e67e22; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.8em; margin-left: 10px;">Roasted</span>`
      : "";

    const card = `
            <details style="margin-bottom: 10px; border: 1px solid #ddd;">
                <summary style="display: flex; justify-content: space-between; align-items: center;">
                    <span><strong>${r.name}</strong> (Cost: ₹${r.costPerKg}/kg) ${roastBadge}</span>
                    <button onclick="editRecipe('${r.name}')" style="margin: 0; padding: 5px 10px; width: auto; font-size: 0.9em;">Edit</button>
                </summary>
                <div style="padding: 15px; background: #fff;">
                    <p><strong>Total Input Qty:</strong> ${r.totalQtyKg} KG</p>
                    <p><strong>Overall Cost:</strong> ₹${r.totalCost.toFixed(2)}</p>
                    <p><strong>Last Updated:</strong> ${r.lastUpdated}</p>
                    <hr style="margin: 10px 0;">
                    <h5>Ingredients Breakdown:</h5>
                    <ul>${ingList}</ul>
                </div>
            </details>
        `;
    container.innerHTML += card;
  });
}

function editRecipe(name) {
  alert(
    "Editing functionality can be wired up here to populate the form above with data for: " +
      name,
  );
  // In a full implementation, you'd find the recipe by name, populate the form fields, and open the form.
  toggleRecipeForm();
  document.getElementById("recipe-name").value = name;
}
