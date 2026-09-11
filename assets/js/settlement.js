/* =========================================================
CAP MARKETPLACE
ORDER SETTLEMENT MODULE
========================================================= */

/*

* Settlement is the final financial step for an order.
* 
* Wallet accounting model:
* 
* balances = available funds
* reserved = locked funds
* 
* BUY CAP:
* reserved quote is consumed
* CAP is credited to the user
* 
* SELL CAP:
* reserved CAP is consumed
* quote is credited to the user
* 
* This module operates only on central application state.
* It does not pretend to connect to a blockchain, payment
* rail, escrow provider, or real counterparty account.
  */

import {
state,
getReservedBalance,
consumeReservedBalance,
adjustBalance,
} from "./state.js";

/* =========================================================
PUBLIC API
========================================================= */

/**

* Complete an active order.
* 
* The order must:
* 
* - exist in state.orders.active
* - belong to the currently authenticated user
* - not already be completed or cancelled
* - contain a valid reservation
* - contain the original trade context
* 
* On success:
* 
* - reserved funds are consumed
* - received asset is credited
* - order moves from active → completed
* - reservation becomes consumed
* - order status becomes completed
* 
* Returns the completed order.
  */
  export function completeOrder(
  orderId
  ) {

ensureOrderState();

const order =
findActiveOrder(
orderId
);

if (!order) {

throw new Error(
  "CAP Settlement: active order was not found."
);

}

validateOrderForSettlement(
order
);

const settlement =
buildSettlementContext(
order
);

/*

* Verify the reserved amount before mutating
* any wallet state.
  */
  const reserved =
  getReservedBalance(
  settlement.reservationAsset
  );

if (
reserved <
settlement.reservationAmount
) {

throw new Error(
  `CAP Settlement: insufficient reserved ${settlement.reservationAsset} balance.`
);

}

/*

* Apply the settlement atomically from the
* application's perspective:
* 
* 1. consume user's reserved payment/sold asset
* 2. credit the asset received by the user
     */
     consumeReservedBalance(
     settlement.reservationAsset,
     settlement.reservationAmount
     );

adjustBalance(
settlement.receivedAsset,
settlement.receivedAmount
);

const completedAt =
new Date().toISOString();

/*

* Update reservation metadata.
  */
  order.reservation.status =
  "consumed";

order.reservation.settledAt =
completedAt;

/*

* Store settlement context explicitly so
* future history/transaction modules do not
* need to reconstruct it.
  */
  order.settlement = {
  type: "completed",

reservationAsset:
  settlement.reservationAsset,

reservationAmount:
  settlement.reservationAmount,

receivedAsset:
  settlement.receivedAsset,

receivedAmount:
  settlement.receivedAmount,

settledAt:
  completedAt,

};

order.status =
"completed";

order.updatedAt =
completedAt;

/*

* Move the same order object from active
* to completed history.
  */
  const activeIndex =
  state.orders.active.findIndex(
  (item) =>
  item === order
  );

if (
activeIndex === -1
) {

/*
 * This should never happen because the order
 * was located from active orders above.
 *
 * Throwing here protects the state from ending
 * up with a settled order that is not recorded.
 */
throw new Error(
  "CAP Settlement: completed order could not be removed from active orders."
);

}

state.orders.active.splice(
activeIndex,
1
);

state.orders.completed.unshift(
order
);

/*

* Notify the rest of the application.
  */
  window.dispatchEvent(
  new CustomEvent(
  "cap:order-completed",
  {
  detail: {
  order,
  settlement: {
  ...settlement,
  settledAt: completedAt,
  },
  },
  }
  )
  );

return order;

}

/**

* Check whether an order can currently be settled.
* 
* Returns a structured validation result instead
* of throwing.
  */
  export function canCompleteOrder(
  orderId
  ) {

try {

ensureOrderState();


const order =
  findActiveOrder(
    orderId
  );


if (!order) {

  return {
    valid: false,
    message:
      "Active order was not found.",
  };

}


validateOrderForSettlement(
  order
);


const settlement =
  buildSettlementContext(
    order
  );


const reserved =
  getReservedBalance(
    settlement.reservationAsset
  );


if (
  reserved <
  settlement.reservationAmount
) {

  return {
    valid: false,
    message:
      `Insufficient reserved ${settlement.reservationAsset} balance.`,
  };

}


return {
  valid: true,
  order,
  settlement,
};

} catch (
error
) {

return {
  valid: false,
  message:
    error.message ||
    "Order cannot be settled.",
};

}

}

