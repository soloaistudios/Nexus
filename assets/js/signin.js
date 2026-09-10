/* =========================================================
   CAP MARKETPLACE
   SIGN IN SCREEN
   ========================================================= */

import {
  signIn,
  getCurrentAccount,
} from "./auth.js";


/**
 * Render the Sign In screen.
 */
export function renderSignin(app) {
  app.innerHTML = `
    <section class="signin-page">

      <div class="signin-shell">

        <!-- -------------------------------------------------
             BRAND
             ------------------------------------------------- -->

        <div class="signin-brand">

          <img
            class="signin-logo"
            src="assets/icons/cap-logo.png"
            alt="CAP Marketplace"
          />

          <h1>
            CAP Marketplace
          </h1>

          <p class="signin-tagline">
            P2P Opportunity Exchange
          </p>

        </div>


        <!-- -------------------------------------------------
             SIGN IN CARD
             ------------------------------------------------- -->

        <div class="signin-card">

          <div class="signin-header">

            <h2>
              Welcome back
            </h2>

            <p>
              Sign in to access your marketplace account.
            </p>

          </div>


          <form
            id="signin-form"
            novalidate
          >

            <!-- EMAIL -->

            <div class="form-field">

              <label for="signin-email">
                Email address
              </label>

              <input
                id="signin-email"
                name="email"
                type="email"
                autocomplete="email"
                placeholder="you@example.com"
                required
              />

              <small
                class="field-error"
                id="signin-email-error"
              ></small>

            </div>


            <!-- PASSWORD -->

            <div class="form-field">

              <label for="signin-password">
                Password
              </label>

              <input
                id="signin-password"
                name="password"
                type="password"
                autocomplete="current-password"
                placeholder="Enter your password"
                required
              />

              <small
                class="field-error"
                id="signin-password-error"
              ></small>

            </div>


            <!-- SUBMIT -->

            <button
              type="submit"
              class="signin-submit"
              id="signin-submit"
            >
              Sign in
            </button>


            <!-- STATUS -->

            <div
              id="signin-status"
              class="signin-status"
              role="status"
              aria-live="polite"
            ></div>

          </form>


          <!-- -------------------------------------------------
               SIGNUP NAVIGATION
               ------------------------------------------------- -->

          <div class="signin-footer">

            <span>
              Don't have an account?
            </span>

            <button
              type="button"
              id="show-signup"
              class="signup-link"
            >
              Create account
            </button>

          </div>

        </div>


        <!-- -------------------------------------------------
             SECURITY NOTICE
             ------------------------------------------------- -->

        <p class="signin-security">
          This is a browser-only prototype. Production
          authentication requires secure server-side services.
        </p>

      </div>

    </section>
  `;


  /* ---------------------------------------------------------
     FORM
     --------------------------------------------------------- */

  const form =
    document.getElementById(
      "signin-form"
    );

  if (!form) {
    throw new Error(
      "CAP Marketplace: signin form could not be created."
    );
  }


  form.addEventListener(
    "submit",
    handleSigninSubmit
  );


  /* ---------------------------------------------------------
     SIGNUP NAVIGATION
     --------------------------------------------------------- */

  const signupButton =
    document.getElementById(
      "show-signup"
    );

  signupButton?.addEventListener(
    "click",
    handleSignupRequest
  );


  /* ---------------------------------------------------------
     EXISTING ACCOUNT CHECK
     --------------------------------------------------------- */

  const existingAccount =
    getCurrentAccount();

  if (existingAccount) {

    setSigninStatus(
      `Account found for ${existingAccount.email}. Please sign in.`,
      "info"
    );
  }
}


/* =========================================================
   SIGN IN PROCESS
   ========================================================= */

function handleSigninSubmit(event) {

  event.preventDefault();

  clearSigninErrors();


  const form =
    event.currentTarget;

  const formData =
    new FormData(form);


  const email =
    String(
      formData.get("email") || ""
    ).trim();


  const password =
    String(
      formData.get("password") || ""
    );


  let valid = true;


  /* -------------------------------------------------------
     VALIDATION
     ------------------------------------------------------- */

  if (!isValidEmail(email)) {

    showSigninError(
      "signin-email-error",
      "Please enter a valid email address."
    );

    valid = false;
  }


  if (!password) {

    showSigninError(
      "signin-password-error",
      "Please enter your password."
    );

    valid = false;
  }


  if (!valid) {

    setSigninStatus(
      "Please correct the highlighted fields.",
      "error"
    );

    return;
  }


  /* -------------------------------------------------------
     AUTHENTICATION
     ------------------------------------------------------- */

  try {

    const result =
      signIn({
        email,
        password,
      });


    console.log(
      "CAP SIGN IN SUCCESS:",
      result
    );


    setSigninStatus(
      `Welcome back, ${result.user.fullName}.`,
      "success"
    );


    disableSigninForm(true);


    /* -----------------------------------------------------
       AUTHENTICATED EVENT
       ----------------------------------------------------- */

    window.dispatchEvent(
      new CustomEvent(
        "cap:authenticated",
        {
          detail: {

            /*
             * app.js expects the authenticated user
             * and the active session as separate objects.
             */

            user:
              result.user,

            session:
              result.session,

          },
        }
      )
    );


  } catch (error) {

    setSigninStatus(
      error instanceof Error
        ? error.message
        : "Unable to sign in.",
      "error"
    );
  }
}


/* =========================================================
   SIGNUP REQUEST
   ========================================================= */

function handleSignupRequest() {

  /*
   * app.js listens for this event and routes the
   * application to the Signup screen.
   */

  window.dispatchEvent(
    new CustomEvent(
      "cap:signup-requested"
    )
  );
}


/* =========================================================
   DISABLE SIGN IN FORM
   ========================================================= */

function disableSigninForm(
  disabled
) {

  const form =
    document.getElementById(
      "signin-form"
    );

  if (!form) {
    return;
  }


  const controls =
    form.querySelectorAll(
      "input, button"
    );


  controls.forEach(
    (control) => {
      control.disabled =
        disabled;
    }
  );


  const submitButton =
    document.getElementById(
      "signin-submit"
    );


  if (submitButton) {

    submitButton.textContent =
      disabled
        ? "Signed in"
        : "Sign in";
  }
}


/* =========================================================
   EMAIL VALIDATION
   ========================================================= */

function isValidEmail(email) {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(email);
}


/* =========================================================
   FIELD ERROR
   ========================================================= */

function showSigninError(
  elementId,
  message
) {

  const element =
    document.getElementById(
      elementId
    );

  if (element) {
    element.textContent =
      message;
  }
}


/* =========================================================
   CLEAR ERRORS
   ========================================================= */

function clearSigninErrors() {

  const errors =
    document.querySelectorAll(
      ".field-error"
    );


  errors.forEach(
    (error) => {
      error.textContent = "";
    }
  );


  setSigninStatus(
    "",
    ""
  );
}


/* =========================================================
   STATUS
   ========================================================= */

function setSigninStatus(
  message,
  type
) {

  const status =
    document.getElementById(
      "signin-status"
    );

  if (!status) {
    return;
  }


  status.textContent =
    message;

  status.dataset.type =
    type || "";
}
