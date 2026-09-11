/* =========================================================
   CAP MARKETPLACE
   ORDERS MODULE
   ========================================================= */

import {
  state,
} from "./state.js";

import {
  getCurrentAccount,
} from "./auth.js";


/* =========================================================
   RENDER ORDERS
   ========================================================= */

export function renderOrders(app) {

  if (!app) {

    throw new Error(
      "CAP Marketplace: orders requires an app mount point."
    );
  }


  const account =
    getCurrentAccount();


  if (!account) {

    throw new Error(
      "CAP Marketplace: orders requires an authenticated account."
    );
  }


  ensureOrdersState();


  const firstName =
    account.fullName
      .trim()
      .split(/\s+/)[0] || "User";


  app.innerHTML = `
    <section class="orders-page">

      <!-- =================================================
           HEADER
           ================================================= -->

      <header class="orders-header">

        <div class="orders-header-left">

          <button
            type="button"
            class="orders-back-button"
            id="orders-back"
            aria-label="Back to dashboard"
          >
            ←
          </button>

          <div class="orders-header-title">

            <span class="orders-eyebrow">
              CAP MARKETPLACE
            </span>

            <h1>
              Orders
            </h1>

            <p>
              Track your active, completed, and cancelled
              P2P marketplace transactions.
            </p>

          </div>

        </div>


        <div class="orders-account">

          <span>
            ${escapeHtml(firstName)}
          </span>

          <div
            class="orders-avatar"
            aria-hidden="true"
          >
            ${escapeHtml(
              firstName
                .charAt(0)
                .toUpperCase()
            )}
          </div>

        </div>

      </header>


      <!-- =================================================
           MAIN
           ================================================= -->

      <main class="orders-main">


        <!-- =================================================
             SUMMARY
             ================================================= -->

        <section class="orders-summary-grid">

          <article class="orders-summary-card">

            <span class="orders-summary-label">
              ACTIVE
            </span>

            <strong
              id="orders-active-count"
              class="orders-summary-value"
            >
              0
            </strong>

            <span class="orders-summary-meta">
              Open reservations
            </span>

          </article>


          <article class="orders-summary-card">

            <span class="orders-summary-label">
              COMPLETED
            </span>

            <strong
              id="orders-completed-count"
              class="orders-summary-value"
            >
              0
            </strong>

            <span class="orders-summary-meta">
              Settled orders
            </span>

          </article>


          <article class="orders-summary-card">

            <span class="orders-summary-label">
              CANCELLED
            </span>

            <strong
              id="orders-cancelled-count"
              class="orders-summary-value"
            >
              0
            </strong>

            <span class="orders-summary-meta">
              Closed without completion
            </span>

          </article>


          <article class="orders-summary-card">

            <span class="orders-summary-label">
              TOTAL
            </span>

            <strong
              id="orders-total-count"
              class="orders-summary-value"
            >
              0
            </strong>

            <span class="orders-summary-meta">
              All order records
            </span>

          </article>

        </section>


        <!-- =================================================
             FILTERS
             ================================================= -->

        <section class="orders-controls">

          <div>

            <span class="orders-eyebrow">
              ORDER BOOK
            </span>

            <h2>
              Your transactions
            </h2>

          </div>


          <div
            class="orders-tabs"
            role="tablist"
            aria-label="Order status"
          >

            <button
              type="button"
              class="orders-tab is-active"
              data-orders-tab="active"
              role="tab"
              aria-selected="true"
            >
              Active
            </button>


            <button
              type="button"
              class="orders-tab"
              data-orders-tab="completed"
              role="tab"
              aria-selected="false"
            >
              Completed
            </button>


            <button
              type="button"
              class="orders-tab"
              data-orders-tab="cancelled"
              role="tab"
              aria-selected="false"
            >
              Cancelled
            </button>

          </div>

        </section>


        <!-- =================================================
             ORDER LIST
             ================================================= -->

        <section class="orders-list-section">

          <div
            id="orders-list"
            class="orders-list"
            role="list"
            aria-live="polite"
          ></div>

        </section>


        <!-- =================================================
             INFORMATION
             ================================================= -->

        <section class="orders-info-panel">

          <div class="orders-info-icon">
            i
          </div>

          <div>

            <strong>
              Order reservations
            </strong>

            <p>
              Active orders keep the payment or CAP amount
              reserved until the order is completed or cancelled.
            </p>

          </div>

        </section>

      </main>


      <!-- =================================================
           FOOTER
           ================================================= -->

      <footer class="orders-footer">

        <span>
          CAP Marketplace
        </span>

        <span>
          Orders module
        </span>

      </footer>

    </section>
  `;


  attachOrdersEvents();

  renderOrdersList();

  updateOrdersSummary();
}


