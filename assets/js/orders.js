/* =========================================================
CAP MARKETPLACE
ORDERS SCREEN
========================================================= */

import {
state,
} from "./state.js";

import {
getCurrentAccount,
} from "./auth.js";

import {
releaseReservedBalance,
} from "./wallet.js";

/* =========================================================
ORDERS RENDER
========================================================= */

export function renderOrders(app) {

const account =
getCurrentAccount();

if (!account) {

throw new Error(
  "CAP Marketplace: orders requires an authenticated account."
);

}

ensureOrderCollections();

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
        data-orders-action="dashboard"
        aria-label="Back to dashboard"
      >
        ←
      </button>


      <div class="orders-header-title">

        <span class="orders-eyebrow">
          ACCOUNT
        </span>

        <h1>
          Orders
        </h1>

        <p>
          Track your P2P transactions and reservations.
        </p>

      </div>

    </div>


    <div class="orders-header-account">

      <span class="orders-user-name">
        ${escapeHtml(
          getFirstName(account.fullName)
        )}
      </span>

      <div
        class="orders-avatar"
        aria-hidden="true"
      >
        ${escapeHtml(
          getInitial(
            getFirstName(account.fullName)
          )
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

    <section
      class="orders-summary"
      aria-label="Order summary"
    >

      <article class="orders-summary-card">

        <span class="orders-summary-label">
          ACTIVE
        </span>

        <strong
          class="orders-summary-value"
          id="orders-active-count"
        >
          ${state.orders.active.length}
        </strong>

      </article>


      <article class="orders-summary-card">

        <span class="orders-summary-label">
          COMPLETED
        </span>

        <strong
          class="orders-summary-value"
          id="orders-completed-count"
        >
          ${state.orders.completed.length}
        </strong>

      </article>


      <article class="orders-summary-card">

        <span class="orders-summary-label">
          CANCELLED
        </span>

        <strong
          class="orders-summary-value"
          id="orders-cancelled-count"
        >
          ${state.orders.cancelled.length}
        </strong>

      </article>

    </section>


    <!-- =================================================
         FILTERS
         ================================================= -->

    <section class="orders-filter-panel">

      <div class="orders-filter-heading">

        <div>

          <span class="orders-eyebrow">
            ORDER BOOK
          </span>

          <h2>
            Your transactions
          </h2>

        </div>

      </div>


      <div
        class="orders-tabs"
        role="tablist"
        aria-label="Order status"
      >

        <button
          type="button"
          class="orders-tab is-active"
          data-orders-filter="active"
          role="tab"
          aria-selected="true"
        >
          Active
        </button>


        <button
          type="button"
          class="orders-tab"
          data-orders-filter="completed"
          role="tab"
          aria-selected="false"
        >
          Completed
        </button>


        <button
          type="button"
          class="orders-tab"
          data-orders-filter="cancelled"
          role="tab"
          aria-selected="false"
        >
          Cancelled
        </button>


        <button
          type="button"
          class="orders-tab"
          data-orders-filter="all"
          role="tab"
          aria-selected="false"
        >
          All
        </button>

      </div>

    </section>


    <!-- =================================================
         ORDER LIST
         ================================================= -->

    <section
      class="orders-list-section"
      aria-label="Orders"
    >

      <div
        id="orders-list"
        class="orders-list"
        aria-live="polite"
      ></div>

    </section>

  </main>


  <!-- =================================================
       FOOTER
       ================================================= -->

  <footer class="orders-footer">

    <button
      type="button"
      class="orders-secondary-button"
      data-orders-action="marketplace"
    >
      Back to Marketplace
    </button>


    <span>
      CAP Marketplace
    </span>

  </footer>

</section>

`;

attachOrdersEvents();
renderOrderList("active");
}

/* =========================================================
COLLECTION SAFETY
========================================================= */

function ensureOrderCollections() {

if (!state.orders ||
typeof state.orders !== "object") {

state.orders = {
  active: [],
  completed: [],
  cancelled: [],
};

}

if (!Array.isArray(state.orders.active)) {
state.orders.active = [];
}

if (!Array.isArray(state.orders.completed)) {
state.orders.completed = [];
}

if (!Array.isArray(state.orders.cancelled)) {
state.orders.cancelled = [];
}

}

/* =========================================================
EVENTS
========================================================= */

function attachOrdersEvents() {

const filterButtons =
document.querySelectorAll(
"[data-orders-filter]"
);

filterButtons.forEach(
(button) => {

  button.addEventListener(
    "click",
    () => {

      const filter =
        button.dataset.ordersFilter ||
        "active";


      filterButtons.forEach(
        (item) => {

          const isActive =
            item === button;


          item.classList.toggle(
            "is-active",
            isActive
          );


          item.setAttribute(
            "aria-selected",
            String(isActive)
          );

        }
      );


      renderOrderList(
        filter
      );

    }
  );

}

);

const actionButtons =
document.querySelectorAll(
"[data-orders-action]"
);

actionButtons.forEach(
(button) => {

  button.addEventListener(
    "click",
    () => {

      const action =
        button.dataset.ordersAction;


      if (
        action === "dashboard"
      ) {

        window.dispatchEvent(
          new CustomEvent(
            "cap:orders-dashboard-requested"
          )
        );

        return;
      }


      if (
        action === "marketplace"
      ) {

        window.dispatchEvent(
          new CustomEvent(
            "cap:orders-marketplace-requested"
          )
        );

      }

    }
  );

}

);

const orderList =
document.getElementById(
"orders-list"
);

orderList?.addEventListener(
"click",
handleDynamicOrderAction
);

}

/* =========================================================
DYNAMIC ORDER ACTIONS
========================================================= */

function handleDynamicOrderAction(
event
) {

const target =
event.target.closest(
"[data-order-id][data-order-action]"
);

if (!target) {
return;
}

const orderId =
target.dataset.orderId;

const action =
target.dataset.orderAction;

if (!orderId || !action) {
return;
}

if (
action === "cancel"
) {

cancelOrder(
  orderId
);

}

}

/* =========================================================
ORDER LIST
========================================================= */

function renderOrderList(
filter
) {

const container =
document.getElementById(
"orders-list"
);

if (!container) {
return;
}

const orders =
getOrdersForFilter(
filter
);

if (orders.length === 0) {

container.innerHTML =
  renderEmptyState(
    filter
  );

return;

}

container.innerHTML =
orders
.sort(
sortOrdersByDate
)
.map(
renderOrderCard
)
.join("");

}

/* =========================================================
FILTER
========================================================= */

function getOrdersForFilter(
filter
) {

switch (filter) {

case "completed":

  return state.orders.completed.map(
    (order) => ({
      order,
      statusGroup: "completed",
    })
  );


case "cancelled":

  return state.orders.cancelled.map(
    (order) => ({
      order,
      statusGroup: "cancelled",
    })
  );


case "all":

  return [
    ...state.orders.active.map(
      (order) => ({
        order,
        statusGroup: "active",
      })
    ),

    ...state.orders.completed.map(
      (order) => ({
        order,
        statusGroup: "completed",
      })
    ),

    ...state.orders.cancelled.map(
      (order) => ({
        order,
        statusGroup: "cancelled",
      })
    ),
  ];


case "active":

default:

  return state.orders.active.map(
    (order) => ({
      order,
      statusGroup: "active",
    })
  );

}

}

/* =========================================================
ORDER CARD
========================================================= */

function renderOrderCard(
entry
) {

const order =
entry.order;

const statusGroup =
entry.statusGroup;

const status =
normalizeStatus(
order.status
);

const side =
normalizeSide(
order.side
);

const action =
side === "buy"
? "BUY"
: side === "sell"
? "SELL"
: "TRADE";

const asset =
order.asset ||
"CAP";

const quote =
order.quote ||
"USDT";

const amount =
Number(
order.amount
) || 0;

const quoteAmount =
Number(
order.quoteAmount
) || 0;

const rate =
Number(
order.rate
) || 0;

const network =
order.network ||
"CAP Network";

const trader =
order.trader ||
"Counterparty";

const createdAt =
formatDate(
order.createdAt
);

const orderId =
order.id ||
"unknown";

const reservation =
order.reservation;

const reservationLabel =
reservation &&
reservation.asset

  ? `${formatNumber(
      reservation.amount
    )} ${escapeHtml(
      reservation.asset
    )}`

  : "None";

return `
<article
class="orders-card"
data-order-card="${escapeHtml(
orderId
)}"
>

  <div class="orders-card-top">

    <div class="orders-card-heading">

      <span class="orders-side-badge">
        ${escapeHtml(action)}
      </span>

      <div>

        <strong class="orders-card-title">
          ${escapeHtml(asset)}
          / ${escapeHtml(quote)}
        </strong>

        <span class="orders-card-id">
          ${escapeHtml(orderId)}
        </span>

      </div>

    </div>


    <span
      class="orders-status orders-status-${escapeHtml(
        status
      )}"
    >
      ${escapeHtml(
        formatStatusLabel(status)
      )}
    </span>

  </div>


  <div class="orders-card-grid">

    <div class="orders-detail">

      <span>
        COUNTERPARTY
      </span>

      <strong>
        ${escapeHtml(trader)}
      </strong>

    </div>


    <div class="orders-detail">

      <span>
        AMOUNT
      </span>

      <strong>
        ${formatNumber(amount)}
        ${escapeHtml(asset)}
      </strong>

    </div>


    <div class="orders-detail">

      <span>
        RATE
      </span>

      <strong>
        ${formatRate(rate)}
        ${escapeHtml(quote)}
      </strong>

    </div>


    <div class="orders-detail">

      <span>
        TOTAL
      </span>

      <strong>
        ${formatNumber(quoteAmount)}
        ${escapeHtml(quote)}
      </strong>

    </div>


    <div class="orders-detail">

      <span>
        NETWORK
      </span>

      <strong>
        ${escapeHtml(network)}
      </strong>

    </div>


    <div class="orders-detail">

      <span>
        CREATED
      </span>

      <strong>
        ${escapeHtml(createdAt)}
      </strong>

    </div>

  </div>


  <div class="orders-reservation">

    <div>

      <span>
        RESERVED
      </span>

      <strong>
        ${reservationLabel}
      </strong>

    </div>


    <span class="orders-reservation-status">

      ${
        reservation &&
        reservation.status

          ? escapeHtml(
              String(
                reservation.status
              ).toUpperCase()
            )

          : "N/A"
      }

    </span>

  </div>


  ${
    statusGroup === "active"

      ? `
        <div class="orders-card-actions">

          <button
            type="button"
            class="orders-cancel-button"
            data-order-id="${escapeHtml(
              orderId
            )}"
            data-order-action="cancel"
          >
            Cancel Order
          </button>

        </div>
      `

      : ""
  }

