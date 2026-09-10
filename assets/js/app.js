/* =========================================================
   CAP MARKETPLACE
   APPLICATION ROUTER / BOOTSTRAP
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


  if (!account || !session) {

    clearAuthenticatedUser();

    return false;
  }


  setAuthenticatedUser(
    account,
    session.sessionId ?? null
  );


  return true;
}


/**
 * Clear both the persisted local session and the
 * central application authentication state.
 */
function clearAuthenticationState() {

  signOut();

  clearAuthenticatedUser();
}


/* ---------------------------------------------------------
   NAVIGATION
   --------------------------------------------------------- */

function navigate(screen) {

  console.log(
    "CAP NAVIGATE:",
    screen
  );


  switch (screen) {


    /* =====================================================
       SIGN UP
       ===================================================== */

    case SCREENS.SIGNUP:

      state.app.currentScreen =
        SCREENS.SIGNUP;

      renderSignup(app);

      return;


    /* =====================================================
       SIGN IN
       ===================================================== */

    case SCREENS.SIGNIN:

      state.app.currentScreen =
        SCREENS.SIGNIN;

      renderSignin(app);

      return;


    /* =====================================================
       DASHBOARD
       ===================================================== */

    case SCREENS.DASHBOARD: {

      /*
       * Dashboard requires an active local session.
       */
      if (!isSignedIn()) {

        console.warn(
          "CAP: dashboard blocked — no active session."
        );

        clearAuthenticatedStateForRouter();

        navigate(
          SCREENS.SIGNIN
        );

        return;
      }


      /*
       * Synchronize auth.js → state.js.
       */
      const authenticated =
        syncAuthenticatedState();


      if (!authenticated) {

        console.warn(
          "CAP: authentication state could not be synchronized."
        );

        navigate(
          SCREENS.SIGNIN
        );

        return;
      }


      state.app.currentScreen =
        SCREENS.DASHBOARD;


      renderDashboard(app);

      return;
    }


    /* =====================================================
       MARKETPLACE
       ===================================================== */

    case SCREENS.MARKETPLACE: {

      /*
       * Marketplace also requires an active local
       * authentication session.
       */
      if (!isSignedIn()) {

        console.warn(
          "CAP: marketplace blocked — no active session."
        );

        clearAuthenticatedStateForRouter();

        navigate(
          SCREENS.SIGNIN
        );

        return;
      }


      /*
       * Keep the central state synchronized before
       * entering the marketplace.
       */
      const authenticated =
        syncAuthenticatedState();


      if (!authenticated) {

        console.warn(
          "CAP: marketplace authentication state could not be synchronized."
        );

        navigate(
          SCREENS.SIGNIN
        );

        return;
      }


      state.app.currentScreen =
        SCREENS.MARKETPLACE;


      renderMarketplace(app);

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

    navigate(
      SCREENS.SIGNIN
    );
  }
);


/*
 * Successful authentication → Dashboard
 *
 * Expected:
 *
 * event.detail = {
 *   user: {...},
 *   session: {...}
 * }
 */
window.addEventListener(
  "cap:authenticated",
  (event) => {

    console.log(
      "CAP AUTHENTICATED EVENT RECEIVED:",
      event.detail
    );


    const eventUser =
      event.detail?.user ?? null;

    const eventSession =
      event.detail?.session ?? null;


    /*
     * Preferred path:
     * signin.js supplies the exact authentication
     * result returned by auth.js.
     */
    if (
      eventUser &&
      eventSession
    ) {

      setAuthenticatedUser(
        eventUser,
        eventSession.sessionId ?? null
      );

    } else {

      /*
       * Fallback path:
       * recover the authentication state from auth.js.
       */
      if (!syncAuthenticatedState()) {

        console.error(
          "CAP: authentication event received without valid auth data."
        );

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


    switch (action) {


      /* -----------------------------------------------
         MARKETPLACE
         ----------------------------------------------- */

      case "marketplace":

        navigate(
          SCREENS.MARKETPLACE
        );

        break;


      /* -----------------------------------------------
         WALLET
         ----------------------------------------------- */

      case "wallet":

        console.log(
          "CAP: Wallet module not connected yet."
        );

        break;


      /* -----------------------------------------------
         ORDERS
         ----------------------------------------------- */

      case "orders":

        console.log(
          "CAP: Orders module not connected yet."
        );

        break;


      /* -----------------------------------------------
         ARBITRAGE
         ----------------------------------------------- */

      case "arbitrage":

        console.log(
          "CAP: Arbitrage module not connected yet."
        );

        break;


      /* -----------------------------------------------
         UNKNOWN ACTION
         ----------------------------------------------- */

      default:

        console.warn(
          `CAP: unknown dashboard action "${action}".`
        );
    }
  }
);


/* ---------------------------------------------------------
   MARKETPLACE → DASHBOARD
   --------------------------------------------------------- */

window.addEventListener(
  "cap:marketplace-dashboard-requested",
  () => {

    navigate(
      SCREENS.DASHBOARD
    );
  }
);


/* ---------------------------------------------------------
   MARKETPLACE OFFER SELECTED
   --------------------------------------------------------- */

/*
 * This event is intentionally not routed to an order screen
 * yet. It gives the future order/escrow module a clean
 * integration point.
 */
window.addEventListener(
  "cap:offer-selected",
  (event) => {

    const offer =
      event.detail?.offer;


    if (!offer) {

      console.warn(
        "CAP: offer-selected event contained no offer."
      );

      return;
    }


    state.marketplace.selectedOfferId =
      offer.id;


    console.log(
      "CAP SELECTED OFFER:",
      offer
    );
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


    signOut();


    clearAuthenticatedUser();

  } else {

    /*
     * Ensure the in-memory authentication state is also
     * clean when no persisted session exists.
     */
    clearAuthenticatedStateForRouter();
  }


  /*
   * Existing account → Sign In.
   */
  if (getStoredAccount()) {

    navigate(
      SCREENS.SIGNIN
    );

    return;
  }


  /*
   * No account → Sign Up.
   */
  navigate(
    SCREENS.SIGNUP
  );
}


/* ---------------------------------------------------------
   BOOT
   --------------------------------------------------------- */

startApp();
