/* =========================================================
   CAP MARKETPLACE
   P2P MARKETPLACE SCREEN
   ========================================================= */

import {
  state,
} from "./state.js";

import {
  getCurrentAccount,
} from "./auth.js";


/* =========================================================
   DEMO MARKETPLACE DATA
   ========================================================= */

/*
 * These are frontend prototype offers.
 *
 * They are stored in the central application state so later
 * modules can operate on the same offer objects.
 *
 * No backend or real-money transaction is implied.
 */

const DEMO_OFFERS = [
  {
    id: "offer_cap_001",
    trader: "Alex",
    traderInitial: "A",
    reputation: 98,
    status: "online",

    side: "sell",

    asset: "CAP",
    assetName: "Capacity Access Pass",

    amount: 100,

    rate: 0.95,
    quote: "USDT",

    network: "CAP Network",

    minTrade: 10,
    maxTrade: 100,

    payment: "USDT",

    location: "Global",

    createdAt: new Date().toISOString(),
  },

  {
    id: "offer_cap_002",
    trader: "Brian",
    traderInitial: "B",
    reputation: 96,
    status: "online",

    side: "sell",

    asset: "CAP",
    assetName: "Capacity Access Pass",

    amount: 250,

    rate: 0.97,
    quote: "USDC",

    network: "CAP Network",

    minTrade: 25,
    maxTrade: 250,

    payment: "USDC",

    location: "Global",

    createdAt: new Date().toISOString(),
  },

  {
    id: "offer_cap_003",
    trader: "Sarah",
    traderInitial: "S",
    reputation: 94,
    status: "away",

    side: "sell",

    asset: "CAP",
    assetName: "Capacity Access Pass",

    amount: 500,

    rate: 0.92,
    quote: "USDT",

    network: "CAP Network",

    minTrade: 50,
    maxTrade: 500,

    payment: "USDT",

    location: "Global",

    createdAt: new Date().toISOString(),
  },

  {
    id: "offer_cap_004",
    trader: "David",
    traderInitial: "D",
    reputation: 97,
    status: "online",

    side: "buy",

    asset: "CAP",
    assetName: "Capacity Access Pass",

    amount: 180,

    rate: 1.02,
    quote: "USDC",

    network: "CAP Network",

    minTrade: 20,
    maxTrade: 180,

    payment: "USDC",

    location: "Global",

    createdAt: new Date().toISOString(),
  },

  {
    id: "offer_cap_005",
    trader: "Maya",
    traderInitial: "M",
    reputation: 95,
    status: "online",

    side: "buy",

    asset: "CAP",
    assetName: "Capacity Access Pass",

    amount: 300,

    rate: 1.01,
    quote: "USDT",

    network: "CAP Network",

    minTrade: 25,
    maxTrade: 300,

    payment: "USDT",

    location: "Global",

    createdAt: new Date().toISOString(),
  },
];


/* =========================================================
   INITIALIZE OFFERS
   ========================================================= */

function ensureMarketplaceOffers() {

  if (
    !Array.isArray(
      state.marketplace.offers
    ) ||
    state.marketplace.offers.length === 0
  ) {

    state.marketplace.offers =
      DEMO_OFFERS.map(
        (offer) => ({
          ...offer,
        })
      );
  }
}


/* =========================================================
   RENDER MARKETPLACE
   ========================================================= */

