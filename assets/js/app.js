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
});


/* ---------------------------------------------------------
   AUTH STATE SYNCHRONIZATION
   --------------------------------------------------------- */

/**
 * Synchronize the local auth service with the central
 * application state.
 *
 * auth.js remains responsible for persistence.
 * state.js remains responsible for application state.
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


  state.auth.sessionId =
    session.sessionId ?? null;


  return true;
}


/**
 * Clear both the persistent local session and the
 * in-memory application authentication state.
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


    /* -----------------------------------------------------
       SIGN UP
       ----------------------------------------------------- */

    case SCREENS.SIGNUP:

      state.app.currentScreen =
        SCREENS.SIGNUP;

      renderSignup(app);

      return;


    /* -----------------------------------------------------
       SIGN IN
       ----------------------------------------------------- */

    case SCREENS.SIGNIN:

      state.app.currentScreen =
        SCREENS.SIGNIN;

      renderSignin(app);

      return;


    /* -----------------------------------------------------
       DASHBOARD
       ----------------------------------------------------- */

    case SCREENS.DASHBOARD: {

      /*
       * The dashboard requires a valid local session.
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
       * Synchronize auth.js → state.js before rendering
       * the dashboard.
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


    default:

      throw new Error(
        `CAP Marketplace: unknown screen "${screen}".`
      );
  }
}


/**
 * Router-safe cleanup when a dashboard route is blocked.
 */
function clearAuthenticatedStateForRouter() {

  state.auth.status =
    "signed_out";

  state.auth.userId =
    null;

  state.auth.sessionId =
    null;
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
 * Sign in successfully completed.
 *
 * Expected event.detail:
 *
 * {
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


    /*
     * Prefer the event payload when available.
     * Fall back to the persisted auth service.
     */
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

      state.auth.sessionId =
        eventSession.sessionId ?? null;

    } else {

      /*
       * Fallback synchronization keeps the router robust
       * if the sign-in module only dispatches the event.
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

        console.log(
          "CAP: Marketplace module requested."
        );

        /*
         * The actual marketplace screen will be connected
         * here when marketplace.js is introduced.
         */
        break;


      /* -----------------------------------------------
         WALLET
         ----------------------------------------------- */

      case "wallet":

        console.log(
          "CAP: Wallet module requested."
        );

        /*
         * Wallet module not connected yet.
         */
        break;


      /* -----------------------------------------------
         ORDERS
         ----------------------------------------------- */

      case "orders":

        console.log(
          "CAP: Orders module requested."
        );

        /*
         * Orders module not connected yet.
         */
        break;


      /* -----------------------------------------------
         ARBITRAGE
         ----------------------------------------------- */

      case "arbitrage":

        console.log(
          "CAP: Arbitrage module requested."
        );

        /*
         * Arbitrage module not connected yet.
         */
        break;


      default:

        console.warn(
          `CAP: unknown dashboard action "${action}".`
        );
    }
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
   * IMPORTANT:
   *
   * CAP Marketplace intentionally does not automatically
   * restore the previous browser session at startup.
   *
   * The account remains stored.
   * The active session is cleared.
   *
   * The user must explicitly sign in again.
   */
  if (isSignedIn()) {

    console.log(
      "CAP: clearing previous startup session."
    );


    signOut();


    clearAuthenticatedUser();
  } else {

    /*
     * Make sure the in-memory state is also clean if
     * there was no persisted session.
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
   * No account exists → Sign Up.
   */
  navigate(
    SCREENS.SIGNUP
  );
}


/* ---------------------------------------------------------
   BOOT
   --------------------------------------------------------- */

startApp();