/* =========================================================
   INITIALIZE ORDER STATE
   ========================================================= */

function ensureOrdersState() {

  if (
    !state.orders ||
    typeof state.orders !== "object"
  ) {

    state.orders = {
      active: [],
      completed: [],
      cancelled: [],
    };
  }


  if (
    !Array.isArray(
      state.orders.active
    )
  ) {

    state.orders.active = [];
  }


  if (
    !Array.isArray(
      state.orders.completed
    )
  ) {

    state.orders.completed = [];
  }


  if (
    !Array.isArray(
      state.orders.cancelled
    )
  ) {

    state.orders.cancelled = [];
  }
}


/* =========================================================
   CURRENT TAB
   ========================================================= */

let currentTab =
  "active";


/* =========================================================
   ORDERS EVENTS
   ========================================================= */

function attachOrdersEvents() {

  const backButton =
    document.getElementById(
      "orders-back"
    );


  backButton?.addEventListener(
    "click",
    () => {

      window.dispatchEvent(
        new CustomEvent(
          "cap:orders-dashboard-requested"
        )
      );
    }
  );


  const tabs =
    document.querySelectorAll(
      "[data-orders-tab]"
    );


  tabs.forEach(
    (tab) => {

      tab.addEventListener(
        "click",
        () => {

          const requestedTab =
            tab.dataset.ordersTab;


          if (
            requestedTab !== "active" &&
            requestedTab !== "completed" &&
            requestedTab !== "cancelled"
          ) {
            return;
          }


          currentTab =
            requestedTab;


          tabs.forEach(
            (item) => {

              const active =
                item.dataset.ordersTab ===
                currentTab;


              item.classList.toggle(
                "is-active",
                active
              );


              item.setAttribute(
                "aria-selected",
                String(active)
              );
            }
          );


          renderOrdersList();
        }
      );
    }
  );
}


/* =========================================================
   RENDER ORDER LIST
   ========================================================= */

function renderOrdersList() {

  ensureOrdersState();


  const container =
    document.getElementById(
      "orders-list"
    );


  if (!container) {
    return;
  }


  const orders =
    Array.isArray(
      state.orders[currentTab]
    )
      ? state.orders[currentTab]
      : [];


  const sortedOrders =
    [...orders].sort(
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
    );


  if (!sortedOrders.length) {

    container.innerHTML =
      renderEmptyState(
        currentTab
      );

    return;
  }


  container.innerHTML =
    sortedOrders
      .map(
        renderOrderCard
      )
      .join("");


  attachOrderCardEvents();
}


/* =========================================================
   EMPTY STATE
   ========================================================= */

function renderEmptyState(
  tab
) {

  const titles = {

    active:
      "No active orders",

    completed:
      "No completed orders",

    cancelled:
      "No cancelled orders",

  };


  const messages = {

    active:
      "Orders created from the Marketplace will appear here.",

    completed:
      "Completed P2P transactions will appear here.",

    cancelled:
      "Cancelled orders will appear here.",

  };


  return `
    <div class="orders-empty">

      <div
        class="orders-empty-icon"
        aria-hidden="true"
      >
        —
      </div>

      <h3>
        ${escapeHtml(
          titles[tab]
        )}
      </h3>

      <p>
        ${escapeHtml(
          messages[tab]
        )}
      </p>

    </div>
  `;
}


/* =========================================================
   ORDER CARD
   ========================================================= */

