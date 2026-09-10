/* =========================================================
   CAP MARKETPLACE
   APPLICATION ROUTER / BOOTSTRAP
   ========================================================= */

import { state } from "./state.js";
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
  signOut,
} from "./auth.js";


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
   NAVIGATION
   --------------------------------------------------------- */

function navigate(screen) {

  console.log(
    "CAP NAVIGATE:",
    screen
  );

  switch (screen) {

    case SCREENS.SIGNUP:

      state.app.currentScreen =
        SCREENS.SIGNUP;

      renderSignup(app);

      return;


    case SCREENS.SIGNIN:

      state.app.currentScreen =
        SCREENS.SIGNIN;

      renderSignin(app);

      return;


    case SCREENS.DASHBOARD:

      /*
       * The dashboard requires an active
       * local authentication session.
       */
      if (!isSignedIn()) {

        console.warn(
          "CAP: dashboard blocked — no active session."
        );

        navigate(
          SCREENS.SIGNIN
        );

        return;
      }

      state.app.currentScreen =
        SCREENS.DASHBOARD;

      state.auth.status =
        "authenticated";

      renderDashboard(app);

      return;


    default:

      throw new Error(
        `CAP Marketplace: unknown screen "${screen}".`
      );
  }
}


/* ---------------------------------------------------------
   EVENTS
   --------------------------------------------------------- */


/*
 * Signup → Sign In
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
 * Sign In → Signup
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
 * Account created → Sign In
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
 */
window.addEventListener(
  "cap:authenticated",
  (event) => {

    console.log(
      "CAP AUTHENTICATED EVENT RECEIVED:",
      event.detail
    );

    state.auth.status =
      "authenticated";

    navigate(
      SCREENS.DASHBOARD
    );
  }
);


/* ---------------------------------------------------------
   APPLICATION START
   --------------------------------------------------------- */

function startApp() {

  state.app.initialized = true;


  /*
   * IMPORTANT:
   *
   * CAP Marketplace does NOT automatically restore
   * an old browser session on application startup.
   *
   * The stored account remains intact.
   * Only the previous session is cleared so the user
   * must explicitly sign in again.
   *
   * This prevents the application from opening directly
   * on the dashboard as the previous user.
   */
  if (isSignedIn()) {

    console.log(
      "CAP: clearing previous startup session."
    );

    signOut();

    state.auth.status =
      "signed_out";

    state.auth.userId =
      null;

    state.auth.sessionId =
      null;
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


startApp();