</article>

`;

}

/* =========================================================
CANCEL ORDER
========================================================= */

function cancelOrder(
orderId
) {

const activeOrders =
state.orders.active;

const index =
activeOrders.findIndex(
(order) =>
order &&
String(order.id) ===
String(orderId)
);

if (index === -1) {

showOrderNotice(
  "Order not found or no longer active."
);

return;

}

const order =
activeOrders[index];

if (
normalizeStatus(
order.status
) === "cancelled"
) {

showOrderNotice(
  "This order has already been cancelled."
);

return;

}

const confirmed =
window.confirm(
"Cancel this order and release its reserved funds?"
);

if (!confirmed) {
return;
}

try {

releaseReservation(
  order
);


const cancelledAt =
  new Date().toISOString();


order.status =
  "cancelled";


order.updatedAt =
  cancelledAt;


if (
  order.reservation &&
  typeof order.reservation === "object"
) {

  order.reservation.status =
    "released";


  order.reservation.releasedAt =
    cancelledAt;

}


activeOrders.splice(
  index,
  1
);


state.orders.cancelled.unshift(
  order
);


showOrderNotice(
  "Order cancelled and reserved funds released."
);


renderOrdersAfterMutation();

} catch (
error
) {

console.error(
  "CAP Marketplace: failed to cancel order.",
  error
);


showOrderNotice(
  error.message ||
  "Unable to cancel this order."
);

}

}

/* =========================================================
RELEASE RESERVED FUNDS
========================================================= */

function releaseReservation(
order
) {

const reservation =
order.reservation;

if (
!reservation ||
typeof reservation !== "object"
) {

return;

}

const asset =
String(
reservation.asset ||
""
).toUpperCase();

const amount =
Number(
reservation.amount
);

if (
!asset ||
!Number.isFinite(amount) ||
amount <= 0
) {

return;

}

releaseReservedBalance(
asset,
amount
);

}

/* =========================================================
RE-RENDER AFTER MUTATION
========================================================= */

function renderOrdersAfterMutation() {

const activeTab =
document.querySelector(
".orders-tab.is-active"
);

const filter =
activeTab?.dataset?.ordersFilter ||
"active";

const activeCount =
document.getElementById(
"orders-active-count"
);

const completedCount =
document.getElementById(
"orders-completed-count"
);

const cancelledCount =
document.getElementById(
"orders-cancelled-count"
);

if (activeCount) {

activeCount.textContent =
  String(
    state.orders.active.length
  );

}

if (completedCount) {

completedCount.textContent =
  String(
    state.orders.completed.length
  );

}

if (cancelledCount) {

cancelledCount.textContent =
  String(
    state.orders.cancelled.length
  );

}

renderOrderList(
filter
);

}

/* =========================================================
EMPTY STATE
========================================================= */

function renderEmptyState(
filter
) {

const title =
filter === "completed"

  ? "No completed orders"

  : filter === "cancelled"

    ? "No cancelled orders"

    : filter === "all"

      ? "No orders yet"

      : "No active orders";

const message =
filter === "active"

  ? "Orders created from the marketplace will appear here."

  : "There are no orders in this category yet.";

return `
<div class="orders-empty">

  <div
    class="orders-empty-icon"
    aria-hidden="true"
  >
    —
  </div>


  <h3>
    ${escapeHtml(title)}
  </h3>


  <p>
    ${escapeHtml(message)}
  </p>


  <button
    type="button"
    class="orders-secondary-button"
    data-orders-action="marketplace"
  >
    Browse Marketplace
  </button>