export function renderMarketplace(app) {

  const account =
    getCurrentAccount();


  if (!account) {

    throw new Error(
      "CAP Marketplace: marketplace requires an authenticated account."
    );
  }


  ensureMarketplaceOffers();


  const firstName =
    account.fullName
      .trim()
      .split(/\s+/)[0] || "User";


  app.innerHTML = `
    <section class="marketplace-page">

      <!-- =================================================
           HEADER
           ================================================= -->

      <header class="marketplace-header">

        <div class="marketplace-brand">

          <button
            type="button"
            class="marketplace-back"
            data-marketplace-action="dashboard"
            aria-label="Back to dashboard"
          >
            ←
          </button>

          <img
            class="marketplace-logo"
            src="assets/icons/cap-logo.png"
            alt="CAP Marketplace"
          />

          <div class="marketplace-brand-text">

            <strong>
              CAP Marketplace
            </strong>

            <span>
              P2P Opportunity Exchange
            </span>

          </div>

        </div>


        <div class="marketplace-account">

          <span class="marketplace-user-name">
            ${escapeHtml(firstName)}
          </span>

          <div
            class="marketplace-avatar"
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

      <main class="marketplace-main">


        <!-- =================================================
             PAGE INTRO
             ================================================= -->

        <section class="marketplace-intro">

          <div>

            <span class="marketplace-eyebrow">
              P2P MARKETPLACE
            </span>

            <h1>
              Buy &amp; sell CAP
            </h1>

            <p>
              Explore available capacity offers and compare
              prices, settlement currencies, networks, and limits.
            </p>

          </div>


          <div class="marketplace-live-status">

            <span class="marketplace-live-dot"></span>

            <span>
              MARKETPLACE ONLINE
            </span>

          </div>

        </section>


        <!-- =================================================
             FILTERS
             ================================================= -->

        <section class="marketplace-filter-panel">

          <div class="marketplace-filter-group">

            <span class="marketplace-filter-label">
              TRADE SIDE
            </span>

            <div
              class="marketplace-segment"
              role="group"
              aria-label="Trade side"
            >

              <button
                type="button"
                class="marketplace-segment-button is-active"
                data-filter-side="sell"
                aria-pressed="true"
              >
                Buy CAP
              </button>

              <button
                type="button"
                class="marketplace-segment-button"
                data-filter-side="buy"
                aria-pressed="false"
              >
                Sell CAP
              </button>

            </div>

          </div>


          <div class="marketplace-filter-group">

            <label
              class="marketplace-filter-label"
              for="marketplace-asset-filter"
            >
              ASSET
            </label>

            <select
              id="marketplace-asset-filter"
              class="marketplace-select"
            >

              <option value="ALL">
                All assets
              </option>

              <option value="CAP" selected>
                CAP
              </option>

            </select>

          </div>


          <div class="marketplace-filter-group">

            <label
              class="marketplace-filter-label"
              for="marketplace-network-filter"
            >
              NETWORK
            </label>

            <select
              id="marketplace-network-filter"
              class="marketplace-select"
            >

              <option value="ALL">
                All networks
              </option>

              <option
                value="CAP Network"
                selected
              >
                CAP Network
              </option>

            </select>

          </div>


          <div class="marketplace-filter-group">

            <label
              class="marketplace-filter-label"
              for="marketplace-quote-filter"
            >
              SETTLEMENT
            </label>

            <select
              id="marketplace-quote-filter"
              class="marketplace-select"
            >

              <option value="ALL">
                All currencies
              </option>

              <option value="USDT">
                USDT
              </option>

              <option value="USDC">
                USDC
              </option>

            </select>

          </div>


          <button
            type="button"
            class="marketplace-refresh"
            id="marketplace-refresh"
          >
            Refresh
          </button>

        </section>


        <!-- =================================================
             MARKET SUMMARY
             ================================================= -->

        <section class="marketplace-summary">

          <div class="marketplace-summary-item">

            <span>
              AVAILABLE OFFERS
            </span>

            <strong id="marketplace-offer-count">
              0
            </strong>

          </div>


          <div class="marketplace-summary-item">

            <span>
              SELECTED SIDE
            </span>

            <strong id="marketplace-side-summary">
              BUY CAP
            </strong>

          </div>


          <div class="marketplace-summary-item">

            <span>
              SETTLEMENT
            </span>

            <strong id="marketplace-quote-summary">
              ALL
            </strong>

          </div>

        </section>


        <!-- =================================================
             OFFERS
             ================================================= -->

        <section class="marketplace-offers-section">

          <div class="marketplace-section-heading">

            <div>

              <span class="marketplace-eyebrow">
                OFFER BOOK
              </span>

              <h2>
                Available opportunities
              </h2>

            </div>

          </div>


          <div
            id="marketplace-offer-list"
            class="marketplace-offer-list"
            role="list"
            aria-live="polite"
          ></div>

        </section>


      </main>


      <!-- =================================================
           FOOTER
           ================================================= -->

      <footer class="marketplace-footer">

        <span>
          CAP Marketplace
        </span>

        <span>
          Frontend prototype
        </span>

      </footer>

    </section>
  `;


  attachMarketplaceEvents();

  renderOffers();
}


