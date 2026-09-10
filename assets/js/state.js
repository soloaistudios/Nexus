/* =========================================================
   CAP MARKETPLACE
   CENTRAL APPLICATION STATE
   ========================================================= */

/**
 * Central in-memory state.
 *
 * Nothing here pretends to be a real backend.
 * This is the front-end state layer that future modules
 * will use consistently.
 */

export const state = {
  app: {
    initialized: false,
    currentScreen: "signup",
    version: "0.1.0",
  },

  auth: {
    status: "signed_out",
    userId: null,
    sessionId: null,
  },

  user: {
    id: null,
    fullName: "",
    email: "",
    createdAt: null,
    verified: false,
  },

  wallet: {
    balances: {
      USDT: 0,
      USDC: 0,
      BTC: 0,
      ETH: 0,
      SOL: 0,
      CAP: 0,
    },

    reserved: {
      USDT: 0,
      USDC: 0,
      BTC: 0,
      ETH: 0,
      SOL: 0,
      CAP: 0,
    },
  },

  marketplace: {
    offers: [],
    selectedOfferId: null,
    filters: {
      asset: "CAP",
      side: "all",
      settlementCurrency: "all",
      network: "all",
    },
  },

  orders: {
    active: [],
    completed: [],
    cancelled: [],
  },

  arbitrage: {
    opportunities: [],
    selectedOpportunityId: null,
  },

  notifications: [],

  settings: {
    currency: "USD",
    theme: "dark",
  },
};


/**
 * Update a top-level state section safely.
 */
export function updateState(section, values) {
  if (
    !section ||
    typeof section !== "string" ||
    !Object.prototype.hasOwnProperty.call(state, section)
  ) {
    throw new Error(
      `CAP Marketplace: unknown state section "${section}".`
    );
  }

  if (
    !values ||
    typeof values !== "object" ||
    Array.isArray(values)
  ) {
    throw new TypeError(
      "CAP Marketplace: state update must be an object."
    );
  }

  Object.assign(state[section], values);
}


/**
 * Retrieve the current authenticated user.
 */
export function getCurrentUser() {
  return state.user;
}


/**
 * Check whether a user is authenticated.
 */
export function isAuthenticated() {
  return state.auth.status === "authenticated";
}


/**
 * Set authentication state.
 */
export function setAuthenticatedUser(user) {
  if (!user || typeof user !== "object") {
    throw new TypeError(
      "CAP Marketplace: a valid user object is required."
    );
  }

  state.auth.status = "authenticated";
  state.auth.userId = user.id ?? null;

  state.user = {
    id: user.id ?? null,
    fullName: user.fullName ?? "",
    email: user.email ?? "",
    createdAt: user.createdAt ?? null,
    verified: Boolean(user.verified),
  };
}


/**
 * Clear the authenticated user.
 */
export function clearAuthenticatedUser() {
  state.auth.status = "signed_out";
  state.auth.userId = null;
  state.auth.sessionId = null;

  state.user = {
    id: null,
    fullName: "",
    email: "",
    createdAt: null,
    verified: false,
  };
}


/**
 * Get a wallet balance.
 */
export function getBalance(asset) {
  if (!Object.prototype.hasOwnProperty.call(
    state.wallet.balances,
    asset
  )) {
    throw new Error(
      `CAP Marketplace: unsupported asset "${asset}".`
    );
  }

  return state.wallet.balances[asset];
}


/**
 * Get a reserved wallet balance.
 */
export function getReservedBalance(asset) {
  if (!Object.prototype.hasOwnProperty.call(
    state.wallet.reserved,
    asset
  )) {
    throw new Error(
      `CAP Marketplace: unsupported asset "${asset}".`
    );
  }

  return state.wallet.reserved[asset];
}


/**
 * Return the available balance after reservations.
 */
export function getAvailableBalance(asset) {
  return Math.max(
    0,
    getBalance(asset) - getReservedBalance(asset)
  );
}


/**
 * Reserve part of an asset balance.
 *
 * This does not transfer ownership.
 * It only prevents the reserved amount from being
 * simultaneously committed to another transaction.
 */
export function reserveBalance(asset, amount) {
  validatePositiveAmount(amount);

  const available = getAvailableBalance(asset);

  if (available < amount) {
    throw new Error(
      `Insufficient available ${asset} balance.`
    );
  }

  state.wallet.reserved[asset] += amount;
}


/**
 * Release a previously reserved amount.
 */
export function releaseReservedBalance(asset, amount) {
  validatePositiveAmount(amount);

  const reserved = getReservedBalance(asset);

  if (reserved < amount) {
    throw new Error(
      `Cannot release more ${asset} than is reserved.`
    );
  }

  state.wallet.reserved[asset] -= amount;
}


/**
 * Apply a completed balance transfer.
 *
 * Positive amount = credit.
 * Negative amount = debit.
 */
export function adjustBalance(asset, amount) {
  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount)
  ) {
    throw new TypeError(
      "CAP Marketplace: balance adjustment must be a finite number."
    );
  }

  const nextBalance =
    state.wallet.balances[asset] + amount;

  if (nextBalance < 0) {
    throw new Error(
      `Balance cannot become negative for ${asset}.`
    );
  }

  state.wallet.balances[asset] = nextBalance;
}


/**
 * Add a marketplace notification.
 */
export function addNotification(notification) {
  if (!notification || typeof notification !== "object") {
    throw new TypeError(
      "CAP Marketplace: notification must be an object."
    );
  }

  state.notifications.unshift({
    id: notification.id ?? crypto.randomUUID(),
    type: notification.type ?? "info",
    title: notification.title ?? "",
    message: notification.message ?? "",
    createdAt:
      notification.createdAt ??
      new Date().toISOString(),
    read: Boolean(notification.read),
  });
}


/**
 * Mark a notification as read.
 */
export function markNotificationRead(notificationId) {
  const notification = state.notifications.find(
    (item) => item.id === notificationId
  );

  if (notification) {
    notification.read = true;
  }
}


/**
 * Generate a simple local identifier for front-end entities.
 */
export function createEntityId(prefix = "entity") {
  const randomPart =
    Math.random()
      .toString(36)
      .slice(2, 10);

  return `${prefix}_${Date.now()}_${randomPart}`;
}


/**
 * Validate monetary/asset quantities.
 */
function validatePositiveAmount(amount) {
  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new TypeError(
      "CAP Marketplace: amount must be greater than zero."
    );
  }
}