</div>

`;

}

/* =========================================================
NOTICE
========================================================= */

function showOrderNotice(
message
) {

const existing =
document.querySelector(
".orders-notice"
);

if (existing) {
existing.remove();
}

const notice =
document.createElement(
"div"
);

notice.className =
"orders-notice";

notice.textContent =
message;

document.body.appendChild(
notice
);

window.setTimeout(
() => {

  notice.remove();

},
3200

);

}

/* =========================================================
SORTING
========================================================= */

function sortOrdersByDate(
a,
b
) {

const aTime =
new Date(
a.order?.updatedAt ||
a.order?.createdAt ||
0
).getTime();

const bTime =
new Date(
b.order?.updatedAt ||
b.order?.createdAt ||
0
).getTime();

return bTime - aTime;

}

/* =========================================================
STATUS HELPERS
========================================================= */

function normalizeStatus(
value
) {

const status =
String(
value ||
"pending"
).toLowerCase();

if (
status === "completed"
) {

return "completed";

}

if (
status === "cancelled"
) {

return "cancelled";

}

return "pending";

}

function formatStatusLabel(
status
) {

switch (
normalizeStatus(status)
) {

case "completed":
  return "COMPLETED";

case "cancelled":
  return "CANCELLED";

default:
  return "PENDING";

}

}

function normalizeSide(
value
) {

const side =
String(
value ||
""
).toLowerCase();

if (
side === "buy"
) {
return "buy";
}

if (
side === "sell"
) {
return "sell";
}

return "";

}

/* =========================================================
FORMATTING
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

function formatRate(
value
) {

return Number(
value
).toLocaleString(
undefined,
{
minimumFractionDigits: 2,
maximumFractionDigits: 8,
}
);

}

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
ACCOUNT HELPERS
========================================================= */

function getFirstName(
fullName
) {

return String(
fullName ||
"User"
)
.trim()
.split(
/\s+/
)[0] || "User";

}

function getInitial(
name
) {

return String(
name ||
"U"
)
.charAt(0)
.toUpperCase();

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
"&"
)
.replaceAll(
"<",
"<"
)
.replaceAll(
">",
">"
)
.replaceAll(
'"',
"""
)
.replaceAll(
"'",
"'"
);

}
