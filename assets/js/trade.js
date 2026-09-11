/* =========================================================
CAP MARKETPLACE
TRADE REVIEW / ORDER CREATION MODULE
========================================================= */

import {
state,
} from "./state.js";

import {
getCurrentAccount,
} from "./auth.js";

import {
getAvailableBalance,
reserveBalance,
} from "./wallet.js";

/* =========================================================
RENDER TRADE
========================================================= */

export function renderTrade(app) {

if (!app) {

throw new Error(
  "CAP Marketplace: trade requires an app mount point."
);

}

const account =
getCurrentAccount();

if (!account) {

throw new Error(
  "CAP Marketplace: trade requires an authenticated account."
);

}

const offer =
getSelectedOffer();

if (!offer) {

window.dispatchEvent(
  new CustomEvent(
    "cap:trade-marketplace-requested"
  )
);

return;

}

const tradeSide =
getUserTradeSide(offer);

const actionLabel =
tradeSide === "buy"
? "BUY CAP"
: "SELL CAP";

const paymentAmount =
getPaymentAmount(
offer,
getDefaultAmount(offer)
);

app.innerHTML = `
<section class="trade-page">

  <!-- =================================================
       HEADER
       ================================================= -->

  <header class="trade-header">

    <div class="trade-header-left">

      <button
        type="button"
        class="trade-back-button"
        id="trade-back"
        aria-label="Back to marketplace"
      >
        ←
      </button>

      <div>

        <span class="trade-eyebrow">
          CAP MARKETPLACE
        </span>

        <h1>
          Review trade
        </h1>

      </div>

    </div>

    <div class="trade-secure-status">
      <span class="trade-secure-dot"></span>
      Secure order review
    </div>

  </header>


  <!-- =================================================
       MAIN
       ================================================= -->

  <main class="trade-main">


    <!-- =================================================
         OFFER SUMMARY
         ================================================= -->

    <section class="trade-panel">

      <div class="trade-panel-heading">

        <div>

          <span class="trade-eyebrow">
            SELECTED OFFER
          </span>

          <h2>
            ${escapeHtml(
              actionLabel
            )}
          </h2>

        </div>

        <span
          class="
            trade-side-badge
            ${
              tradeSide === "buy"
                ? "is-buy"
                : "is-sell"
            }
          "
        >
          ${
            tradeSide === "buy"
              ? "BUY"
              : "SELL"
          }
        </span>

      </div>


      <!-- =================================================
           COUNTERPARTY
           ================================================= -->

      <div class="trade-counterparty">

        <div
          class="trade-avatar"
          aria-hidden="true"
        >
          ${escapeHtml(
            offer.traderInitial ||
            getInitials(
              offer.trader
            )
          )}
        </div>

        <div class="trade-counterparty-info">

          <strong>
            ${escapeHtml(
              offer.trader
            )}
          </strong>

          <span>
            ${escapeHtml(
              offer.location ||
              "Global"
            )}
          </span>

        </div>

        <div class="trade-reputation">

          <span>
            ★
          </span>

          <strong>
            ${escapeHtml(
              offer.reputation
            )}%
          </strong>

          <small>
            reputation
          </small>

        </div>

      </div>


      <!-- =================================================
           OFFER DETAILS
           ================================================= -->

      <div class="trade-details-grid">

        <div class="trade-detail">

          <span>
            ASSET
          </span>

          <strong>
            ${escapeHtml(
              offer.asset
            )}
          </strong>

        </div>


        <div class="trade-detail">

          <span>
            RATE
          </span>

          <strong>
            ${formatRate(
              offer.rate
            )}
            ${escapeHtml(
              offer.quote
            )}
          </strong>

        </div>


        <div class="trade-detail">

          <span>
            AVAILABLE
          </span>

          <strong>
            ${formatNumber(
              offer.amount
            )}
            ${escapeHtml(
              offer.asset
            )}
          </strong>

        </div>


        <div class="trade-detail">

          <span>
            LIMIT
          </span>

          <strong>
            ${formatNumber(
              offer.minTrade
            )}
            –
            ${formatNumber(
              offer.maxTrade
            )}
            ${escapeHtml(
              offer.asset
            )}
          </strong>

        </div>


        <div class="trade-detail">

          <span>
            NETWORK
          </span>

          <strong>
            ${escapeHtml(
              offer.network
            )}
          </strong>

        </div>


        <div class="trade-detail">

          <span>
            SETTLEMENT
          </span>

          <strong>
            ${escapeHtml(
              offer.payment ||
              offer.quote
            )}
          </strong>

        </div>

      </div>

    </section>


    <!-- =================================================
         TRADE AMOUNT
         ================================================= -->

    <section class="trade-panel">

      <div class="trade-panel-heading">

        <div>

          <span class="trade-eyebrow">
            TRADE AMOUNT
          </span>

          <h2>
            How much CAP?
          </h2>

        </div>

      </div>


      <div class="trade-amount-field">

        <label
          for="trade-amount"
        >
          CAP amount
        </label>

        <div class="trade-input-wrap">

          <input
            id="trade-amount"
            type="number"
            inputmode="decimal"
            min="${escapeHtml(
              offer.minTrade
            )}"
            max="${escapeHtml(
              Math.min(
                offer.maxTrade,
                offer.amount
              )
            )}"
            step="0.01"
            value="${escapeHtml(
              paymentAmount.amount
            )}"
            autocomplete="off"
          />

          <span>
            ${escapeHtml(
              offer.asset
            )}
          </span>

        </div>

        <p
          class="trade-field-help"
        >
          Minimum
          ${formatNumber(
            offer.minTrade
          )}
          ${escapeHtml(
            offer.asset
          )}
          · Maximum
          ${formatNumber(
            Math.min(
              offer.maxTrade,
              offer.amount
            )
          )}
          ${escapeHtml(
            offer.asset
          )}
        </p>

      </div>


      <!-- =================================================
           TOTAL
           ================================================= -->

      <div class="trade-total">

        <span>
          ${
            tradeSide === "buy"
              ? "You pay"
              : "You receive"
          }
        </span>

        <strong
          id="trade-total-value"
        >
          ${formatNumber(
            paymentAmount.quote
          )}
          ${escapeHtml(
            offer.quote
          )}
        </strong>

      </div>

    </section>


    <!-- =================================================
         BALANCE / RESERVATION
         ================================================= -->

    <section class="trade-panel">

      <div class="trade-panel-heading">

        <div>

          <span class="trade-eyebrow">
            ${
              tradeSide === "buy"
                ? "PAYMENT"
                : "CAP BALANCE"
            }
          </span>

          <h2>
            Reservation
          </h2>

        </div>

      </div>


      <div class="trade-reservation">

        <div class="trade-reservation-row">

          <span>
            Required
          </span>

          <strong
            id="trade-required-balance"
          >
            ${
              tradeSide === "buy"
                ? `${formatNumber(
                    paymentAmount.quote
                  )} ${escapeHtml(
                    offer.quote
                  )}`
                : `${formatNumber(
                    paymentAmount.amount
                  )} ${escapeHtml(
                    offer.asset
                  )}`
            }
          </strong>

        </div>


        <div class="trade-reservation-row">

          <span>
            Available
          </span>

          <strong
            id="trade-available-balance"
          >
            ${formatNumber(
              getRelevantAvailableBalance(
                offer,
                tradeSide
              )
            )}
            ${
              tradeSide === "buy"
                ? escapeHtml(
                    offer.quote
                  )
                : escapeHtml(
                    offer.asset
                  )
            }
          </strong>

        </div>


        <div
          id="trade-balance-status"
          class="
            trade-balance-status
            ${getRelevantAvailableBalance(
              offer,
              tradeSide
            ) >=
            (
              tradeSide === "buy"
                ? paymentAmount.quote
                : paymentAmount.amount
            )
              ? "is-sufficient"
              : "is-insufficient"}
          "
        >
          ${
            getRelevantAvailableBalance(
              offer,
              tradeSide
            ) >=
            (
              tradeSide === "buy"
                ? paymentAmount.quote
                : paymentAmount.amount
            )
              ? "Sufficient balance for reservation."
              : "Insufficient balance for this trade."
          }
        </div>

      </div>

    </section>


    <!-- =================================================
         ORDER SUMMARY
         ================================================= -->

    <section class="trade-panel trade-final-panel">

      <div class="trade-panel-heading">

        <div>

          <span class="trade-eyebrow">
            ORDER SUMMARY
          </span>

          <h2>
            Confirm trade
          </h2>

        </div>

      </div>


      <div class="trade-summary">

        <div class="trade-summary-row">

          <span>
            Counterparty
          </span>

          <strong>
            ${escapeHtml(
              offer.trader
            )}
          </strong>

        </div>


        <div class="trade-summary-row">

          <span>
            Action
          </span>

          <strong>
            ${escapeHtml(
              actionLabel
            )}
          </strong>

        </div>


        <div class="trade-summary-row">

          <span>
            CAP amount
          </span>

          <strong
            id="trade-summary-amount"
          >
            ${formatNumber(
              paymentAmount.amount
            )}
            ${escapeHtml(
              offer.asset
            )}
          </strong>

        </div>


        <div class="trade-summary-row">

          <span>
            Rate
          </span>

          <strong>
            ${formatRate(
              offer.rate
            )}
            ${escapeHtml(
              offer.quote
            )}
          </strong>

        </div>


        <div class="trade-summary-row">

          <span>
            Settlement
          </span>

          <strong>
            ${escapeHtml(
              offer.quote
            )}
            ·
            ${escapeHtml(
              offer.network
            )}
          </strong>

        </div>


        <div class="trade-summary-row trade-summary-total">

          <span>
            ${
              tradeSide === "buy"
                ? "Payment required"
                : "Payment received"
            }
          </span>

          <strong
            id="trade-summary-total"
          >
            ${formatNumber(
              paymentAmount.quote
            )}
            ${escapeHtml(
              offer.quote
            )}
          </strong>

        </div>

      </div>


      <div
        id="trade-error"
        class="trade-error"
        role="alert"
        aria-live="polite"
      ></div>


      <button
        type="button"
        id="trade-confirm"
        class="trade-confirm-button"
      >
        ${
          tradeSide === "buy"
            ? "Review & Buy CAP"
            : "Review & Sell CAP"
        }
      </button>

      <p class="trade-confirm-help">
        Your funds are only reserved after the order
        passes validation.
      </p>

    </section>

  </main>

</section>

`;

attachTradeEvents(
offer,
tradeSide
);
}

