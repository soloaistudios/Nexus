/* =========================================================
   CAP MARKETPLACE
   WALLET MODULE
   ========================================================= */

import {
  state,
} from "./state.js";


/* =========================================================
   SUPPORTED ASSETS
   ========================================================= */

const WALLET_ASSETS = Object.freeze([
  {
    symbol: "USDT",
    name: "Tether",
    type: "Settlement",
  },

  {
    symbol: "USDC",
    name: "USD Coin",
    type: "Settlement",
  },

  {
    symbol: "BTC",
    name: "Bitcoin",
    type: "Crypto",
  },

  {
    symbol: "ETH",
    name: "Ethereum",
    type: "Crypto",
  },

  {
    symbol: "SOL",
    name: "Solana",
    type: "Crypto",
  },

  {
    symbol: "CAP",
    name: "Capacity Access Pass",
    type: "CAP Asset",
  },
]);


/* =========================================================
   INITIALIZE WALLET STATE
   ========================================================= */

/**
 * Ensure the central wallet structure exists and every
 * supported asset has both available and reserved values.
 */
function ensureWalletState() {

  if (!state.wallet || typeof state.wallet !== "object") {

    state.wallet = {
      balances: {},
      reserved: {},
    };
  }


  if (
    !state.wallet.balances ||
    typeof state.wallet.balances !== "object"
  ) {

    state.wallet.balances = {};
  }


  if (
    !state.wallet.reserved ||
    typeof state.wallet.reserved !== "object"
  ) {

    state.wallet.reserved = {};
  }


  WALLET_ASSETS.forEach(
    (asset) => {

      if (
        typeof state.wallet.balances[asset.symbol] !==
        "number"
      ) {

        state.wallet.balances[asset.symbol] = 0;
      }


      if (
        typeof state.wallet.reserved[asset.symbol] !==
        "number"
      ) {

        state.wallet.reserved[asset.symbol] = 0;
      }
    }
  );
}


/* =========================================================
   WALLET SCREEN
   ========================================================= */