/* =========================================================
ORDER LOOKUP
========================================================= */

function findActiveOrder(
orderId
) {

return state.orders.active.find(
(order) =>
order &&
String(order.id) ===
String(orderId)
) || null;

}

/* =========================================================
SETTLEMENT VALIDATION
========================================================= */

function validateOrderForSettlement(
order
) {

if (
!order ||
typeof order !== "object"
) {

throw new Error(
  "CAP Settlement: invalid order."
);

}

const status =
String(
order.status ||
""
).toLowerCase();

if (
status === "completed"
) {

throw new Error(
  "CAP Settlement: order has already been completed."
);

}

if (
status === "cancelled"
) {

throw new Error(
  "CAP Settlement: cancelled orders cannot be completed."
);

}

if (
status !== "pending"
) {

throw new Error(
  `CAP Settlement: order status "${status || "unknown"}" cannot be settled.`
);

}

if (
!order.side
) {

throw new Error(
  "CAP Settlement: order side is missing."
);

}

if (
!order.asset
) {

throw new Error(
  "CAP Settlement: order asset is missing."
);

}

if (
!order.quote
) {

throw new Error(
  "CAP Settlement: order quote asset is missing."
);

}

if (
!order.reservation ||
typeof order.reservation !== "object"
) {

throw new Error(
  "CAP Settlement: order reservation is missing."
);

}

if (
order.reservation.status !==
"reserved"
) {

throw new Error(
  "CAP Settlement: order reservation is not active."
);

}

}

/* =========================================================
BUILD SETTLEMENT CONTEXT
========================================================= */

/**

* Convert the stored order context into the exact
* wallet movements required for settlement.
  */
  function buildSettlementContext(
  order
  ) {

const side =
String(
order.side
).toLowerCase();

const asset =
String(
order.asset
).toUpperCase();

const quote =
String(
order.quote
).toUpperCase();

const amount =
Number(
order.amount
);

const quoteAmount =
Number(
order.quoteAmount
);

if (
!Number.isFinite(amount) ||
amount <= 0
) {

throw new Error(
  "CAP Settlement: invalid order asset amount."
);

}

if (
!Number.isFinite(quoteAmount) ||
quoteAmount <= 0
) {

throw new Error(
  "CAP Settlement: invalid order quote amount."
);

}

const reservationAsset =
String(
order.reservation.asset
).toUpperCase();

const reservationAmount =
Number(
order.reservation.amount
);

if (
!reservationAsset ||
!Number.isFinite(reservationAmount) ||
reservationAmount <= 0
) {

throw new Error(
  "CAP Settlement: invalid reservation."
);

}

/*

* BUY:
* 
* User reserved quote.
* User receives CAP.
  */
  if (
  side === "buy"
  ) {

if (
  reservationAsset !== quote
) {

  throw new Error(
    "CAP Settlement: BUY reservation asset does not match quote asset."
  );

}


if (
  !amountMatches(
    reservationAmount,
    quoteAmount
  )
) {

  throw new Error(
    "CAP Settlement: BUY reservation amount does not match order quote amount."
  );

}


return {
  side: "buy",

  reservationAsset:
    quote,

  reservationAmount:
    quoteAmount,

  receivedAsset:
    asset,

  receivedAmount:
    amount,
};

}

/*

* SELL:
* 
* User reserved CAP.
* User receives quote.
  */
  if (
  side === "sell"
  ) {

if (
  reservationAsset !== asset
) {

  throw new Error(
    "CAP Settlement: SELL reservation asset does not match traded asset."
  );

}


if (
  !amountMatches(
    reservationAmount,
    amount
  )
) {

  throw new Error(
    "CAP Settlement: SELL reservation amount does not match order asset amount."
  );

}


return {
  side: "sell",

  reservationAsset:
    asset,

  reservationAmount:
    amount,

  receivedAsset:
    quote,

  receivedAmount:
    quoteAmount,
};

}

throw new Error(
"CAP Settlement: unsupported order side "${side}"."
);

}

/* =========================================================
NUMERIC COMPARISON
========================================================= */

function amountMatches(
first,
second
) {

return Math.abs(
Number(first) -
Number(second)
) <= 0.000000000001;

}

/* =========================================================
ORDER STATE SAFETY
========================================================= */

function ensureOrderState() {

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
