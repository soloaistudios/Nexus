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


/**
 * Available frontend screens.
 */
const SCREENS = {
  SIGNUP: "signup",
  SIGNIN: "signin",
  DASHBOARD: "dashboard",
};


/**
 * Navigate to a frontend screen.
 */
function navigate(screen) {
  switch (screen) {

    case SCREENS.SIGNUP:
      state.app.currentScreen = SCREENS.SIGNUP;
      renderSignup(app);
      break;

    case SCREENS.SIGNIN:
      state.app.currentScreen = SCREENS.SIGNIN;
      renderSignin(app);
      break;

    case SCREENS.DASHBOARD:

      /*
       * Never render the authenticated area without
       * a valid local session.
       */
      if (!isSignedIn()) {
        navigate(SCREENS.SIGNIN);
        return;
      }

      state.app.currentScreen = SCREENS.DASHBOARD;
      state.auth.status = "authenticated";

      renderDashboard(app);
      break;

    default:
      throw new Error(
        `CAP Marketplace: unknown screen "${screen}".`
      );
  }
}


/**
 * Signup → Sign In
 */
window.addEventListener(
  "cap:signin-requested",
  () => {
    navigate(SCREENS.SIGNIN);
  }
);


/**
 * Sign In → Signup
 */
window.addEventListener(
  "cap:signup-requested",
  () => {
    navigate(SCREENS.SIGNUP);
  }
);


/**
 * Account created → Sign In
 */
window.addEventListener(
  "cap:account-created",
  () => {
    navigate(SCREENS.SIGNIN);
  }
);


/**
 * Successful authentication → Dashboard
 */
window.addEventListener(
  "cap:authenticated",
  () => {
    state.auth.status = "authenticated";

    navigate(SCREENS.DASHBOARD);
  }
);


/**
 * Start application.
 */
function startApp() {
  state.app.initialized = true;

  if (isSignedIn()) {
    state.auth.status = "authenticated";
    navigate(SCREENS.DASHBOARD);
    return;
  }

  navigate(SCREENS.SIGNUP);
}


startApp();
