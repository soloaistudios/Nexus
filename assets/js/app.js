/* =========================================================
   CAP MARKETPLACE
   APPLICATION ENTRY / MODULE LOADER
   ========================================================= */

import { renderSignup } from "./signup.js";

/**
 * Main application bootstrap.
 *
 * index.html only provides the #app mount point.
 * Individual screens are rendered by their own modules.
 */

const app = document.getElementById("app");

/**
 * Safety check
 */
if (!app) {
  throw new Error("CAP Marketplace: #app mount point was not found.");
}

/**
 * Clear the application container.
 */
function clearApp() {
  app.innerHTML = "";
}

/**
 * Render the initial screen.
 *
 * For the first build, signup is the entry screen.
 * Later we will add routing for:
 * - Sign In
 * - Dashboard
 * - Wallet
 * - Marketplace
 * - Orders
 * - Arbitrage
 */
function startApp() {
  clearApp();
  renderSignup(app);
}

/**
 * Start application
 */
startApp();