/* =========================================================
SELECTED OFFER
========================================================= */

function getSelectedOffer() {

const selectedId =
state.marketplace
?.selectedOfferId;

if (!selectedId) {
return null;
}

const offers =
state.marketplace
?.offers;

if (!Array.isArray(offers)) {
return null;
}

return offers.find(
(offer) =>
String(offer.id) ===
String(selectedId)
) || null;
}

/* =========================================================
USER TRADE SIDE
========================================================= */

/*

* Marketplace meaning:
* 
* offer.side === "sell"
* → counterparty sells CAP
* → user BUYS CAP
* 
* offer.side === "buy"
* → counterparty buys CAP
* → user SELLS CAP
  */

function getUserTradeSide(
offer
) {

return offer.side === "sell"
? "buy"
: "sell";
}

/* =========================================================
DEFAULT AMOUNT
========================================================= */

function getDefaultAmount(
offer
) {

const minimum =
Number(
offer.minTrade
) || 0;

const maximum =
Math.min(
Number(
offer.maxTrade
) || 0,

  Number(
    offer.amount
  ) || 0
);

if (
maximum > 0 &&
maximum < minimum
) {
return maximum;
}

return minimum > 0
? minimum
: Math.min(
10,
maximum || 10
);
}

/* =========================================================
PAYMENT CALCULATION
========================================================= */

