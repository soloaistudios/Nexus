/* =========================================================
CAP MARKETPLACE
ORDER SETTLEMENT MODULE
========================================================= */

/*

Settlement is the final financial step for an order.

Wallet accounting model:

balances = available funds
reserved = locked funds

BUY CAP:
- reserved quote is consumed
- CAP is credited to the user

SELL CAP:
- reserved CAP is consumed
- quote is credited to the user

This module operates only on central application state.
It does not connect to a blockchain, payment rail,
escrow provider, or real counterparty account.
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
 * On success:
 * - reserved funds are consumed
 * - received asset is credited
 * - order moves active -> completed
 * - reservation becomes consumed
 * - order status becomes completed
 */
export function completeOrder(orderId) {
  ensureOrderState();

  const order = findActiveOrder(orderId);

  if (!order) {
    throw new Error(
      "CAP Settlement: active order was not found."
    );
  }

  validateOrderForSettlement(order);

  const settlement = buildSettlementContext(order);

  /*
   * Verify reserved funds before changing anything.
   */
  const reserved = getReservedBalance(
    settlement.reservationAsset
  );

  if (reserved < settlement.reservationAmount) {
    throw new Error(
      `CAP Settlement: insufficient reserved ${settlement.reservationAsset} balance.`
    );
  }

  /*
   * Consume the user's reserved asset.
   */
  consumeReservedBalance(
    settlement.reservationAsset,
    settlement.reservationAmount
  );

  /*
   * Credit the asset received by the user.
   */
  adjustBalance(
    settlement.receivedAsset,
    settlement.receivedAmount
  );

  const completedAt = new Date().toISOString();

  /*
   * Update reservation metadata.
   */
  order.reservation.status = "consumed";
  order.reservation.settledAt = completedAt;

  /*
   * Persist explicit settlement context.
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

  order.status = "completed";
  order.updatedAt = completedAt;

  /*
   * Move the same order object from active
   * to completed history.
   */
  const activeIndex =
    state.orders.active.findIndex(
      (item) => item === order
    );

  if (activeIndex === -1) {
    throw new Error(
      "CAP Settlement: completed order could not be removed from active orders."
    );
  }

  state.orders.active.splice(
    activeIndex,
    1
  );

  state.orders.completed.unshift(order);

  /*
   * Notify the application router.
   */
  if (typeof window !== "undefined") {
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
  }

  return order;
}

/**
 * Check whether an order can currently be settled.
 */
export function canCompleteOrder(orderId) {
  try {
    ensureOrderState();

    const order = findActiveOrder(orderId);

    if (!order) {
      return {
        valid: false,
        message: "Active order was not found.",
      };
    }

    validateOrderForSettlement(order);

    const settlement =
      buildSettlementContext(order);

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
  } catch (error) {
    return {
      valid: false,
      message:
        error?.message ||
        "Order cannot be settled.",
    };
  }
}

/* =========================================================
ORDER LOOKUP
========================================================= */

function findActiveOrder(orderId) {
  return (
    state.orders.active.find(
      (order) =>
        order &&
        String(order.id) ===
          String(orderId)
    ) || null
  );
}

/* =========================================================
SETTLEMENT VALIDATION
========================================================= */

function validateOrderForSettlement(order) {
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
      order.status || ""
    ).toLowerCase();

  if (status === "completed") {
    throw new Error(
      "CAP Settlement: order has already been completed."
    );
  }

  if (status === "cancelled") {
    throw new Error(
      "CAP Settlement: cancelled orders cannot be completed."
    );
  }

  if (status !== "pending") {
    throw new Error(
      `CAP Settlement: order status "${status || "unknown"}" cannot be settled.`
    );
  }

  if (!order.side) {
    throw new Error(
      "CAP Settlement: order side is missing."
    );
  }

  if (!order.asset) {
    throw new Error(
      "CAP Settlement: order asset is missing."
    );
  }

  if (!order.quote) {
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

function buildSettlementContext(order) {
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
    Number(order.amount);

  const quoteAmount =
    Number(order.quoteAmount);

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
      order.reservation.asset || ""
    ).toUpperCase();

  const reservationAmount =
    Number(
      order.reservation.amount
    );

  if (
    !reservationAsset ||
    !Number.isFinite(
      reservationAmount
    ) ||
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
   * User receives traded asset.
   */
  if (side === "buy") {
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

      reservationAsset: quote,
      reservationAmount: quoteAmount,

      receivedAsset: asset,
      receivedAmount: amount,
    };
  }

  /*
   * SELL:
   *
   * User reserved traded asset.
   * User receives quote.
   */
  if (side === "sell") {
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

      reservationAsset: asset,
      reservationAmount: amount,

      receivedAsset: quote,
      receivedAmount: quoteAmount,
    };
  }

  /*
   * Unsupported order side.
   */
  throw new Error(
    `CAP Settlement: unsupported order side "${side}".`
  );
}

/* =========================================================
NUMERIC COMPARISON
========================================================= */

function amountMatches(
  first,
  second
) {
  return (
    Math.abs(
      Number(first) -
        Number(second)
    ) <= 0.000000000001
  );
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

What this fixes

The settlement rules now remain:

BUY
"reserved USDT/USDC/etc. → consumed → CAP credited"

SELL
"reserved CAP → consumed → USDT/USDC/etc. credited"

It also prevents a settlement when the order is missing, already completed, cancelled, not pending, has an invalid reservation, or the reserved amount does not exactly correspond to the order.

I also made the browser event safer with "typeof window !== "undefined"" so the settlement module does not crash in a non-browser test environment.

One important point: this module assumes "consumeReservedBalance()" correctly reduces the reserved balance without accidentally removing the funds twice from the available balance. That function in "state.js" is the next place we should validate before declaring settlement fully fixed.

I can also create an image explaining the CAP settlement flow.