/* =========================================================
   RENDER OFFERS
   ========================================================= */

function renderOffers() {

  const container =
    document.getElementById(
      "marketplace-offer-list"
    );


  if (!container) {
    return;
  }


  const filters =
    state.marketplace.filters;


  let offers =
    state.marketplace.offers
      .filter(
        (offer) => {

          const requestedSide =
            filters.side === "all"
              ? null
              : filters.side;


          const requestedAsset =
            filters.asset === "all"
              ? null
              : filters.asset;


          const requestedNetwork =
            filters.network === "all"
              ? null
              : filters.network;


          const requestedQuote =
            filters.settlementCurrency === "all"
              ? null
              : filters.settlementCurrency;


          /*
           * Marketplace semantics:
           *
           * A SELL offer means the counterparty sells CAP,
           * therefore the user can BUY CAP.
           *
           * A BUY offer means the counterparty buys CAP,
           * therefore the user can SELL CAP.
           */
          if (
            requestedSide === "buy" &&
            offer.side !== "sell"
          ) {
            return false;
          }


          if (
            requestedSide === "sell" &&
            offer.side !== "buy"
          ) {
            return false;
          }


          if (
            requestedAsset &&
            offer.asset !== requestedAsset
          ) {
            return false;
          }


          if (
            requestedNetwork &&
            offer.network !== requestedNetwork
          ) {
            return false;
          }


          if (
            requestedQuote &&
            offer.quote !== requestedQuote
          ) {
            return false;
          }


          return true;
        }
      );


  const offerCount =
    offers.length;


  updateSummary(
    offerCount
  );


  if (!offerCount) {

    container.innerHTML = `
      <div class="marketplace-empty">

        <div
          class="marketplace-empty-icon"
          aria-hidden="true"
        >
          —
        </div>

        <h3>
          No matching offers
        </h3>

        <p>
          Try changing the asset, settlement currency,
          network, or trade side.
        </p>

      </div>
    `;

    return;
  }


  container.innerHTML =
    offers
      .map(
        renderOfferCard
      )
      .join("");


  attachOfferEvents();
}


/* =========================================================
   OFFER CARD
   ========================================================= */