function getPaymentAmount(
offer,
amount
) {

const normalizedAmount =
Number(amount) || 0;

const rate =
Number(offer.rate) || 0;

return {
amount: normalizedAmount,

quote:
  normalizedAmount * rate,

};
}

/* =========================================================
BALANCE LOOKUP
========================================================= */

function getRelevantAvailableBalance(
offer,
tradeSide
) {

/*

* BUY CAP:
* user pays the quote asset.
  */
  if (tradeSide === "buy") {

return getAvailableBalance(
  offer.quote
);

}

/*

* SELL CAP:
* user pays CAP.
  */
  return getAvailableBalance(
  offer.asset
  );
  }

/* =========================================================
EVENT ATTACHMENT
========================================================= */

function attachTradeEvents(
offer,
tradeSide
) {

const backButton =
document.getElementById(
"trade-back"
);

backButton?.addEventListener(
"click",
() => {

  window.dispatchEvent(
    new CustomEvent(
      "cap:trade-marketplace-requested"
    )
  );
}

);

const amountInput =
document.getElementById(
"trade-amount"
);

amountInput?.addEventListener(
"input",
() => {

  updateTradeCalculations(
    offer,
    tradeSide
  );
}

);

const confirmButton =
document.getElementById(
"trade-confirm"
);

confirmButton?.addEventListener(
"click",
() => {

  handleTradeConfirmation(
    offer,
    tradeSide
  );
}

);

updateTradeCalculations(
offer,
tradeSide
);
}