export function renderWallet(app) {

  if (!app) {

    throw new Error(
      "CAP Wallet: application mount point was not provided."
    );
  }


  ensureWalletState();


  app.innerHTML = `
    <section class="wallet-page">

      <!-- =================================================
           HEADER
           ================================================= -->

      <header class="wallet-header">

        <div class="wallet-header-left">

          <button
            type="button"
            class="wallet-back-button"
            data-wallet-action="dashboard"
            aria-label="Back to dashboard"
          >
            ←
          </button>

          <div class="wallet-header-title">

            <span class="wallet-eyebrow">
              CAP WALLET
            </span>

            <h1>
              Your assets
            </h1>

            <p>
              Manage available and reserved balances across
              your supported CAP Marketplace assets.
            </p>

          </div>

        </div>


        <div class="wallet-status">

          <span class="wallet-status-dot"></span>

          <span>
            WALLET ACTIVE
          </span>

        </div>

      </header>


      <!-- =================================================
           MAIN
           ================================================= -->

      <main class="wallet-main">


        <!-- =================================================
             PORTFOLIO SUMMARY
             ================================================= -->

        <section class="wallet-summary-grid">

          <article class="wallet-summary-card">

            <span class="wallet-summary-label">
              TOTAL ASSETS
            </span>

            <strong
              id="wallet-asset-count"
              class="wallet-summary-value"
            >
              0
            </strong>

            <span class="wallet-summary-meta">
              Supported asset balances
            </span>

          </article>


          <article class="wallet-summary-card">

            <span class="wallet-summary-label">
              TOTAL AVAILABLE
            </span>

            <strong
              id="wallet-available-value"
              class="wallet-summary-value"
            >
              0
            </strong>

            <span class="wallet-summary-meta">
              Across all asset units
            </span>

          </article>


          <article class="wallet-summary-card">

            <span class="wallet-summary-label">
              TOTAL RESERVED
            </span>

            <strong
              id="wallet-reserved-value"
              class="wallet-summary-value"
            >
              0
            </strong>

            <span class="wallet-summary-meta">
              Currently locked in trades
            </span>

          </article>


          <article class="wallet-summary-card">

            <span class="wallet-summary-label">
              ACTIVE ORDERS
            </span>

            <strong
              id="wallet-order-count"
              class="wallet-summary-value"
            >
              0
            </strong>

            <span class="wallet-summary-meta">
              Open marketplace orders
            </span>

          </article>

        </section>


        <!-- =================================================
             WALLET ACTIONS
             ================================================= -->

        <section class="wallet-actions-panel">

          <div class="wallet-section-heading">

            <div>

              <span class="wallet-eyebrow">
                WALLET ACTIONS
              </span>

              <h2>
                Manage funds
              </h2>

            </div>

          </div>


          <div class="wallet-action-grid">

            <button
              type="button"
              class="wallet-action-button wallet-action-primary"
              data-wallet-action="deposit"
            >

              <span class="wallet-action-icon">
                +
              </span>

              <span>
                Deposit
              </span>

            </button>


            <button
              type="button"
              class="wallet-action-button"
              data-wallet-action="withdraw"
            >

              <span class="wallet-action-icon">
                ↑
              </span>

              <span>
                Withdraw
              </span>

            </button>


            <button
              type="button"
              class="wallet-action-button"
              data-wallet-action="transfer"
            >

              <span class="wallet-action-icon">
                ⇄
              </span>

              <span>
                Transfer
              </span>

            </button>


            <button
              type="button"
              class="wallet-action-button"
              data-wallet-action="marketplace"
            >

              <span class="wallet-action-icon">
                ◆
              </span>

              <span>
                Marketplace
              </span>

            </button>

          </div>

        </section>


        <!-- =================================================
             ASSET LIST
             ================================================= -->

        <section class="wallet-assets-section">

          <div class="wallet-section-heading">

            <div>

              <span class="wallet-eyebrow">
                ASSET BALANCES
              </span>

              <h2>
                Portfolio
              </h2>

            </div>


            <button
              type="button"
              class="wallet-refresh-button"
              id="wallet-refresh"
            >
              Refresh
            </button>

          </div>


          <div
            id="wallet-asset-list"
            class="wallet-asset-list"
            role="list"
          ></div>

        </section>


        <!-- =================================================
             RESERVATION INFORMATION
             ================================================= -->

        <section class="wallet-info-panel">

          <div class="wallet-info-icon">
            i
          </div>

          <div>

            <strong>
              Reserved balances
            </strong>

            <p>
              Funds reserved for active marketplace trades
              remain locked until the order is completed
              or cancelled.
            </p>

          </div>

        </section>

      </main>


      <!-- =================================================
           FOOTER
           ================================================= -->

      <footer class="wallet-footer">

        <span>
          CAP Marketplace
        </span>

        <span>
          Wallet module
        </span>

      </footer>

    </section>
  `;


  attachWalletEvents();

  renderWalletBalances();
}


/* =========================================================
   RENDER BALANCES
   ========================================================= */

function renderWalletBalances() {

  ensureWalletState();


  const container =
    document.getElementById(
      "wallet-asset-list"
    );


  if (!container) {
    return;
  }


  container.innerHTML =
    WALLET_ASSETS
      .map(
        renderAssetCard
      )
      .join("");


  updateWalletSummary();
}


/* =========================================================
   ASSET CARD
   ========================================================= */

