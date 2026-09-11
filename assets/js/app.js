/* =========================================================
   CAP MARKETPLACE
   APPLICATION ROUTER / BOOTSTRAP
   ========================================================= */

/*
   DEBUG MUST START FIRST.

   The debug module captures:
   - JavaScript errors
   - unhandled Promise rejections
   - console.error()
   - CAP application events

   It also provides the on-screen DEBUG panel and
   Copy Bug Report functionality.
*/

import {
  initCAPDebug,
  addDebugEntry,
} from "./debug.js";


/* =========================================================
   START GLOBAL DEBUG MONITOR
   ========================================================= */

initCAPDebug();

addDebugEntry({
  level: "info",
  source: "APP",
  message:
    "Application router module is starting.",
});


/* =========================================================
   APPLICATION MODULES
   ========================================================= */

import {
  state,
  setAuthenticatedUser,
  clearAuthenticatedUser,
} from "./state.js";

import {
  renderSignup,
} from "./signup.js";

import {
  renderSignin,
} from "./signin.js";

import {
  renderDashboard,
} from "./dashboard.js";

import {
  renderMarketplace,
} from "./marketplace.js";

import {
  renderTrade,
} from "./trade.js";

import {
  renderWallet,
} from "./wallet.js";

import {
  renderOrders,
} from "./orders.js";

import {
  isSignedIn,
  getStoredAccount,
  getStoredSession,
  signOut,
} from "./auth.js";


/* ---------------------------------------------------------
APPLICATION MOUNT
--------------------------------------------------------- */

const app =
  document.getElementById("app");

if (!app) {

  addDebugEntry({
    level: "error",
    source: "APP",
    message:
      "CAP Marketplace: #app mount point was not found.",
  });

  throw new Error(
    "CAP Marketplace: #app mount point was not found."
  );

}


/* ---------------------------------------------------------
SCREENS
--------------------------------------------------------- */

const SCREENS = Object.freeze({

  SIGNUP: "signup",

  SIGNIN: "signin",

  DASHBOARD: "dashboard",

  MARKETPLACE: "marketplace",

  TRADE: "trade",

  WALLET: "wallet",

  ORDERS: "orders",

});


/* ---------------------------------------------------------
AUTH STATE SYNCHRONIZATION
--------------------------------------------------------- */

/**
 * Synchronize the persistent authentication service
 * with the central in-memory application state.
 */
function syncAuthenticatedState() {

  const account =
    getStoredAccount();

  const session =
    getStoredSession();

  if (
    !account ||
    !session
  ) {

    clearAuthenticatedUser();

    addDebugEntry({
      level: "info",
      source: "AUTH",
      message:
        "No stored account/session available.",
    });

    return false;

  }

  setAuthenticatedUser(
    account,
    session.sessionId ?? null
  );

  addDebugEntry({
    level: "info",
    source: "AUTH",
    message:
      "Authenticated state synchronized.",
    details:
      safeDebugSerialize({
        userId:
          account?.id ?? null,
        email:
          account?.email ?? null,
        sessionId:
          session?.sessionId ?? null,
      }),
  });

  return true;

}


/**
 * Clear both the persisted local session and the
 * central application authentication state.
 */
function clearAuthenticationState() {

  addDebugEntry({
    level: "info",
    source: "AUTH",
    message:
      "Clearing authentication state.",
  });

  signOut();

  clearAuthenticatedUser();

}


/* ---------------------------------------------------------
NAVIGATION
--------------------------------------------------------- */