/* =========================================================
TRADE CALCULATIONS
========================================================= */

function updateTradeCalculations(
offer,
tradeSide
) {

const amountInput =
document.getElementById(
"trade-amount"
);

if (!amountInput) {
return;
}

const amount =
Number(
amountInput.value
) || 0;

const totals =
getPaymentAmount(
offer,
amount
);

const totalElement =
document.getElementById(
"trade-total-value"
);

if (totalElement) {

totalElement.textContent =
  `${formatNumber(
    totals.quote
  )} ${offer.quote}`;

}

const summaryAmount =
document.getElementById(
"trade-summary-amount"
);

if (summaryAmount) {

summaryAmount.textContent =
  `${formatNumber(
    totals.amount
  )} ${offer.asset}`;

}

const summaryTotal =
document.getElementById(
"trade-summary-total"
);

if (summaryTotal) {

summaryTotal.textContent =
  `${formatNumber(
    totals.quote
  )} ${offer.quote}`;

}

const requiredBalance =
document.getElementById(
"trade-required-balance"
);

if (requiredBalance) {

requiredBalance.textContent =
  tradeSide === "buy"

    ? `${formatNumber(
        totals.quote
      )} ${offer.quote}`

    : `${formatNumber(
        totals.amount
      )} ${offer.asset}`;

}

const available =
getRelevantAvailableBalance(
offer,
tradeSide
);

const required =
tradeSide === "buy"
? totals.quote
: totals.amount;

const availableElement =
document.getElementById(
"trade-available-balance"
);

if (availableElement) {

availableElement.textContent =
  `${formatNumber(
    available
  )} ${
    tradeSide === "buy"
      ? offer.quote
      : offer.asset
  }`;

}

const statusElement =
document.getElementById(
"trade-balance-status"
);

if (statusElement) {

const sufficient =
  available >= required;

statusElement.classList.toggle(
  "is-sufficient",
  sufficient
);

statusElement.classList.toggle(
  "is-insufficient",
  !sufficient
);

statusElement.textContent =
  sufficient
    ? "Sufficient balance for reservation."
    : "Insufficient balance for this trade.";

}

validateAmountDisplay(
offer,
amount
);
}

/* =========================================================
AMOUNT VALIDATION DISPLAY
========================================================= */

function validateAmountDisplay(
offer,
amount
) {

const input =
document.getElementById(
"trade-amount"
);

if (!input) {
return;
}

const error =
document.getElementById(
"trade-error"
);

const minimum =
Number(
offer.minTrade
) || 0;

const maximum =
Math.min(
Number(
offer.maxTrade
) || 0,

  Number(
    offer.amount
  ) || 0
);

let message =
"";

if (amount <= 0) {

message =
  "Enter a CAP amount.";

} else if (amount < minimum) {

message =
  `Minimum trade is ${formatNumber(
    minimum
  )} ${offer.asset}.`;

} else if (amount > maximum) {

message =
  `Maximum trade is ${formatNumber(
    maximum
  )} ${offer.asset}.`;

}

input.classList.toggle(
"is-invalid",
Boolean(message)
);

if (error) {
error.textContent =
message;
}
}

/* =========================================================
TRADE CONFIRMATION
========================================================= */

function handleTradeConfirmation(
offer,
tradeSide
) {

const amountInput =
document.getElementById(
"trade-amount"
);

const error =
document.getElementById(
"trade-error"
);

if (!amountInput) {
return;
}

const amount =
Number(
amountInput.value
) || 0;

const validation =
validateTrade(
offer,
tradeSide,
amount
);

if (!validation.valid) {

if (error) {
  error.textContent =
    validation.message;
}

return;

}

try {

/*
 * Apply the reservation using the Wallet module.
 *
 * BUY:
 * reserve quote currency.
 *
 * SELL:
 * reserve CAP.
 */
const reservation =
  reserveTradeFunds(
    offer,
    tradeSide,
    amount
  );


const order =
  createOrder(
    offer,
    tradeSide,
    amount
  );


/*
 * Keep the actual reservation context
 * synchronized with the order.
 */
order.reservation =
  {
    ...order.reservation,
    ...reservation,
  };


window.dispatchEvent(
  new CustomEvent(
    "cap:trade-created",
    {
      detail: {
        order,
      },
    }
  )
);


showTradeSuccess(
  order
);

} catch (
reservationError
) {

console.error(
  "CAP Marketplace: trade reservation failed.",
  reservationError
);


if (error) {

  error.textContent =
    reservationError.message ||
    "Unable to reserve funds for this trade.";

}

}
}

