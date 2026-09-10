/* =========================================================
   CAP MARKETPLACE
   APPLICATION ROUTER / BOOTSTRAP
   ========================================================= */

import { state } from "./state.js";

import { renderSignup } from "./signup.js";
import { renderSignin } from "./signin.js";

import { isSignedIn } from "./auth.js";


const app = document.getElementById("app");

if (!app) {
  throw new Error(
    "CAP Marketplace: #app mount point was not found."
  );
}


/**
 * Available frontend screens.
 *
 * We deliberately keep routing small at this stage.
 * More screens will be added only after they are built
 * and validated.
 */
const SCREENS = {
  SIGNUP: "signup",
  SIGNIN: "signin",
};


/**
 * Render a screen.
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

    default:
      throw new Error(
        `CAP Marketplace: unknown screen "${screen}".`
      );
  }
}


/**
 * Handle Signup → Sign In.
 */
window.addEventListener(
  "cap:signin-requested",
  () => {
    navigate(SCREENS.SIGNIN);
  }
);


/**
 * Handle Sign In → Signup.
 */
window.addEventListener(
  "cap:signup-requested",
  () => {
    navigate(SCREENS.SIGNUP);
  }
);


/**
 * Handle successful account creation.
 *
 * The account is created locally by auth.js.
 * We move the user to Sign In rather than silently
 * authenticating them.
 */
window.addEventListener(
  "cap:account-created",
  () => {
    navigate(SCREENS.SIGNIN);
  }
);


/**
 * Handle successful authentication.
 *
 * The Dashboard does not exist yet, so we intentionally
 * remain on the Sign In screen for this checkpoint.
 *
 * The next authenticated module will replace this
 * behavior with the real application entry.
 */
window.addEventListener(
  "cap:authenticated",
  () => {
    state.auth.status = "authenticated";

    /*
     * Dashboard routing will be connected only after
     * the dashboard module has been built and validated.
     */
  }
);


/**
 * Start the application.
 */
function startApp() {
  state.app.initialized = true;

  /*
   * Existing session detection is intentionally handled
   * without displaying an unfinished authenticated area.
   */
  if (isSignedIn()) {
    navigate(SCREENS.SIGNIN);
    return;
  }

  navigate(SCREENS.SIGNUP);
}


startApp();