function navigate(
  screen
) {

  console.log(
    "CAP NAVIGATE:",
    screen
  );

  addDebugEntry({
    level: "info",
    source: "ROUTER",
    message:
      `Navigating to "${screen}".`,
  });

  try {

    switch (screen) {

      /* =====================================================
         SIGN UP
         ===================================================== */

      case SCREENS.SIGNUP:

        state.app.currentScreen =
          SCREENS.SIGNUP;

        addDebugEntry({
          level: "info",
          source: "ROUTER",
          message:
            "Rendering SIGN UP screen.",
        });

        renderSignup(app);

        return;


      /* =====================================================
         SIGN IN
         ===================================================== */

      case SCREENS.SIGNIN:

        state.app.currentScreen =
          SCREENS.SIGNIN;

        addDebugEntry({
          level: "info",
          source: "ROUTER",
          message:
            "Rendering SIGN IN screen.",
        });

        renderSignin(app);

        return;


      /* =====================================================
         DASHBOARD
         ===================================================== */

      case SCREENS.DASHBOARD: {

        if (!isSignedIn()) {

          console.warn(
            "CAP: dashboard blocked — no active session."
          );

          addDebugEntry({
            level: "warn",
            source: "ROUTER",
            message:
              "Dashboard blocked because no active session exists.",
          });

          clearAuthenticatedStateForRouter();

          navigate(
            SCREENS.SIGNIN
          );

          return;

        }


        const authenticated =
          syncAuthenticatedState();


        if (!authenticated) {

          console.warn(
            "CAP: authentication state could not be synchronized."
          );

          addDebugEntry({
            level: "warn",
            source: "AUTH",
            message:
              "Dashboard authentication state could not be synchronized.",
          });

          navigate(
            SCREENS.SIGNIN
          );

          return;

        }


        state.app.currentScreen =
          SCREENS.DASHBOARD;


        addDebugEntry({
          level: "info",
          source: "ROUTER",
          message:
            "Rendering DASHBOARD screen.",
        });


        renderDashboard(app);

        return;

      }


      /* =====================================================
         MARKETPLACE
         ===================================================== */

      case SCREENS.MARKETPLACE: {

        if (!isSignedIn()) {

          console.warn(
            "CAP: marketplace blocked — no active session."
          );

          addDebugEntry({
            level: "warn",
            source: "ROUTER",
            message:
              "Marketplace blocked because no active session exists.",
          });

          clearAuthenticatedStateForRouter();

          navigate(
            SCREENS.SIGNIN
          );

          return;

        }


        const authenticated =
          syncAuthenticatedState();


        if (!authenticated) {

          console.warn(
            "CAP: marketplace authentication state could not be synchronized."
          );

          addDebugEntry({
            level: "warn",
            source: "AUTH",
            message:
              "Marketplace authentication state could not be synchronized.",
          });

          navigate(
            SCREENS.SIGNIN
          );

          return;

        }


        state.app.currentScreen =
          SCREENS.MARKETPLACE;


        addDebugEntry({
          level: "info",
          source: "ROUTER",
          message:
            "Rendering MARKETPLACE screen.",
        });


        renderMarketplace(app);

        return;

      }


      /* =====================================================
         TRADE REVIEW
         ===================================================== */

      case SCREENS.TRADE: {

        if (!isSignedIn()) {

          console.warn(
            "CAP: trade blocked — no active session."
          );

          addDebugEntry({
            level: "warn",
            source: "ROUTER",
            message:
              "Trade blocked because no active session exists.",
          });

          clearAuthenticatedStateForRouter();

          navigate(
            SCREENS.SIGNIN
          );

          return;

        }


        const authenticated =
          syncAuthenticatedState();


        if (!authenticated) {

          console.warn(
            "CAP: trade authentication state could not be synchronized."
          );

          addDebugEntry({
            level: "warn",
            source: "AUTH",
            message:
              "Trade authentication state could not be synchronized.",
          });

          navigate(
            SCREENS.SIGNIN
          );

          return;

        }


        if (
          !state.marketplace.selectedOfferId
        ) {

          console.warn(
            "CAP: trade blocked — no marketplace offer selected."
          );

          addDebugEntry({
            level: "warn",
            source: "TRADE",
            message:
              "Trade was requested without a selected marketplace offer.",
          });

          navigate(
            SCREENS.MARKETPLACE
          );

          return;

        }


        state.app.currentScreen =
          SCREENS.TRADE;


        addDebugEntry({
          level: "info",
          source: "ROUTER",
          message:
            "Rendering TRADE screen.",
        });


        renderTrade(app);

        return;

      }


      /* =====================================================
         WALLET
         ===================================================== */

      case SCREENS.WALLET: {

        if (!isSignedIn()) {

          console.warn(
            "CAP: wallet blocked — no active session."
          );

          addDebugEntry({
            level: "warn",
            source: "ROUTER",
            message:
              "Wallet blocked because no active session exists.",
          });

          clearAuthenticatedStateForRouter();

          navigate(
            SCREENS.SIGNIN
          );

          return;

        }


        const authenticated =
          syncAuthenticatedState();


        if (!authenticated) {

          console.warn(
            "CAP: wallet authentication state could not be synchronized."
          );

          addDebugEntry({
            level: "warn",
            source: "AUTH",
            message:
              "Wallet authentication state could not be synchronized.",
          });

          navigate(
            SCREENS.SIGNIN
          );

          return;

        }


        state.app.currentScreen =
          SCREENS.WALLET;


        addDebugEntry({
          level: "info",
          source: "ROUTER",
          message:
            "Rendering WALLET screen.",
        });


        renderWallet(app);

        return;

      }


      /* =====================================================
         ORDERS
         ===================================================== */

      case SCREENS.ORDERS: {

        if (!isSignedIn()) {

          console.warn(
            "CAP: orders blocked — no active session."
          );

          addDebugEntry({
            level: "warn",
            source: "ROUTER",
            message:
              "Orders blocked because no active session exists.",
          });

          clearAuthenticatedStateForRouter();

          navigate(
            SCREENS.SIGNIN
          );

          return;

        }


        const authenticated =
          syncAuthenticatedState();


        if (!authenticated) {

          console.warn(
            "CAP: orders authentication state could not be synchronized."
          );

          addDebugEntry({
            level: "warn",
            source: "AUTH",
            message:
              "Orders authentication state could not be synchronized.",
          });

          navigate(
            SCREENS.SIGNIN
          );

          return;

        }


        state.app.currentScreen =
          SCREENS.ORDERS;


        addDebugEntry({
          level: "info",
          source: "ROUTER",
          message:
            "Rendering ORDERS screen.",
        });


        renderOrders(app);

        return;

      }


      /* =====================================================
         UNKNOWN SCREEN
         ===================================================== */

      default:

        throw new Error(
          `CAP Marketplace: unknown screen "${screen}".`
        );

    }

  } catch (error) {

    addDebugEntry({
      level: "error",
      source: `ROUTER:${screen}`,
      message:
        error?.message ||
        String(
          error ||
          "Unknown rendering error."
        ),
      details:
        error?.stack ||
        "No stack trace available.",
    });

    throw error;

  }

}