/* =========================================================
TRADE VALIDATION
========================================================= */

function validateTrade(
offer,
tradeSide,
amount
) {

if (!Number.isFinite(amount)) {

return {
  valid: false,
  message:
    "Enter a valid CAP amount.",
};

}

const minimum =
Number(
offer.minTrade
) || 0;

const maximum =
Math.min(
Number(
offer.maxTrade
) || 0,

  Number(
    offer.amount
  ) || 0
);

if (amount <= 0) {

return {
  valid: false,
  message:
    "Enter a CAP amount greater than zero.",
};

}

if (amount < minimum) {

return {
  valid: false,
  message:
    `Minimum trade is ${formatNumber(
      minimum
    )} ${offer.asset}.`,
};

}

if (amount > maximum) {

return {
  valid: false,
  message:
    `Maximum trade is ${formatNumber(
      maximum
    )} ${offer.asset}.`,
};

}

const payment =
getPaymentAmount(
offer,
amount
);

const required =
tradeSide === "buy"
? payment.quote
: payment.amount;

const available =
getRelevantAvailableBalance(
offer,
tradeSide
);

if (available < required) {

return {
  valid: false,
  message:
    `Insufficient ${
      tradeSide === "buy"
        ? offer.quote
        : offer.asset
    } balance. Required ${formatNumber(
      required
    )}, available ${formatNumber(
      available
    )}.`,
};

}

return {
valid: true,
payment,
};
}

/* =========================================================
RESERVE FUNDS
========================================================= */

function reserveTradeFunds(
offer,
tradeSide,
amount
) {

const payment =
getPaymentAmount(
offer,
amount
);

/*

* BUY CAP:
* reserve quote currency.
  */
  if (tradeSide === "buy") {

const asset =
  String(
    offer.quote
  ).toUpperCase();


const required =
  payment.quote;


if (
  !Number.isFinite(required) ||
  required <= 0
) {

  throw new Error(
    `Invalid ${asset} reservation amount.`
  );
}


const result =
  reserveBalance(
    asset,
    required
  );


return {
  asset,
  amount: required,
  status: "reserved",
  createdAt:
    new Date().toISOString(),

  availableAfter:
    result.available,

  reservedAfter:
    result.reserved,
};

}

/*

* SELL CAP:
* reserve CAP.
  */
  const asset =
  String(
  offer.asset
  ).toUpperCase();

const required =
payment.amount;

if (
!Number.isFinite(required) ||
required <= 0
) {

throw new Error(
  `Invalid ${asset} reservation amount.`
);

}

const result =
reserveBalance(
asset,
required
);

return {
asset,
amount: required,
status: "reserved",
createdAt:
new Date().toISOString(),

availableAfter:
  result.available,

reservedAfter:
  result.reserved,

};
}

/* =========================================================
CREATE ORDER
========================================================= */

