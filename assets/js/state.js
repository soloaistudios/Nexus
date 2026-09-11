/* =========================================================
CAP MARKETPLACE
CENTRAL APPLICATION STATE
========================================================= */

/**

* Central in-memory state.
* 
* Wallet accounting model:
* 
* balances = currently available funds
* reserved = funds locked by active trades
* 
* total balance = balances + reserved
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

/* =========================================================
STATE UPDATE
========================================================= */

/**

* Update a top-level state section safely.
  */
  export function updateState(
  section,
  values
  ) {

if (
!section ||
typeof section !== "string" ||
!Object.prototype.hasOwnProperty.call(
state,
section
)
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

Object.assign(
state[section],
values
);

}

/* =========================================================
AUTHENTICATION STATE
========================================================= */

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
  return (
  state.auth.status ===
  "authenticated"
  );
  }

/**

* Set authentication state.
  */
  export function setAuthenticatedUser(
  user,
  sessionId = null
  ) {

if (
!user ||
typeof user !== "object"
) {

throw new TypeError(
  "CAP Marketplace: a valid user object is required."
);

}

state.auth.status =
"authenticated";

state.auth.userId =
user.id ?? null;

state.auth.sessionId =
sessionId ?? null;

state.user = {
id:
user.id ?? null,

fullName:
  user.fullName ?? "",

email:
  user.email ?? "",

createdAt:
  user.createdAt ?? null,

verified:
  Boolean(
    user.verified
  ),

};

}

/**

* Set the active session ID independently.
  */
  export function setSessionId(
  sessionId
  ) {

state.auth.sessionId =
sessionId ?? null;

}

/**

* Clear the authenticated user and active session.
  */
  export function clearAuthenticatedUser() {

state.auth.status =
"signed_out";

state.auth.userId =
null;

state.auth.sessionId =
null;

state.user = {
id: null,
fullName: "",
email: "",
createdAt: null,
verified: false,
};

}

/* =========================================================
WALLET BALANCES
========================================================= */

/**

* Get the currently available balance.
* 
* IMPORTANT:
* state.wallet.balances stores AVAILABLE funds.
* Reserved funds are stored separately.
  */
  export function getBalance(
  asset
  ) {

validateWalletAsset(
asset
);

return state.wallet.balances[asset];

}

/**

* Get the currently reserved balance.
  */
  export function getReservedBalance(
  asset
  ) {

validateWalletAsset(
asset
);

return state.wallet.reserved[asset];

}

/**

* Get available balance.
* 
* Because "balances" already represents available funds,
* no reservation subtraction is performed here.
  */
  export function getAvailableBalance(
  asset
  ) {

return getBalance(
asset
);

}

/**

* Get total balance.
* 
* Total = available + reserved.
  */
  export function getTotalBalance(
  asset
  ) {

return (
getBalance(asset) +
getReservedBalance(asset)
);

}

/* =========================================================
RESERVE BALANCE
========================================================= */

/**

* Move an amount from AVAILABLE to RESERVED.
* 
* This is the central accounting operation for a trade.
  */
  export function reserveBalance(
  asset,
  amount
  ) {

validateWalletAsset(
asset
);

validatePositiveAmount(
amount
);

const available =
state.wallet.balances[asset];

if (
available < amount
) {

throw new Error(
  `Insufficient available ${asset} balance.`
);

}

state.wallet.balances[asset] =
normalizeBalance(
available - amount
);

state.wallet.reserved[asset] =
normalizeBalance(
state.wallet.reserved[asset] +
amount
);

return {
available:
state.wallet.balances[asset],

reserved:
  state.wallet.reserved[asset],

total:
  getTotalBalance(asset),

};

}

/* =========================================================
RELEASE RESERVED BALANCE
========================================================= */