/* ---------------------------------------------------------
ROUTER AUTH CLEANUP
--------------------------------------------------------- */

/**
 * Clear in-memory authentication state when a protected
 * route cannot be accessed.
 */
function clearAuthenticatedStateForRouter() {

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


/* ---------------------------------------------------------
AUTH EVENTS
--------------------------------------------------------- */

/*
 * Signup / UI → Sign In
 */
window.addEventListener(
  "cap:signin-requested",
  () => {

    addDebugEntry({
      level: "event",
      source: "AUTH EVENT",
      message:
        "cap:signin-requested received.",
    });

    navigate(
      SCREENS.SIGNIN
    );

  }
);


/*
 * Sign In / UI → Sign Up
 */
window.addEventListener(
  "cap:signup-requested",
  () => {

    addDebugEntry({
      level: "event",
      source: "AUTH EVENT",
      message:
        "cap:signup-requested received.",
    });

    navigate(
      SCREENS.SIGNUP
    );

  }
);


/*
 * Account successfully created → Sign In
 */
window.addEventListener(
  "cap:account-created",
  () => {

    addDebugEntry({
      level: "event",
      source: "AUTH EVENT",
      message:
        "cap:account-created received.",
    });

    navigate(
      SCREENS.SIGNIN
    );

  }
);


/*
 * Successful authentication → Dashboard
 */
window.addEventListener(
  "cap:authenticated",
  (event) => {

    console.log(
      "CAP AUTHENTICATED EVENT RECEIVED:",
      event.detail
    );

    addDebugEntry({
      level: "event",
      source: "AUTH EVENT",
      message:
        "cap:authenticated received.",
      details:
        safeDebugSerialize(
          event.detail
        ),
    });

    const eventUser =
      event.detail?.user ?? null;

    const eventSession =
      event.detail?.session ?? null;


    if (
      eventUser &&
      eventSession
    ) {

      setAuthenticatedUser(
        eventUser,
        eventSession.sessionId ?? null
      );

    } else {

      if (
        !syncAuthenticatedState()
      ) {

        console.error(
          "CAP: authentication event received without valid auth data."
        );

        addDebugEntry({
          level: "error",
          source: "AUTH EVENT",
          message:
            "Authentication event received without valid auth data.",
        });

        navigate(
          SCREENS.SIGNIN
        );

        return;

      }

    }


    state.app.currentScreen =
      SCREENS.DASHBOARD;


    navigate(
      SCREENS.DASHBOARD
    );

  }
);


/* ---------------------------------------------------------
DASHBOARD ACTION ROUTING
--------------------------------------------------------- */

window.addEventListener(
  "cap:dashboard-action",
  (event) => {

    const action =
      event.detail?.action;


    console.log(
      "CAP DASHBOARD ACTION:",
      action
    );


    addDebugEntry({
      level: "event",
      source: "DASHBOARD EVENT",
      message:
        `Dashboard action "${action}" received.`,
      details:
        safeDebugSerialize(
          event.detail
        ),
    });


    switch (action) {

      case "marketplace":

        navigate(
          SCREENS.MARKETPLACE
        );

        break;


      case "wallet":

        navigate(
          SCREENS.WALLET
        );

        break;


      case "orders":

        navigate(
          SCREENS.ORDERS
        );

        break;


      case "arbitrage":

        console.log(
          "CAP: Arbitrage module not connected yet."
        );

        addDebugEntry({
          level: "info",
          source: "DASHBOARD",
          message:
            "Arbitrage module not connected yet.",
        });

        break;


      default:

        console.warn(
          `CAP: unknown dashboard action "${action}".`
        );

        addDebugEntry({
          level: "warn",
          source: "DASHBOARD",
          message:
            `Unknown dashboard action "${action}".`,
        });

    }

  }
);


/* ---------------------------------------------------------
MARKETPLACE → DASHBOARD
--------------------------------------------------------- */

window.addEventListener(
  "cap:marketplace-dashboard-requested",
  () => {

    addDebugEntry({
      level: "event",
      source: "MARKETPLACE EVENT",
      message:
        "Marketplace requested dashboard navigation.",
    });

    navigate(
      SCREENS.DASHBOARD
    );

  }
);


/* ---------------------------------------------------------
MARKETPLACE OFFER SELECTED
--------------------------------------------------------- */

window.addEventListener(
  "cap:offer-selected",
  (event) => {

    const offer =
      event.detail?.offer;


    if (!offer) {

      console.warn(
        "CAP: offer-selected event contained no offer."
      );

      addDebugEntry({
        level: "error",
        source: "MARKETPLACE EVENT",
        message:
          "offer-selected event contained no offer.",
        details:
          safeDebugSerialize(
            event.detail
          ),
      });

      return;

    }


    if (!offer.id) {

      console.warn(
        "CAP: selected offer contained no valid ID."
      );

      addDebugEntry({
        level: "error",
        source: "MARKETPLACE EVENT",
        message:
          "Selected offer contained no valid ID.",
        details:
          safeDebugSerialize(
            offer
          ),
      });

      return;

    }


    state.marketplace.selectedOfferId =
      offer.id;


    console.log(
      "CAP SELECTED OFFER:",
      offer
    );


    addDebugEntry({
      level: "event",
      source: "MARKETPLACE EVENT",
      message:
        `Offer "${offer.id}" selected.`,
      details:
        safeDebugSerialize(
          offer
        ),
    });


    navigate(
      SCREENS.TRADE
    );

  }
);


/* ---------------------------------------------------------
TRADE → MARKETPLACE
--------------------------------------------------------- */

window.addEventListener(
  "cap:trade-marketplace-requested",
  () => {

    addDebugEntry({
      level: "event",
      source: "TRADE EVENT",
      message:
        "Trade requested marketplace navigation.",
    });

    navigate(
      SCREENS.MARKETPLACE
    );

  }
);


/* ---------------------------------------------------------
TRADE CREATED
--------------------------------------------------------- */

window.addEventListener(
  "cap:trade-created",
  (event) => {

    console.log(
      "CAP TRADE CREATED:",
      event.detail
    );

    addDebugEntry({
      level: "event",
      source: "TRADE EVENT",
      message:
        "Trade created event received.",
      details:
        safeDebugSerialize(
          event.detail
        ),
    });

  }
);


/* ---------------------------------------------------------
WALLET → DASHBOARD
--------------------------------------------------------- */

window.addEventListener(
  "cap:wallet-dashboard-requested",
  () => {

    addDebugEntry({
      level: "event",
      source: "WALLET EVENT",
      message:
        "Wallet requested dashboard navigation.",
    });

    navigate(
      SCREENS.DASHBOARD
    );

  }
);


/* ---------------------------------------------------------
WALLET → MARKETPLACE
--------------------------------------------------------- */

window.addEventListener(
  "cap:wallet-marketplace-requested",
  () => {

    addDebugEntry({
      level: "event",
      source: "WALLET EVENT",
      message:
        "Wallet requested marketplace navigation.",
    });

    navigate(
      SCREENS.MARKETPLACE
    );

  }
);


/* ---------------------------------------------------------
ORDERS → DASHBOARD
--------------------------------------------------------- */

window.addEventListener(
  "cap:orders-dashboard-requested",
  () => {

    addDebugEntry({
      level: "event",
      source: "ORDERS EVENT",
      message:
        "Orders requested dashboard navigation.",
    });

    navigate(
      SCREENS.DASHBOARD
    );

  }
);


/* ---------------------------------------------------------
ORDERS → MARKETPLACE
--------------------------------------------------------- */

window.addEventListener(
  "cap:orders-marketplace-requested",
  () => {

    addDebugEntry({
      level: "event",
      source: "ORDERS EVENT",
      message:
        "Orders requested marketplace navigation.",
    });

    navigate(
      SCREENS.MARKETPLACE
    );

  }
);


/* ---------------------------------------------------------
ORDER CANCELLED
--------------------------------------------------------- */

window.addEventListener(
  "cap:order-cancelled",
  (event) => {

    console.log(
      "CAP ORDER CANCELLED:",
      event.detail
    );

    addDebugEntry({
      level: "event",
      source: "ORDER EVENT",
      message:
        "Order cancelled event received.",
      details:
        safeDebugSerialize(
          event.detail
        ),
    });

  }
);


/* ---------------------------------------------------------
ORDER COMPLETED
--------------------------------------------------------- */

window.addEventListener(
  "cap:order-completed",
  (event) => {

    console.log(
      "CAP ORDER COMPLETED:",
      event.detail
    );

    addDebugEntry({
      level: "event",
      source: "ORDER EVENT",
      message:
        "Order completed event received.",
      details:
        safeDebugSerialize(
          event.detail
        ),
    });

  }
);


/* ---------------------------------------------------------
SIGN OUT EVENT
--------------------------------------------------------- */

window.addEventListener(
  "cap:signout-requested",
  () => {

    console.log(
      "CAP: sign-out requested."
    );


    addDebugEntry({
      level: "event",
      source: "AUTH EVENT",
      message:
        "Sign-out requested.",
    });


    clearAuthenticationState();


    state.app.currentScreen =
      SCREENS.SIGNIN;


    navigate(
      SCREENS.SIGNIN
    );

  }
);


/* ---------------------------------------------------------
APPLICATION START
--------------------------------------------------------- */

function startApp() {

  try {

    addDebugEntry({
      level: "info",
      source: "APP START",
      message:
        "CAP Marketplace startup sequence beginning.",
    });


    state.app.initialized =
      true;


    /*
     * CAP Marketplace intentionally does not restore an old
     * browser session during application startup.
     *
     * The account remains stored, but the old session is
     * removed so the user must explicitly sign in.
     */
    if (isSignedIn()) {

      console.log(
        "CAP: clearing previous startup session."
      );


      addDebugEntry({
        level: "info",
        source: "AUTH",
        message:
          "Existing startup session detected; clearing it.",
      });


      signOut();


      clearAuthenticatedUser();

    } else {

      clearAuthenticatedStateForRouter();

    }


    /*
     * Existing account → Sign In.
     */
    if (
      getStoredAccount()
    ) {

      addDebugEntry({
        level: "info",
        source: "APP START",
        message:
          "Stored account found. Starting SIGN IN screen.",
      });


      navigate(
        SCREENS.SIGNIN
      );

      return;

    }


    /*
     * No account → Sign Up.
     */
    addDebugEntry({
      level: "info",
      source: "APP START",
      message:
        "No stored account found. Starting SIGN UP screen.",
    });


    navigate(
      SCREENS.SIGNUP
    );

  } catch (error) {

    addDebugEntry({
      level: "error",
      source: "APP START",
      message:
        error?.message ||
        String(
          error ||
          "Unknown startup error."
        ),
      details:
        error?.stack ||
        "No stack trace available.",
    });

    /*
     * Re-throw so the browser console still exposes
     * the original failure as well.
     */
    throw error;

  }

}


/* ---------------------------------------------------------
DEBUG EVENT HELPERS
--------------------------------------------------------- */

function safeDebugSerialize(value) {

  try {

    return JSON.stringify(
      value,
      null,
      2
    );

  } catch {

    return String(
      value
    );

  }

}


/* ---------------------------------------------------------
BOOT
--------------------------------------------------------- */

try {

  addDebugEntry({
    level: "info",
    source: "APP",
    message:
      "CAP Marketplace router loaded. Starting application.",
  });


  startApp();


  addDebugEntry({
    level: "info",
    source: "APP",
    message:
      "CAP Marketplace router startup completed.",
  });

} catch (error) {

  addDebugEntry({
    level: "error",
    source: "APP BOOT",
    message:
      error?.message ||
      String(
        error ||
        "Unknown CAP boot failure."
      ),
    details:
      error?.stack ||
      "No stack trace available.",
  });

  /*
   * Let the global debug monitor and browser console
   * retain the original exception.
   */
  throw error;

}
