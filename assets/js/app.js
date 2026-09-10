/* =========================================================
   CAP MARKETPLACE
   APPLICATION ROUTER / BOOTSTRAP
   ========================================================= */

import { state } from "./state.js";
import { renderSignup } from "./signup.js";
import { renderSignin } from "./signin.js";
import { renderDashboard } from "./dashboard.js";
import { isSignedIn } from "./auth.js";


const app = document.getElementById("app");

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

        navigate(SCREENS.SIGNIN);

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
   * If a valid local session already exists,
   * open the dashboard.
   */
  if (isSignedIn()) {

    state.auth.status =
      "authenticated";

    navigate(
      SCREENS.DASHBOARD
    );

    return;
  }

  /*
   * New visitor → Signup.
   */
  navigate(
    SCREENS.SIGNUP
  );
}


startApp();