function renderAssetCard(
  asset
) {

  const available =
    getAvailableBalance(
      asset.symbol
    );


  const reserved =
    getReservedBalance(
      asset.symbol
    );


  const total =
    available +
    reserved;


  const initials =
    asset.symbol
      .slice(
        0,
        2
      );


  return `
    <article
      class="wallet-asset-card"
      role="listitem"
      data-wallet-asset="${escapeHtml(
        asset.symbol
      )}"
    >

      <div class="wallet-asset-identity">

        <div
          class="wallet-asset-icon"
          aria-hidden="true"
        >
          ${escapeHtml(
            initials
          )}
        </div>

        <div class="wallet-asset-name">

          <strong>
            ${escapeHtml(
              asset.symbol
            )}
          </strong>

          <span>
            ${escapeHtml(
              asset.name
            )}
          </span>

        </div>

      </div>


      <div class="wallet-asset-type">

        ${escapeHtml(
          asset.type
        )}

      </div>


      <div class="wallet-balance-block">

        <span>
          AVAILABLE
        </span>

        <strong>
          ${formatNumber(
            available
          )}
          ${escapeHtml(
            asset.symbol
          )}
        </strong>

      </div>


      <div class="wallet-balance-block">

        <span>
          RESERVED
        </span>

        <strong class="${
          reserved > 0
            ? "is-reserved"
            : ""
        }">
          ${formatNumber(
            reserved
          )}
          ${escapeHtml(
            asset.symbol
          )}
        </strong>

      </div>


      <div class="wallet-balance-block wallet-balance-total">

        <span>
          TOTAL
        </span>

        <strong>
          ${formatNumber(
            total
          )}
          ${escapeHtml(
            asset.symbol
          )}
        </strong>

      </div>


      <div class="wallet-asset-actions">

        <button
          type="button"
          class="wallet-mini-button"
          data-wallet-deposit="${escapeHtml(
            asset.symbol
          )}"
        >
          Deposit
        </button>


        <button
          type="button"
          class="wallet-mini-button"
          data-wallet-withdraw="${escapeHtml(
            asset.symbol
          )}"
        >
          Withdraw
        </button>

      </div>

    </article>
  `;
}


/* =========================================================
   WALLET EVENTS
   ========================================================= */

function attachWalletEvents() {

  const backButton =
    document.querySelector(
      "[data-wallet-action='dashboard']"
    );


  backButton?.addEventListener(
    "click",
    () => {

      window.dispatchEvent(
        new CustomEvent(
          "cap:wallet-dashboard-requested"
        )
      );
    }
  );


  const marketplaceButton =
    document.querySelector(
      "[data-wallet-action='marketplace']"
    );


  marketplaceButton?.addEventListener(
    "click",
    () => {

      window.dispatchEvent(
        new CustomEvent(
          "cap:wallet-marketplace-requested"
        )
      );
    }
  );


  const depositButton =
    document.querySelector(
      "[data-wallet-action='deposit']"
    );


  depositButton?.addEventListener(
    "click",
    () => {

      showWalletNotice(
        "Choose an asset below to begin a deposit."
      );
    }
  );


  const withdrawButton =
    document.querySelector(
      "[data-wallet-action='withdraw']"
    );


  withdrawButton?.addEventListener(
    "click",
    () => {

      showWalletNotice(
        "Choose an asset below to begin a withdrawal."
      );
    }
  );


  const transferButton =
    document.querySelector(
      "[data-wallet-action='transfer']"
    );


  transferButton?.addEventListener(
    "click",
    () => {

      showWalletNotice(
        "Internal wallet transfers will be connected to the transfer module."
      );
    }
  );


  const refreshButton =
    document.getElementById(
      "wallet-refresh"
    );


  refreshButton?.addEventListener(
    "click",
    () => {

      ensureWalletState();

      renderWalletBalances();

      showWalletNotice(
        "Wallet balances refreshed."
      );
    }
  );


  attachAssetActionEvents();
}


/* =========================================================
   ASSET ACTION EVENTS
   ========================================================= */

function attachAssetActionEvents() {

  const depositButtons =
    document.querySelectorAll(
      "[data-wallet-deposit]"
    );


  depositButtons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const asset =
            button.dataset.walletDeposit;


          if (!asset) {
            return;
          }


          openDepositFlow(
            asset
          );
        }
      );
    }
  );


  const withdrawButtons =
    document.querySelectorAll(
      "[data-wallet-withdraw]"
    );


  withdrawButtons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const asset =
            button.dataset.walletWithdraw;


          if (!asset) {
            return;
          }


          openWithdrawFlow(
            asset
          );
        }
      );
    }
  );
}


/* =========================================================
   DEPOSIT FLOW
   ========================================================= */

/**
 * Frontend prototype deposit action.
 *
 * This does not connect to a blockchain or payment rail.
 * It simply demonstrates the wallet funding integration
 * point without inventing external transaction behavior.
 */
