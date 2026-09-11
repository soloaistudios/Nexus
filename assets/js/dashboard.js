/* =========================================================
   CAP MARKETPLACE
   AUTHENTICATED DASHBOARD
   ========================================================= */

import {
  getCurrentAccount,
} from "./auth.js";

import {
  state,
} from "./state.js";


/* =========================================================
   DASHBOARD RENDER
   ========================================================= */

/**
 * Render the authenticated dashboard.
 *
 * The dashboard reads lightweight live values from the
 * central application state while the detailed wallet,
 * marketplace, orders, and arbitrage modules remain
 * responsible for their own screens.
 */
export function renderDashboard(app) {

  const account =
    getCurrentAccount();


  if (!account) {

    throw new Error(
      "CAP Marketplace: no authenticated account was found."
    );
  }


  const firstName =
    account.fullName
      .trim()
      .split(/\s+/)[0] || "User";


  /* -------------------------------------------------------
     LIVE DASHBOARD VALUES
     ------------------------------------------------------- */

  const capBalance =
    getBalance(
      "CAP"
    );


  const availableOffers =
    getMarketplaceOfferCount();


  const activeOrders =
    getActiveOrderCount();


  const opportunities =
    getArbitrageOpportunityCount();


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
              ${formatNumber(
                capBalance
              )}
            </strong>

            <span class="dashboard-card-meta">
              CAP available
            </span>

          </article>


          <article class="dashboard-card">

            <span class="dashboard-card-label">
              Available Offers
            </span>

            <strong class="dashboard-card-value">
              ${formatNumber(
                availableOffers
              )}
            </strong>

            <span class="dashboard-card-meta">
              Live marketplace offers
            </span>

          </article>


          <article class="dashboard-card">

            <span class="dashboard-card-label">
              Active Orders
            </span>

            <strong class="dashboard-card-value">
              ${formatNumber(
                activeOrders
              )}
            </strong>

            <span class="dashboard-card-meta">
              Open P2P transactions
            </span>

          </article>


          <article class="dashboard-card">

            <span class="dashboard-card-label">
              Opportunities
            </span>

            <strong class="dashboard-card-value">
              ${formatNumber(
                opportunities
              )}
            </strong>

            <span class="dashboard-card-meta">
              Arbitrage opportunities
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


            <!-- MARKETPLACE -->

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


            <!-- WALLET -->

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


            <!-- ORDERS -->

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


            <!-- ARBITRAGE -->

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


          ${
            renderRecentActivity()
          }


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


          if (!action) {
            return;
          }


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
   RECENT ACTIVITY
   ========================================================= */

function renderRecentActivity() {

  const activeOrders =
    Array.isArray(
      state.orders?.active
    )
      ? state.orders.active
      : [];


  const completedOrders =
    Array.isArray(
      state.orders?.completed
    )
      ? state.orders.completed
      : [];


  const cancelledOrders =
    Array.isArray(
      state.orders?.cancelled
    )
      ? state.orders.cancelled
      : [];


  const totalOrders =
    activeOrders.length +
    completedOrders.length +
    cancelledOrders.length;


  if (
    totalOrders === 0
  ) {

    return `
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
    `;
  }


  const recentOrders = [
    ...activeOrders,
    ...completedOrders,
    ...cancelledOrders,
  ]
    .sort(
      (a, b) => {

        const aTime =
          new Date(
            a.updatedAt ||
            a.createdAt ||
            0
          ).getTime();

        const bTime =
          new Date(
            b.updatedAt ||
            b.createdAt ||
            0
          ).getTime();

        return bTime - aTime;
      }
    )
    .slice(
      0,
      5
    );


  return `
    <div class="dashboard-activity-list">

      ${recentOrders
        .map(
          renderActivityItem
        )
        .join("")}

    </div>
  `;
}


/* =========================================================
   ACTIVITY ITEM
   ========================================================= */

function renderActivityItem(
  order
) {

  const status =
    String(
      order.status ||
      "active"
    ).toLowerCase();


  const statusLabel =
    status === "completed"
      ? "COMPLETED"
      : status === "cancelled"
        ? "CANCELLED"
        : "ACTIVE";


  const side =
    String(
      order.side ||
      ""
    ).toLowerCase();


  const action =
    side === "buy"
      ? "BUY"
      : side === "sell"
        ? "SELL"
        : "TRADE";


  const asset =
    order.asset ||
    "CAP";


  const createdAt =
    formatDate(
      order.createdAt
    );


  return `
    <article
      class="dashboard-activity-item"
    >

      <div class="dashboard-activity-main">

        <strong>
          ${escapeHtml(
            action
          )}
          ${escapeHtml(
            asset
          )}
        </strong>

        <span>
          ${escapeHtml(
            createdAt
          )}
        </span>

      </div>


      <div class="dashboard-activity-status">

        <span>
          ${escapeHtml(
            statusLabel
          )}
        </span>

      </div>

    </article>
  `;
}


/* =========================================================
   BALANCE HELPERS
   ========================================================= */

function getBalance(
  asset
) {

  const value =
    state.wallet?.balances?.[asset];


  return Number.isFinite(
    Number(value)
  )
    ? Number(value)
    : 0;
}


/* =========================================================
   MARKETPLACE COUNT
   ========================================================= */

function getMarketplaceOfferCount() {

  const offers =
    state.marketplace?.offers;


  if (
    !Array.isArray(offers)
  ) {
    return 0;
  }


  return offers.length;
}


/* =========================================================
   ACTIVE ORDER COUNT
   ========================================================= */

function getActiveOrderCount() {

  const orders =
    state.orders?.active;


  if (
    !Array.isArray(orders)
  ) {
    return 0;
  }


  return orders.length;
}


/* =========================================================
   ARBITRAGE OPPORTUNITY COUNT
   ========================================================= */

function getArbitrageOpportunityCount() {

  const opportunities =
    state.arbitrage?.opportunities;


  if (
    !Array.isArray(opportunities)
  ) {
    return 0;
  }


  return opportunities.length;
}


/* =========================================================
   NUMBER FORMATTING
   ========================================================= */

function formatNumber(
  value
) {

  return new Intl.NumberFormat(
    undefined,
    {
      maximumFractionDigits: 8,
    }
  ).format(
    Number(value) || 0
  );
}


/* =========================================================
   DATE FORMATTING
   ========================================================= */

function formatDate(
  value
) {

  if (!value) {
    return "Recently";
  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Recently";
  }


  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(
    date
  );
}


/* =========================================================
   HTML ESCAPING
   ========================================================= */

function escapeHtml(
  value
) {

  return String(value)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}