/**

* Move an amount from RESERVED back to AVAILABLE.
* 
* Used when an active order is cancelled.
  */
  export function releaseReservedBalance(
  asset,
  amount
  ) {

validateWalletAsset(
asset
);

validatePositiveAmount(
amount
);

const reserved =
state.wallet.reserved[asset];

if (
reserved < amount
) {

throw new Error(
  `Cannot release more ${asset} than is reserved.`
);

}

state.wallet.reserved[asset] =
normalizeBalance(
reserved - amount
);

state.wallet.balances[asset] =
normalizeBalance(
state.wallet.balances[asset] +
amount
);

return {
available:
state.wallet.balances[asset],

reserved:
  state.wallet.reserved[asset],

total:
  getTotalBalance(asset),

};

}

/* =========================================================
CONSUME RESERVED BALANCE
========================================================= */

/**

* Remove funds permanently from RESERVED.
* 
* Used when a settlement has actually consumed
* the user's reserved asset.
  */
  export function consumeReservedBalance(
  asset,
  amount
  ) {

validateWalletAsset(
asset
);

validatePositiveAmount(
amount
);

const reserved =
state.wallet.reserved[asset];

if (
reserved < amount
) {

throw new Error(
  `Cannot consume more ${asset} than is reserved.`
);

}

state.wallet.reserved[asset] =
normalizeBalance(
reserved - amount
);

return {
available:
state.wallet.balances[asset],

reserved:
  state.wallet.reserved[asset],

total:
  getTotalBalance(asset),

};

}

/* =========================================================
GENERAL BALANCE ADJUSTMENT
========================================================= */

/**

* Apply a change to the AVAILABLE balance.
* 
* Positive amount = credit available funds.
* Negative amount = debit available funds.
* 
* Reserved funds are never modified by this function.
  */
  export function adjustBalance(
  asset,
  amount
  ) {

validateWalletAsset(
asset
);

if (
typeof amount !== "number" ||
!Number.isFinite(amount)
) {

throw new TypeError(
  "CAP Marketplace: balance adjustment must be a finite number."
);

}

const nextBalance =
state.wallet.balances[asset] +
amount;

if (
nextBalance < 0
) {

throw new Error(
  `Balance cannot become negative for ${asset}.`
);

}

state.wallet.balances[asset] =
normalizeBalance(
nextBalance
);

return state.wallet.balances[asset];

}

/* =========================================================
MARKETPLACE / ORDER HELPERS
========================================================= */

/**

* Add a marketplace notification.
  */
  export function addNotification(
  notification
  ) {

if (
!notification ||
typeof notification !== "object"
) {

throw new TypeError(
  "CAP Marketplace: notification must be an object."
);

}

state.notifications.unshift({
id:
notification.id ??
createEntityId(
"notification"
),

type:
  notification.type ??
  "info",

title:
  notification.title ??
  "",

message:
  notification.message ??
  "",

createdAt:
  notification.createdAt ??
  new Date().toISOString(),

read:
  Boolean(
    notification.read
  ),

});

}

/**

* Mark a notification as read.
  */
  export function markNotificationRead(
  notificationId
  ) {

const notification =
state.notifications.find(
(item) =>
item.id ===
notificationId
);

if (notification) {

notification.read =
  true;

}

}

/* =========================================================
ENTITY ID
========================================================= */

/**

* Generate a simple local identifier
* for front-end entities.
  */
  export function createEntityId(
  prefix = "entity"
  ) {

const randomPart =
Math.random()
.toString(36)
.slice(2, 10);

return "${prefix}_${Date.now()}_${randomPart}";

}

/* =========================================================
VALIDATION
========================================================= */

function validateWalletAsset(
asset
) {

if (
!state.wallet ||
!state.wallet.balances ||
!state.wallet.reserved ||
!Object.prototype.hasOwnProperty.call(
state.wallet.balances,
asset
)
) {

throw new Error(
  `CAP Marketplace: unsupported asset "${asset}".`
);

}

if (
!Object.prototype.hasOwnProperty.call(
state.wallet.reserved,
asset
)
) {

throw new Error(
  `CAP Marketplace: unsupported asset "${asset}".`
);

}

return true;

}

/**

* Validate monetary/asset quantities.
  */
  function validatePositiveAmount(
  amount
  ) {

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

/**

* Keep wallet quantities within a predictable
* floating-point precision.
  */
  function normalizeBalance(
  value
  ) {

return Number(
Number(value).toFixed(12)
);

}