function renderOrderCard(
  order
) {

  const side =
    String(
      order.side ||
      ""
    ).toLowerCase();


  const sideLabel =
    side === "buy"
      ? "BUY CAP"
      : side === "sell"
        ? "SELL CAP"
        : "TRADE";


  const sideClass =
    side === "buy"
      ? "is-buy"
      : "is-sell";


  const status =
    getOrderStatus(
      order
    );


  const statusClass =
    status === "active"
      ? "is-active"
      : status === "completed"
        ? "is-completed"
        : "is-cancelled";


  const reservationAsset =
    order.reservation?.asset ||
    (
      side === "buy"
        ? order.quote
        : order.asset
    );


  const reservationAmount =
    Number(
      order.reservation?.amount
    ) ||
    (
      side === "buy"
        ? Number(order.quoteAmount) || 0
        : Number(order.amount) || 0
    );


  const actionButtons =
    currentTab === "active"

      ? `
        <button
          type="button"
          class="orders-secondary-button"
          data-order-cancel="${escapeHtml(
            order.id
          )}"
        >
          Cancel
        </button>

        <button
          type="button"
          class="orders-primary-button"
          data-order-complete="${escapeHtml(
            order.id
          )}"
        >
          Mark Complete
        </button>
      `

      : `
        <button
          type="button"
          class="orders-secondary-button"
          data-order-details="${escapeHtml(
            order.id
          )}"
        >
          View details
        </button>
      `;


  return `
    <article
      class="orders-card"
      role="listitem"
      data-order-card="${escapeHtml(
        order.id
      )}"
    >

      <!-- =================================================
           TOP
           ================================================= -->

      <div class="orders-card-top">

        <div>

          <span class="orders-order-id">
            ${escapeHtml(
              order.id
            )}
          </span>

          <h3>
            ${escapeHtml(
              sideLabel
            )}
          </h3>

        </div>


        <div class="orders-status-group">

          <span
            class="
              orders-side-badge
              ${sideClass}
            "
          >
            ${escapeHtml(
              sideLabel
            )}
          </span>

          <span
            class="
              orders-status-badge
              ${statusClass}
            "
          >
            ${escapeHtml(
              status.toUpperCase()
            )}
          </span>

        </div>

      </div>


      <!-- =================================================
           COUNTERPARTY
           ================================================= -->

      <div class="orders-counterparty">

        <div class="orders-counterparty-main">

          <span class="orders-label">
            COUNTERPARTY
          </span>

          <strong>
            ${escapeHtml(
              order.trader ||
              "Unknown trader"
            )}
          </strong>

        </div>


        <div class="orders-counterparty-main">

          <span class="orders-label">
            CREATED
          </span>

          <strong>
            ${escapeHtml(
              formatDate(
                order.createdAt
              )
            )}
          </strong>

        </div>

      </div>


      <!-- =================================================
           DETAILS
           ================================================= -->

      <div class="orders-details-grid">

        <div class="orders-detail">

          <span>
            ASSET
          </span>

          <strong>
            ${escapeHtml(
              order.amount
            )}
            ${escapeHtml(
              order.asset
            )}
          </strong>

        </div>


        <div class="orders-detail">

          <span>
            RATE
          </span>

          <strong>
            ${formatRate(
              order.rate
            )}
            ${escapeHtml(
              order.quote
            )}
          </strong>

        </div>


        <div class="orders-detail">

          <span>
            TOTAL
          </span>

          <strong>
            ${formatNumber(
              order.quoteAmount
            )}
            ${escapeHtml(
              order.quote
            )}
          </strong>

        </div>


        <div class="orders-detail">

          <span>
            NETWORK
          </span>

          <strong>
            ${escapeHtml(
              order.network ||
              "—"
            )}
          </strong>

        </div>

      </div>


      <!-- =================================================
           RESERVATION
           ================================================= -->

      <div class="orders-reservation">

        <span>
          RESERVED
        </span>

        <strong>
          ${formatNumber(
            reservationAmount
          )}
          ${escapeHtml(
            reservationAsset
          )}
        </strong>

      </div>


      <!-- =================================================
           ACTIONS
           ================================================= -->

      <div class="orders-card-actions">

        ${actionButtons}

      </div>

    </article>
  `;
}


/* =========================================================
   ORDER CARD EVENTS
   ========================================================= */

function attachOrderCardEvents() {

  const cancelButtons =
    document.querySelectorAll(
      "[data-order-cancel]"
    );


  cancelButtons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          cancelOrder(
            button.dataset.orderCancel
          );
        }
      );
    }
  );


  const completeButtons =
    document.querySelectorAll(
      "[data-order-complete]"
    );


  completeButtons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          completeOrder(
            button.dataset.orderComplete
          );
        }
      );
    }
  );


  const detailButtons =
    document.querySelectorAll(
      "[data-order-details]"
    );


  detailButtons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          showOrderDetails(
            button.dataset.orderDetails
          );
        }
      );
    }
  );
}


/* =========================================================
   CANCEL ORDER
   ========================================================= */

/**
 * Cancelling an active order returns the user's reserved
 * funds to the available balance.
 *
 * No counterparty settlement occurs.
 */
