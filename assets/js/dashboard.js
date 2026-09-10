/* =========================================================
   CAP MARKETPLACE
   AUTHENTICATED DASHBOARD
   ========================================================= */

import { getCurrentAccount } from "./auth.js";


/**
 * Render the authenticated dashboard.
 *
 * This module currently provides the application shell.
 * Real wallet, marketplace, order, and arbitrage data will
 * be connected through their own modules later.
 */
export function renderDashboard(app) {
  const account = getCurrentAccount();

  if (!account) {
    throw new Error(
      "CAP Marketplace: no authenticated account was found."
    );
  }

  const firstName =
    account.fullName
      .trim()
      .split(/\s+/)[0] || "User";


  app.innerHTML = `
    <section class="dashboard-page">

      <!-- =================================================
           HEADER
           ================================================= -->

      <header class="dashboard-header">

        <div class="dashboard-brand">

          <img
            class="dashboard-logo"
            src="assets/icons/cap-logo.png"
            alt="CAP Marketplace"
          />

          <div class="dashboard-brand-text">

            <strong>
              CAP Marketplace
            </strong>

            <span>
              P2P Opportunity Exchange
            </span>

          </div>

        </div>


        <div class="dashboard-account">

          <div
            class="dashboard-avatar"
            aria-hidden="true"
          >
            ${escapeHtml(
              firstName.charAt(0).toUpperCase()
            )}
          </div>


          <div class="dashboard-account-info">

            <strong>
              ${escapeHtml(firstName)}
            </strong>

            <span>
              ${escapeHtml(account.email)}
            </span>

          </div>

        </div>

      </header>


      <!-- =================================================
           MAIN
           ================================================= -->

      <main class="dashboard-main">


        <!-- =================================================
             WELCOME
             ================================================= -->

        <section class="dashboard-welcome">

          <div>

            <span class="dashboard-eyebrow">
              MARKETPLACE
            </span>

            <h1>
              Welcome, ${escapeHtml(firstName)}
            </h1>

            <p>
              Your opportunity workspace is ready.
            </p>

          </div>

        </section>


        <!-- =================================================
             OVERVIEW
             ================================================= -->

        <section
          class="dashboard-overview"
          aria-label="Account overview"
        >


          <article class="dashboard-card">

            <span class="dashboard-card-label">
              CAP Balance
            </span>

            <strong class="dashboard-card-value">
              0.00
            </strong>

            <span class="dashboard-card-meta">
              CAP
            </span>

          </article>


          <article class="dashboard-card">

            <span class="dashboard-card-label">
              Available Offers
            </span>

            <strong class="dashboard-card-value">
              0
            </strong>

            <span class="dashboard-card-meta">
              Marketplace not connected
            </span>

          </article>


          <article class="dashboard-card">

            <span class="dashboard-card-label">
              Active Orders
            </span>

            <strong class="dashboard-card-value">
              0
            </strong>

            <span class="dashboard-card-meta">
              No active orders
            </span>

          </article>


          <article class="dashboard-card">

            <span class="dashboard-card-label">
              Opportunities
            </span>

            <strong class="dashboard-card-value">
              0
            </strong>

            <span class="dashboard-card-meta">
              Arbitrage engine not connected
            </span>

          </article>

        </section>


        <!-- =================================================
             QUICK ACTIONS
             ================================================= -->

        <section class="dashboard-section">

          <div class="dashboard-section-heading">

            <div>

              <span class="dashboard-eyebrow">
                GET STARTED
              </span>

              <h2>
                Opportunity workspace
              </h2>

            </div>

          </div>


          <div class="dashboard-actions">


            <button
              type="button"
              class="dashboard-action"
              data-action="marketplace"
            >

              <span
                class="dashboard-action-icon"
                aria-hidden="true"
              >
                M
              </span>

              <span>

                <strong>
                  Marketplace
                </strong>

                <small>
                  Explore P2P CAP offers
                </small>

              </span>

            </button>


            <button
              type="button"
              class="dashboard-action"
              data-action="wallet"
            >

              <span
                class="dashboard-action-icon"
                aria-hidden="true"
              >
                W
              </span>

              <span>

                <strong>
                  Wallet
                </strong>

                <small>
                  Manage balances and assets
                </small>

              </span>

            </button>


            <button
              type="button"
              class="dashboard-action"
              data-action="orders"
            >

              <span
                class="dashboard-action-icon"
                aria-hidden="true"
              >
                O
              </span>

              <span>

                <strong>
                  Orders
                </strong>

                <small>
                  Track your P2P transactions
                </small>

              </span>

            </button>


            <button
              type="button"
              class="dashboard-action"
              data-action="arbitrage"
            >

              <span
                class="dashboard-action-icon"
                aria-hidden="true"
              >
                A
              </span>

              <span>

                <strong>
                  Arbitrage
                </strong>

                <small>
                  Discover pricing opportunities
                </small>

              </span>

            </button>


          </div>

        </section>


        <!-- =================================================
             ACTIVITY
             ================================================= -->

        <section class="dashboard-section">

          <div class="dashboard-section-heading">

            <div>

              <span class="dashboard-eyebrow">
                ACTIVITY
              </span>

              <h2>
                Recent activity
              </h2>

            </div>

          </div>


          <div class="dashboard-empty">

            <div
              class="dashboard-empty-icon"
              aria-hidden="true"
            >
              —
            </div>

            <h3>
              No activity yet
            </h3>

            <p>
              Your marketplace activity will appear here
              once you begin using the platform.
            </p>

          </div>

        </section>


      </main>


      <!-- =================================================
           FOOTER
           ================================================= -->

      <footer class="dashboard-footer">

        <span>
          CAP Marketplace
        </span>

        <span>
          Frontend prototype
        </span>

      </footer>

    </section>
  `;


  attachDashboardEvents();
}


/* =========================================================
   DASHBOARD ACTION EVENTS
   ========================================================= */

function attachDashboardEvents() {

  const actionButtons =
    document.querySelectorAll(
      ".dashboard-action"
    );


  actionButtons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const action =
            button.dataset.action;


          window.dispatchEvent(
            new CustomEvent(
              "cap:dashboard-action",
              {
                detail: {
                  action,
                },
              }
            )
          );

        }
      );

    }
  );
}


/* =========================================================
   HTML ESCAPING
   ========================================================= */

function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