function createOrder(
offer,
tradeSide,
amount
) {

const payment =
getPaymentAmount(
offer,
amount
);

const orderId =
createId(
"order"
);

const now =
new Date().toISOString();

const order = {

id: orderId,

status:
  "pending",

createdAt:
  now,

updatedAt:
  now,

userId:
  state.user.id,

traderId:
  offer.traderId ||
  null,

trader:
  offer.trader,

offerId:
  offer.id,

side:
  tradeSide,

asset:
  offer.asset,

assetName:
  offer.assetName ||
  offer.asset,

amount:
  payment.amount,

rate:
  offer.rate,

quote:
  offer.quote,

quoteAmount:
  payment.quote,

network:
  offer.network,

payment:
  offer.payment,

location:
  offer.location,

minTrade:
  offer.minTrade,

maxTrade:
  offer.maxTrade,

reservation: {

  asset:
    tradeSide === "buy"
      ? offer.quote
      : offer.asset,

  amount:
    tradeSide === "buy"
      ? payment.quote
      : payment.amount,

  status:
    "reserved",

  createdAt:
    now,
},

};

if (!state.orders) {

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

state.orders.active.push(
order
);

return order;
}

/* =========================================================
SUCCESS SCREEN
========================================================= */

function showTradeSuccess(
order
) {

const app =
document.getElementById(
"app"
);

if (!app) {
return;
}

app.innerHTML = `
<section class="trade-page">

  <header class="trade-header">

    <div class="trade-header-left">

      <div>

        <span class="trade-eyebrow">
          CAP MARKETPLACE
        </span>

        <h1>
          Order created
        </h1>

      </div>

    </div>

    <div class="trade-secure-status">
      <span class="trade-secure-dot"></span>
      Funds reserved
    </div>

  </header>


  <main class="trade-main">

    <section
      class="trade-panel trade-success-panel"
    >

      <div class="trade-success-icon">
        ✓
      </div>

      <span class="trade-eyebrow">
        ORDER CREATED
      </span>

      <h2>
        ${
          order.side === "buy"
            ? "BUY CAP order ready"
            : "SELL CAP order ready"
        }
      </h2>

      <p>
        Your ${
          order.side === "buy"
            ? "payment"
            : order.asset
        } has been reserved for this order.
      </p>


      <div class="trade-summary">

        <div class="trade-summary-row">

          <span>
            Order ID
          </span>

          <strong>
            ${escapeHtml(
              order.id
            )}
          </strong>

        </div>


        <div class="trade-summary-row">

          <span>
            Counterparty
          </span>

          <strong>
            ${escapeHtml(
              order.trader
            )}
          </strong>

        </div>


        <div class="trade-summary-row">

          <span>
            CAP amount
          </span>

          <strong>
            ${formatNumber(
              order.amount
            )}
            ${escapeHtml(
              order.asset
            )}
          </strong>

        </div>


        <div class="trade-summary-row">

          <span>
            Total
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


        <div class="trade-summary-row">

          <span>
            Network
          </span>

          <strong>
            ${escapeHtml(
              order.network
            )}
          </strong>

        </div>

      </div>


      <div class="trade-success-actions">

        <button
          type="button"
          id="trade-success-marketplace"
          class="trade-secondary-button"
        >
          Back to Marketplace
        </button>

        <button
          type="button"
          id="trade-success-dashboard"
          class="trade-confirm-button"
        >
          Back to Dashboard
        </button>

      </div>

    </section>

  </main>

</section>

`;

document
.getElementById(
"trade-success-marketplace"
)
?.addEventListener(
"click",
() => {

    window.dispatchEvent(
      new CustomEvent(
        "cap:trade-marketplace-requested"
      )
    );
  }
);

document
.getElementById(
"trade-success-dashboard"
)
?.addEventListener(
"click",
() => {

    window.dispatchEvent(
      new CustomEvent(
        "cap:marketplace-dashboard-requested"
      )
    );
  }
);

}

/* =========================================================
ID GENERATION
========================================================= */

function createId(
prefix
) {

if (
typeof crypto !== "undefined" &&
typeof crypto.randomUUID === "function"
) {

return `${prefix}_${crypto.randomUUID()}`;

}

return "${prefix}_${Date.now()}_${Math .random() .toString(36) .slice(2, 10)}";
}

/* =========================================================
FORMATTING
========================================================= */

function formatNumber(
value
) {

const numeric =
Number(value);

if (!Number.isFinite(numeric)) {
return "0";
}

return new Intl.NumberFormat(
"en-US",
{
maximumFractionDigits: 2,
}
).format(
numeric
);
}

function formatRate(
value
) {

const numeric =
Number(value);

if (!Number.isFinite(numeric)) {
return "0.0000";
}

return numeric.toFixed(4);
}

/* =========================================================
INITIALS
========================================================= */

function getInitials(
name
) {

const parts =
String(
name ||
"CAP User"
)
.trim()
.split(/\s+/)
.filter(Boolean);

if (!parts.length) {
return "C";
}

if (parts.length === 1) {

return parts[0]
  .slice(0, 2)
  .toUpperCase();

}

return (
parts[0][0] +
parts[
parts.length - 1
][0]
).toUpperCase();
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