function cancelOrder(
  orderId
) {

  ensureOrdersState();


  const index =
    state.orders.active.findIndex(
      (order) =>
        String(order.id) ===
        String(orderId)
    );


  if (
    index === -1
  ) {

    showOrdersNotice(
      "Active order could not be found."
    );

    return;
  }


  const order =
    state.orders.active[index];


  const reservation =
    getOrderReservation(
      order
    );


  if (
    reservation.amount > 0 &&
    reservation.asset
  ) {

    releaseReservedBalance(
      reservation.asset,
      reservation.amount
    );
  }


  const now =
    new Date().toISOString();


  const cancelledOrder = {

    ...order,

    status:
      "cancelled",

    updatedAt:
      now,

    reservation: {

      ...order.reservation,

      status:
        "released",

      releasedAt:
        now,
    },
  };


  state.orders.active.splice(
    index,
    1
  );


  state.orders.cancelled.unshift(
    cancelledOrder
  );


  renderOrdersList();

  updateOrdersSummary();


  window.dispatchEvent(
    new CustomEvent(
      "cap:order-cancelled",
      {
        detail: {
          order:
            cancelledOrder,
        },
      }
    )
  );


  showOrdersNotice(
    `Order ${order.id} cancelled. Reserved funds released.`
  );
}


/* =========================================================
   COMPLETE ORDER
   ========================================================= */

/**
 * Frontend settlement simulation.
 *
 * The current prototype only tracks the user's wallet side.
 * Therefore completion consumes the user's reserved payment
 * and credits the asset received by the user.
 *
 * This should be replaced by the real escrow/counterparty
 * settlement layer when that module is added.
 */
function completeOrder(
  orderId
) {

  ensureOrdersState();


  const index =
    state.orders.active.findIndex(
      (order) =>
        String(order.id) ===
        String(orderId)
    );


  if (
    index === -1
  ) {

    showOrdersNotice(
      "Active order could not be found."
    );

    return;
  }


  const order =
    state.orders.active[index];


  const reservation =
    getOrderReservation(
      order
    );


  try {

    /*
     * Consume the user's reserved payment/CAP.
     */
    if (
      reservation.amount > 0 &&
      reservation.asset
    ) {

      consumeReservedBalance(
        reservation.asset,
        reservation.amount
      );
    }


    /*
     * BUY CAP:
     * user receives CAP.
     *
     * SELL CAP:
     * user receives quote currency.
     */
    if (
      order.side === "buy"
    ) {

      creditAvailableBalance(
        order.asset,
        Number(order.amount) || 0
      );

    } else {

      creditAvailableBalance(
        order.quote,
        Number(order.quoteAmount) || 0
      );
    }


    const now =
      new Date().toISOString();


    const completedOrder = {

      ...order,

      status:
        "completed",

      updatedAt:
        now,

      reservation: {

        ...order.reservation,

        status:
          "consumed",

        completedAt:
          now,
      },
    };


    state.orders.active.splice(
      index,
      1
    );


    state.orders.completed.unshift(
      completedOrder
    );


    renderOrdersList();

    updateOrdersSummary();


    window.dispatchEvent(
      new CustomEvent(
        "cap:order-completed",
        {
          detail: {
            order:
              completedOrder,
          },
        }
      )
    );


    showOrdersNotice(
      `Order ${order.id} completed and settlement simulated.`
    );

  } catch (error) {

    console.error(
      "CAP: order completion failed.",
      error
    );


    showOrdersNotice(
      error?.message ||
      "Order could not be completed."
    );
  }
}


/* =========================================================
   ORDER DETAILS
   ========================================================= */

function showOrderDetails(
  orderId
) {

  const allOrders = [

    ...state.orders.active,

    ...state.orders.completed,

    ...state.orders.cancelled,

  ];


  const order =
    allOrders.find(
      (item) =>
        String(item.id) ===
        String(orderId)
    );


  if (!order) {

    showOrdersNotice(
      "Order details could not be found."
    );

    return;
  }


  const reservation =
    getOrderReservation(
      order
    );


  showOrdersNotice(
    `${order.id} • ${order.trader} • ${formatNumber(
      order.amount
    )} ${order.asset} • Reserved ${formatNumber(
      reservation.amount
    )} ${reservation.asset}`
  );
}


/* =========================================================
   RESERVATION LOOKUP
   ========================================================= */

function getOrderReservation(
  order
) {

  const asset =
    order.reservation?.asset ||
    (
      order.side === "buy"
        ? order.quote
        : order.asset
    );


  const amount =
    Number(
      order.reservation?.amount
    ) ||
    (
      order.side === "buy"
        ? Number(order.quoteAmount) || 0
        : Number(order.amount) || 0
    );


  return {
    asset,

    amount,
  };
}


/* =========================================================
   RELEASE RESERVED BALANCE
   ========================================================= */

