/* =========================================================
   CAP MARKETPLACE
   ASSET DEFINITIONS
   ========================================================= */

/**
 * CAP is the platform's proprietary marketplace asset.
 *
 * IMPORTANT:
 * This file defines the asset's rules and metadata.
 * It does not create fake balances, mint supply, or
 * claim that an external asset exists.
 */

export const ASSETS = {
  CAP: {
    symbol: "CAP",
    name: "Capacity Access Pass",

    description:
      "A transferable access unit representing a defined amount of eligible marketplace capacity.",

    assetType: "platform_asset",

    decimals: 2,

    transferable: true,

    supportedSides: [
      "BUY",
      "SELL",
    ],

    status: "active",

    pricing: {
      model: "market_discovered",
      referenceValue: null,
      referenceCurrency: "USDT",
    },

    utility: {
      enabled: true,

      categories: [
        "compute",
        "storage",
        "bandwidth",
        "energy",
        "logistics",
      ],
    },

    validity: {
      timeBound: true,
      transferableUntil: null,
    },

    settlement: {
      supportedCurrencies: [
        "USDT",
        "USDC",
        "BTC",
        "ETH",
        "SOL",
      ],
    },

    restrictions: {
      fractionalTransfer: true,
      minimumOrderSize: 0.01,
    },
  },

  USDT: {
    symbol: "USDT",
    name: "Tether USD",

    assetType: "settlement_currency",

    decimals: 6,

    transferable: true,

    supportedSides: [
      "BUY",
      "SELL",
    ],

    status: "active",
  },

  USDC: {
    symbol: "USDC",
    name: "USD Coin",

    assetType: "settlement_currency",

    decimals: 6,

    transferable: true,

    supportedSides: [
      "BUY",
      "SELL",
    ],

    status: "active",
  },

  BTC: {
    symbol: "BTC",
    name: "Bitcoin",

    assetType: "settlement_currency",

    decimals: 8,

    transferable: true,

    supportedSides: [
      "BUY",
      "SELL",
    ],

    status: "active",
  },

  ETH: {
    symbol: "ETH",
    name: "Ether",

    assetType: "settlement_currency",

    decimals: 8,

    transferable: true,

    supportedSides: [
      "BUY",
      "SELL",
    ],

    status: "active",
  },

  SOL: {
    symbol: "SOL",
    name: "Solana",

    assetType: "settlement_currency",

    decimals: 9,

    transferable: true,

    supportedSides: [
      "BUY",
      "SELL",
    ],

    status: "active",
  },
};


/**
 * Return an asset definition.
 */
export function getAsset(symbol) {
  const normalized = String(symbol || "")
    .trim()
    .toUpperCase();

  return ASSETS[normalized] ?? null;
}


/**
 * Check whether an asset exists.
 */
export function assetExists(symbol) {
  return getAsset(symbol) !== null;
}


/**
 * Check whether an asset is currently active.
 */
export function isAssetActive(symbol) {
  const asset = getAsset(symbol);

  return Boolean(
    asset &&
    asset.status === "active"
  );
}


/**
 * Check whether CAP can be settled in a currency.
 */
export function canSettleCAPWith(symbol) {
  const currency = String(symbol || "")
    .trim()
    .toUpperCase();

  return ASSETS.CAP.settlement.supportedCurrencies.includes(
    currency
  );
}


/**
 * Return assets that can be used as CAP settlement currencies.
 */
export function getCAPSettlementCurrencies() {
  return [...ASSETS.CAP.settlement.supportedCurrencies];
}
