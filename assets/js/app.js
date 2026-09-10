/* =========================================================
   CAP MARKETPLACE
   APPLICATION ROUTER / BOOTSTRAP
   ========================================================= */

import { state } from "./state.js";

import { renderSignup } from "./signup.js";
import { renderSignin } from "./signin.js";
import { renderDashboard } from "./dashboard.js";

import {
  isSignedIn
} from "./auth.js";


const app = document.getElementById("app");

if (!app) {
  throw new Error(
    "CAP Marketplace: #app mount point was not found."
  );
}


/* ---------------------------------------------------------
   SCREENS
   --------------------------------------------------------- */

const SCREENS = {
  SIGNUP: "signup",
  SIGNIN: "signin",
  DASHBOARD: "dashboard",
};


/* ---------------------------------------------------------
   ROUTER
   --------------------------------------------------------- */

function navigate(screen) {

  try {

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
         * Dashboard is protected.
         * No local session = no dashboard.
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
          `Unknown application screen: ${screen}`
        );
    }

  } catch (error) {

    /*
     * Instead of failing silently, show the error
     * directly in the application during development.
     */
    console.error(
      "CAP Marketplace navigation error:",
      error
    );

    app.innerHTML = `
      <section
        style="
          min-height:100vh;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:24px;
          background:#07101d;
          color:#f4f7fb;
          font-family:system-ui,sans-serif;
        "
      >

        <div
          style="
            width:min(100%,520px);
            padding:28px;
            border:1px solid rgba(255,255,255,.10);
            border-radius:18px;
            background:#0f1d2e;
          "
        >

          <h2 style="margin:0 0 10px;">
            CAP Marketplace
          </h2>

          <p
            style="
              margin:0 0 16px;
              color:#ff5c70;
            "
          >
            The requested screen could not be loaded.
          </p>

          <pre
            style="
              margin:0;
              padding:14px;
              overflow:auto;
              white-space:pre-wrap;
              border-radius:10px;
              background:#07101d;
              color:#9eafc3;
              font-size:12px;
            "
          >${escapeHtml(
            error instanceof Error
              ? error.message
              : String(error)
          )}</pre>

        </div>

      </section>
    `;
  }
}


/* ---------------------------------------------------------
   NAVIGATION EVENTS
   --------------------------------------------------------- */

/*
 * Signup → Sign In
 */
window.addEventListener(
  "cap:signin-requested",
  () => {
    navigate(SCREENS.SIGNIN);
  }
);


/*
 * Sign In → Signup
 */
window.addEventListener(
  "cap:signup-requested",
  () => {
    navigate(SCREENS.SIGNUP);
  }
);


/*
 * Signup completed → Sign In
 */
window.addEventListener(
  "cap:account-created",
  () => {
    navigate(SCREENS.SIGNIN);
  }
);


/*
 * Successful Sign In → Dashboard
 */
window.addEventListener(
  "cap:authenticated",
  () => {

    state.auth.status = "authenticated";

    navigate(SCREENS.DASHBOARD);
  }
);


/* ---------------------------------------------------------
   APPLICATION START
   --------------------------------------------------------- */

function startApp() {

  state.app.initialized = true;

  /*
   * Existing valid session:
   * open dashboard.
   */
  if (isSignedIn()) {

    state.auth.status = "authenticated";

    navigate(SCREENS.DASHBOARD);

    return;
  }

  /*
   * No session:
   * start with Signup.
   */
  navigate(SCREENS.SIGNUP);
}


startApp();


/* ---------------------------------------------------------
   SAFE HTML ESCAPING
   --------------------------------------------------------- */

function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