function releaseReservedBalance(
  asset,
  amount
) {

  if (
    !state.wallet ||
    !state.wallet.reserved ||
    !state.wallet.balances
  ) {

    throw new Error(
      "CAP Orders: wallet state is unavailable."
    );
  }


  const reserved =
    Number(
      state.wallet.reserved[asset]
    ) || 0;


  if (
    amount > reserved
  ) {

    throw new Error(
      `CAP Orders: reserved ${asset} balance is insufficient.`
    );
  }


  state.wallet.reserved[asset] =
    reserved -
    amount;


  state.wallet.balances[asset] =
    (
      Number(
        state.wallet.balances[asset]
      ) || 0
    ) + amount;
}


/* =========================================================
   CONSUME RESERVED BALANCE
   ========================================================= */

function consumeReservedBalance(
  asset,
  amount
) {

  if (
    !state.wallet ||
    !state.wallet.reserved
  ) {

    throw new Error(
      "CAP Orders: wallet state is unavailable."
    );
  }


  const reserved =
    Number(
      state.wallet.reserved[asset]
    ) || 0;


  if (
    amount > reserved
  ) {

    throw new Error(
      `CAP Orders: reserved ${asset} balance is insufficient.`
    );
  }


  state.wallet.reserved[asset] =
    reserved -
    amount;
}


/* =========================================================
   CREDIT AVAILABLE BALANCE
   ========================================================= */

function creditAvailableBalance(
  asset,
  amount
) {

  if (
    !state.wallet ||
    !state.wallet.balances
  ) {

    throw new Error(
      "CAP Orders: wallet state is unavailable."
    );
  }


  const value =
    Number(
      amount
    );


  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {

    return;
  }


  state.wallet.balances[asset] =
    (
      Number(
        state.wallet.balances[asset]
      ) || 0
    ) + value;
}


/* =========================================================
   STATUS
   ========================================================= */

function getOrderStatus(
  order
) {

  const explicit =
    String(
      order?.status ||
      ""
    ).toLowerCase();


  if (
    explicit === "completed"
  ) {
    return "completed";
  }


  if (
    explicit === "cancelled"
  ) {
    return "cancelled";
  }


  return "active";
}


/* =========================================================
   SUMMARY
   ========================================================= */

function updateOrdersSummary() {

  ensureOrdersState();


  const activeCount =
    state.orders.active.length;


  const completedCount =
    state.orders.completed.length;


  const cancelledCount =
    state.orders.cancelled.length;


  const totalCount =
    activeCount +
    completedCount +
    cancelledCount;


  const activeElement =
    document.getElementById(
      "orders-active-count"
    );


  const completedElement =
    document.getElementById(
      "orders-completed-count"
    );


  const cancelledElement =
    document.getElementById(
      "orders-cancelled-count"
    );


  const totalElement =
    document.getElementById(
      "orders-total-count"
    );


  if (activeElement) {

    activeElement.textContent =
      String(
        activeCount
      );
  }


  if (completedElement) {

    completedElement.textContent =
      String(
        completedCount
      );
  }


  if (cancelledElement) {

    cancelledElement.textContent =
      String(
        cancelledCount
      );
  }


  if (totalElement) {

    totalElement.textContent =
      String(
        totalCount
      );
  }
}


/* =========================================================
   NOTICE
   ========================================================= */

function showOrdersNotice(
  message
) {

  let notice =
    document.getElementById(
      "orders-notice"
    );


  if (!notice) {

    notice =
      document.createElement(
        "div"
      );

    notice.id =
      "orders-notice";

    notice.className =
      "orders-notice";

    document.body.appendChild(
      notice
    );
  }


  notice.textContent =
    message;


  requestAnimationFrame(
    () => {

      notice.classList.add(
        "is-visible"
      );
    }
  );


  window.clearTimeout(
    notice._timeout
  );


  notice._timeout =
    window.setTimeout(
      () => {

        notice.classList.remove(
          "is-visible"
        );

      },
      3200
    );
}


/* =========================================================
   DATE FORMAT
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
    "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(
    date
  );
}


/* =========================================================
   NUMBER FORMAT
   ========================================================= */

function formatNumber(
  value
) {

  const numeric =
    Number(
      value
    );


  if (
    !Number.isFinite(
      numeric
    )
  ) {

    return "0";
  }


  return new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits: 8,
    }
  ).format(
    numeric
  );
}


/* =========================================================
   RATE FORMAT
   ========================================================= */

function formatRate(
  value
) {

  const numeric =
    Number(
      value
    );


  if (
    !Number.isFinite(
      numeric
    )
  ) {

    return "0.0000";
  }


  return numeric.toFixed(
    4
  );
}


/* =========================================================
   HTML ESCAPING
   ========================================================= */

function escapeHtml(
  value
) {

  return String(
    value ?? ""
  )
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


/* =========================================================
   MODULE SAFETY
   ========================================================= */

ensureOrdersState();