function openDepositFlow(
  asset
) {

  const definition =
    getAssetDefinition(
      asset
    );


  if (!definition) {
    return;
  }


  const amountText =
    window.prompt(
      `Enter ${asset} amount to deposit:`
    );


  if (
    amountText === null
  ) {
    return;
  }


  const amount =
    Number(
      amountText
    );


  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    showWalletNotice(
      "Enter a valid positive amount."
    );

    return;
  }


  creditAvailableBalance(
    asset,
    amount
  );


  renderWalletBalances();


  showWalletNotice(
    `${formatNumber(amount)} ${asset} added to available balance.`
  );
}


/* =========================================================
   WITHDRAW FLOW
   ========================================================= */

/**
 * Frontend prototype withdrawal action.
 *
 * The withdrawal is limited by the available balance and
 * never touches reserved funds.
 */
function openWithdrawFlow(
  asset
) {

  const available =
    getAvailableBalance(
      asset
    );


  if (
    available <= 0
  ) {

    showWalletNotice(
      `No available ${asset} balance to withdraw.`
    );

    return;
  }


  const amountText =
    window.prompt(
      `Enter ${asset} amount to withdraw:\nAvailable: ${formatNumber(
        available
      )}`
    );


  if (
    amountText === null
  ) {
    return;
  }


  const amount =
    Number(
      amountText
    );


  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {

    showWalletNotice(
      "Enter a valid positive amount."
    );

    return;
  }


  if (
    amount > available
  ) {

    showWalletNotice(
      `Insufficient available ${asset} balance.`
    );

    return;
  }


  debitAvailableBalance(
    asset,
    amount
  );


  renderWalletBalances();


  showWalletNotice(
    `${formatNumber(amount)} ${asset} withdrawn from available balance.`
  );
}


/* =========================================================
   BALANCE HELPERS
   ========================================================= */

export function getAvailableBalance(
  asset
) {

  ensureWalletState();


  return Math.max(
    0,
    Number(
      state.wallet.balances[asset]
    ) || 0
  );
}


export function getReservedBalance(
  asset
) {

  ensureWalletState();


  return Math.max(
    0,
    Number(
      state.wallet.reserved[asset]
    ) || 0
  );
}


export function getTotalBalance(
  asset
) {

  return (
    getAvailableBalance(asset) +
    getReservedBalance(asset)
  );
}


/* =========================================================
   CREDIT AVAILABLE BALANCE
   ========================================================= */

export function creditAvailableBalance(
  asset,
  amount
) {

  validateAsset(
    asset
  );


  const value =
    normalizeAmount(
      amount
    );


  state.wallet.balances[asset] +=
    value;


  return getAvailableBalance(
    asset
  );
}


/* =========================================================
   DEBIT AVAILABLE BALANCE
   ========================================================= */

export function debitAvailableBalance(
  asset,
  amount
) {

  validateAsset(
    asset
  );


  const value =
    normalizeAmount(
      amount
    );


  const available =
    getAvailableBalance(
      asset
    );


  if (
    value > available
  ) {

    throw new Error(
      `CAP Wallet: insufficient available ${asset} balance.`
    );
  }


  state.wallet.balances[asset] =
    available -
    value;


  return getAvailableBalance(
    asset
  );
}


/* =========================================================
   RESERVE BALANCE
   ========================================================= */

export function reserveBalance(
  asset,
  amount
) {

  validateAsset(
    asset
  );


  const value =
    normalizeAmount(
      amount
    );


  const available =
    getAvailableBalance(
      asset
    );


  if (
    value > available
  ) {

    throw new Error(
      `CAP Wallet: insufficient available ${asset} balance.`
    );
  }


  state.wallet.balances[asset] =
    available -
    value;


  state.wallet.reserved[asset] =
    getReservedBalance(asset) +
    value;


  return {
    available:
      getAvailableBalance(asset),

    reserved:
      getReservedBalance(asset),

    total:
      getTotalBalance(asset),
  };
}


/* =========================================================
   RELEASE RESERVED BALANCE
   ========================================================= */