function renderOfferCard(
  offer
) {

  const userAction =
    offer.side === "sell"
      ? "BUY CAP"
      : "SELL CAP";


  const price =
    formatRate(
      offer.rate
    );


  const totalValue =
    offer.amount *
    offer.rate;


  const statusClass =
    offer.status === "online"
      ? "is-online"
      : offer.status === "away"
        ? "is-away"
        : "is-offline";


  return `
    <article
      class="marketplace-offer"
      role="listitem"
      data-offer-id="${escapeHtml(offer.id)}"
    >

      <!-- COUNTERPARTY -->

      <div class="marketplace-offer-counterparty">

        <div
          class="marketplace-trader-avatar ${statusClass}"
          aria-hidden="true"
        >
          ${escapeHtml(
            offer.traderInitial
          )}
        </div>

        <div class="marketplace-trader-info">

          <strong>
            ${escapeHtml(offer.trader)}
          </strong>

          <span>
            ${escapeHtml(offer.location)}
          </span>

        </div>

        <div class="marketplace-reputation">
          <span>
            ★
          </span>

          <strong>
            ${escapeHtml(
              offer.reputation
            )}
          </strong>
        </div>

      </div>


      <!-- OFFER DETAILS -->

      <div class="marketplace-offer-details">

        <div class="marketplace-offer-detail">

          <span>
            ASSET
          </span>

          <strong>
            ${escapeHtml(offer.asset)}
          </strong>

        </div>


        <div class="marketplace-offer-detail">

          <span>
            AVAILABLE
          </span>

          <strong>
            ${formatNumber(offer.amount)}
            ${escapeHtml(offer.asset)}
          </strong>

        </div>


        <div class="marketplace-offer-detail">

          <span>
            PRICE
          </span>

          <strong>
            ${price}
            ${escapeHtml(offer.quote)}
          </strong>

        </div>


        <div class="marketplace-offer-detail">

          <span>
            LIMITS
          </span>

          <strong>
            ${formatNumber(offer.minTrade)}
            –
            ${formatNumber(offer.maxTrade)}
            ${escapeHtml(offer.asset)}
          </strong>

        </div>

      </div>


      <!-- SETTLEMENT -->

      <div class="marketplace-offer-settlement">

        <span>
          ${escapeHtml(offer.network)}
        </span>

        <span class="marketplace-separator">
          •
        </span>

        <span>
          ${escapeHtml(offer.payment)}
        </span>

        <span class="marketplace-separator">
          •
        </span>

        <span>
          Max value
          ${formatNumber(totalValue)}
          ${escapeHtml(offer.quote)}
        </span>

      </div>


      <!-- ACTIONS -->

      <div class="marketplace-offer-actions">

        <button
          type="button"
          class="marketplace-profile-button"
          data-profile-id="${escapeHtml(offer.id)}"
        >
          View profile
        </button>


        <button
          type="button"
          class="marketplace-chat-button"
          data-chat-id="${escapeHtml(offer.id)}"
        >
          Chat
        </button>


        <button
          type="button"
          class="marketplace-order-button"
          data-order-id="${escapeHtml(offer.id)}"
        >
          ${escapeHtml(userAction)}
        </button>

      </div>

    </article>
  `;
}


/* =========================================================
   MARKETPLACE EVENTS
   ========================================================= */