export function releaseReservedBalance(
  asset,
  amount
) {

  validateAsset(
    asset
  );


  const value =
    normalizeAmount(
      amount
    );


  const reserved =
    getReservedBalance(
      asset
    );


  if (
    value > reserved
  ) {

    throw new Error(
      `CAP Wallet: insufficient reserved ${asset} balance.`
    );
  }


  state.wallet.reserved[asset] =
    reserved -
    value;


  state.wallet.balances[asset] =
    getAvailableBalance(asset) +
    value;


  return {
    available:
      getAvailableBalance(asset),

    reserved:
      getReservedBalance(asset),

    total:
      getTotalBalance(asset),
  };
}


/* =========================================================
   CONSUME RESERVED BALANCE
   ========================================================= */

/**
 * Removes funds from the reserved balance permanently.
 *
 * This is intended for order completion when the reserved
 * asset has actually been transferred to the counterparty.
 */
export function consumeReservedBalance(
  asset,
  amount
) {

  validateAsset(
    asset
  );


  const value =
    normalizeAmount(
      amount
    );


  const reserved =
    getReservedBalance(
      asset
    );


  if (
    value > reserved
  ) {

    throw new Error(
      `CAP Wallet: insufficient reserved ${asset} balance.`
    );
  }


  state.wallet.reserved[asset] =
    reserved -
    value;


  return {
    available:
      getAvailableBalance(asset),

    reserved:
      getReservedBalance(asset),

    total:
      getTotalBalance(asset),
  };
}


/* =========================================================
   WALLET SUMMARY
   ========================================================= */

function updateWalletSummary() {

  const assetCountElement =
    document.getElementById(
      "wallet-asset-count"
    );


  const availableElement =
    document.getElementById(
      "wallet-available-value"
    );


  const reservedElement =
    document.getElementById(
      "wallet-reserved-value"
    );


  const orderCountElement =
    document.getElementById(
      "wallet-order-count"
    );


  if (assetCountElement) {

    assetCountElement.textContent =
      String(
        WALLET_ASSETS.length
      );
  }


  let availableTotal =
    0;

  let reservedTotal =
    0;


  WALLET_ASSETS.forEach(
    (asset) => {

      availableTotal +=
        getAvailableBalance(
          asset.symbol
        );

      reservedTotal +=
        getReservedBalance(
          asset.symbol
        );
    }
  );


  if (availableElement) {

    availableElement.textContent =
      formatNumber(
        availableTotal
      );
  }


  if (reservedElement) {

    reservedElement.textContent =
      formatNumber(
        reservedTotal
      );
  }


  const activeOrders =
    Array.isArray(
      state.orders?.active
    )
      ? state.orders.active.length
      : 0;


  if (orderCountElement) {

    orderCountElement.textContent =
      String(
        activeOrders
      );
  }
}


/* =========================================================
   ASSET DEFINITION
   ========================================================= */

function getAssetDefinition(
  symbol
) {

  return WALLET_ASSETS.find(
    (asset) =>
      asset.symbol === symbol
  ) || null;
}


/* =========================================================
   ASSET VALIDATION
   ========================================================= */

function validateAsset(
  asset
) {

  const definition =
    getAssetDefinition(
      asset
    );


  if (!definition) {

    throw new Error(
      `CAP Wallet: unsupported asset "${asset}".`
    );
  }


  return definition;
}


/* =========================================================
   AMOUNT NORMALIZATION
   ========================================================= */

function normalizeAmount(
  amount
) {

  const value =
    Number(
      amount
    );


  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {

    throw new Error(
      "CAP Wallet: amount must be a positive number."
    );
  }


  return value;
}


/* =========================================================
   NOTICE
   ========================================================= */

function showWalletNotice(
  message
) {

  let notice =
    document.getElementById(
      "wallet-notice"
    );


  if (!notice) {

    notice =
      document.createElement(
        "div"
      );

    notice.id =
      "wallet-notice";

    notice.className =
      "wallet-notice";

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
      2800
    );
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


/* =========================================================
   MODULE STARTUP SAFETY
   ========================================================= */

ensureWalletState();