function attachMarketplaceEvents() {

  const sideButtons =
    document.querySelectorAll(
      "[data-filter-side]"
    );


  sideButtons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const side =
            button.dataset.filterSide;


          state.marketplace.filters.side =
            side;


          sideButtons.forEach(
            (item) => {

              const active =
                item === button;

              item.classList.toggle(
                "is-active",
                active
              );

              item.setAttribute(
                "aria-pressed",
                String(active)
              );
            }
          );


          renderOffers();
        }
      );
    }
  );


  const assetFilter =
    document.getElementById(
      "marketplace-asset-filter"
    );


  assetFilter?.addEventListener(
    "change",
    () => {

      state.marketplace.filters.asset =
        normalizeFilter(
          assetFilter.value
        );


      renderOffers();
    }
  );


  const networkFilter =
    document.getElementById(
      "marketplace-network-filter"
    );


  networkFilter?.addEventListener(
    "change",
    () => {

      state.marketplace.filters.network =
        normalizeFilter(
          networkFilter.value
        );


      renderOffers();
    }
  );


  const quoteFilter =
    document.getElementById(
      "marketplace-quote-filter"
    );


  quoteFilter?.addEventListener(
    "change",
    () => {

      state.marketplace.filters.settlementCurrency =
        normalizeFilter(
          quoteFilter.value
        );


      renderOffers();
    }
  );


  const refreshButton =
    document.getElementById(
      "marketplace-refresh"
    );


  refreshButton?.addEventListener(
    "click",
    () => {

      refreshDemoOffers();

      renderOffers();
    }
  );


  const backButton =
    document.querySelector(
      "[data-marketplace-action='dashboard']"
    );


  backButton?.addEventListener(
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
   OFFER EVENTS
   ========================================================= */

function attachOfferEvents() {

  const profileButtons =
    document.querySelectorAll(
      "[data-profile-id]"
    );


  profileButtons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const offer =
            findOffer(
              button.dataset.profileId
            );


          if (!offer) {
            return;
          }


          showMarketplaceNotice(
            `${offer.trader} • ${offer.reputation}% reputation`
          );
        }
      );
    }
  );


  const chatButtons =
    document.querySelectorAll(
      "[data-chat-id]"
    );


  chatButtons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const offer =
            findOffer(
              button.dataset.chatId
            );


          if (!offer) {
            return;
          }


          showMarketplaceNotice(
            `Chat with ${offer.trader} will be connected to the messaging module.`
          );
        }
      );
    }
  );


  const orderButtons =
    document.querySelectorAll(
      "[data-order-id]"
    );


  orderButtons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const offer =
            findOffer(
              button.dataset.orderId
            );


          if (!offer) {
            return;
          }


          state.marketplace.selectedOfferId =
            offer.id;


          showMarketplaceNotice(
            `${offer.side === "sell" ? "BUY" : "SELL"} ${offer.asset} selected from ${offer.trader}.`
          );


          window.dispatchEvent(
            new CustomEvent(
              "cap:offer-selected",
              {
                detail: {
                  offer,
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
   FILTER SUMMARY
   ========================================================= */

function updateSummary(
  count
) {

  const countElement =
    document.getElementById(
      "marketplace-offer-count"
    );


  if (countElement) {
    countElement.textContent =
      String(count);
  }


  const sideElement =
    document.getElementById(
      "marketplace-side-summary"
    );


  if (sideElement) {

    sideElement.textContent =
      state.marketplace.filters.side === "sell"
        ? "BUY CAP"
        : state.marketplace.filters.side === "buy"
          ? "SELL CAP"
          : "ALL";
  }


  const quoteElement =
    document.getElementById(
      "marketplace-quote-summary"
    );


  if (quoteElement) {

    quoteElement.textContent =
      state.marketplace.filters.settlementCurrency === "all"
        ? "ALL"
        : state.marketplace.filters
            .settlementCurrency;
  }
}


/* =========================================================
   DEMO OFFER REFRESH
   ========================================================= */

function refreshDemoOffers() {

  state.marketplace.offers =
    state.marketplace.offers.map(
      (offer) => {

        const movement =
          (
            Math.random() -
            0.5
          ) * 0.02;


        return {
          ...offer,
          rate:
            Math.max(
              0.01,
              offer.rate + movement
            ),

          updatedAt:
            new Date().toISOString(),
        };
      }
    );
}


/* =========================================================
   OFFER LOOKUP
   ========================================================= */

function findOffer(
  offerId
) {

  return state.marketplace.offers.find(
    (offer) =>
      String(offer.id) ===
      String(offerId)
  );
}


/* =========================================================
   NOTICE
   ========================================================= */

function showMarketplaceNotice(
  message
) {

  let notice =
    document.getElementById(
      "marketplace-notice"
    );


  if (!notice) {

    notice =
      document.createElement(
        "div"
      );

    notice.id =
      "marketplace-notice";

    notice.className =
      "marketplace-notice";

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
      2600
    );
}


/* =========================================================
   HELPERS
   ========================================================= */

function normalizeFilter(
  value
) {

  return String(
    value || "ALL"
  ).toLowerCase() === "all"
    ? "all"
    : String(value);
}


function formatNumber(
  value
) {

  return new Intl.NumberFormat(
    undefined,
    {
      maximumFractionDigits: 2,
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
  ).toFixed(4);
}


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
