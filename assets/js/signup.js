/* =========================================================
   CAP MARKETPLACE
   SIGNUP SCREEN
   ========================================================= */

import { createAccount } from "./auth.js";


/**
 * Render the Signup screen.
 */
export function renderSignup(app) {
  app.innerHTML = `
    <section class="signup-page">

      <div class="signup-shell">

        <!-- -------------------------------------------------
             BRAND
             ------------------------------------------------- -->

        <div class="signup-brand">

          <img
            class="signup-logo"
            src="assets/icons/cap-logo.png"
            alt="CAP Marketplace"
          />

          <h1>
            CAP Marketplace
          </h1>

          <p class="signup-tagline">
            P2P Opportunity Exchange
          </p>

        </div>


        <!-- -------------------------------------------------
             SIGNUP CARD
             ------------------------------------------------- -->

        <div class="signup-card">

          <div class="signup-header">

            <h2>
              Create your account
            </h2>

            <p>
              Join the marketplace and discover new P2P opportunities.
            </p>

          </div>


          <form
            id="signup-form"
            novalidate
          >

            <!-- NAME -->

            <div class="form-field">

              <label for="signup-name">
                Full name
              </label>

              <input
                id="signup-name"
                name="name"
                type="text"
                autocomplete="name"
                placeholder="Enter your full name"
                required
              />

              <small
                class="field-error"
                id="signup-name-error"
              ></small>

            </div>


            <!-- EMAIL -->

            <div class="form-field">

              <label for="signup-email">
                Email address
              </label>

              <input
                id="signup-email"
                name="email"
                type="email"
                autocomplete="email"
                placeholder="you@example.com"
                required
              />

              <small
                class="field-error"
                id="signup-email-error"
              ></small>

            </div>


            <!-- PASSWORD -->

            <div class="form-field">

              <label for="signup-password">
                Password
              </label>

              <input
                id="signup-password"
                name="password"
                type="password"
                autocomplete="new-password"
                placeholder="Create a strong password"
                minlength="8"
                required
              />

              <small class="field-hint">
                Use at least 8 characters.
              </small>

              <small
                class="field-error"
                id="signup-password-error"
              ></small>

            </div>


            <!-- CONFIRM PASSWORD -->

            <div class="form-field">

              <label for="signup-confirm-password">
                Confirm password
              </label>

              <input
                id="signup-confirm-password"
                name="confirmPassword"
                type="password"
                autocomplete="new-password"
                placeholder="Enter your password again"
                required
              />

              <small
                class="field-error"
                id="signup-confirm-password-error"
              ></small>

            </div>


            <!-- TERMS -->

            <label class="terms-row">

              <input
                id="signup-terms"
                name="terms"
                type="checkbox"
                required
              />

              <span>
                I agree to the CAP Marketplace terms and conditions.
              </span>

            </label>

            <small
              class="field-error"
              id="signup-terms-error"
            ></small>


            <!-- SUBMIT -->

            <button
              type="submit"
              class="signup-submit"
              id="signup-submit"
            >
              Create account
            </button>


            <!-- STATUS -->

            <div
              id="signup-status"
              class="signup-status"
              role="status"
              aria-live="polite"
            ></div>

          </form>


          <!-- -------------------------------------------------
               SIGN IN LINK
               ------------------------------------------------- -->

          <div class="signup-footer">

            <span>
              Already have an account?
            </span>

            <button
              type="button"
              id="show-signin"
              class="signin-link"
            >
              Sign in
            </button>

          </div>

        </div>


        <!-- -------------------------------------------------
             SECURITY NOTICE
             ------------------------------------------------- -->

        <p class="signup-security">
          This browser-only prototype keeps account data on this
          device. Production authentication will require a secure
          server-side authentication system.
        </p>

      </div>

    </section>
  `;


  /* ---------------------------------------------------------
     FORM
     --------------------------------------------------------- */

  const form =
    document.getElementById(
      "signup-form"
    );

  if (!form) {
    throw new Error(
      "CAP Marketplace: signup form could not be created."
    );
  }


  form.addEventListener(
    "submit",
    handleSignupSubmit
  );


  /* ---------------------------------------------------------
     SIGN-IN NAVIGATION
     --------------------------------------------------------- */

  const signinButton =
    document.getElementById(
      "show-signin"
    );

  signinButton?.addEventListener(
    "click",
    handleSigninRequest
  );
}


/* =========================================================
   ACCOUNT CREATION
   ========================================================= */

function handleSignupSubmit(event) {

  event.preventDefault();

  clearSignupErrors();


  const form =
    event.currentTarget;

  const formData =
    new FormData(form);


  const fullName =
    String(
      formData.get("name") || ""
    ).trim();


  const email =
    String(
      formData.get("email") || ""
    ).trim();


  const password =
    String(
      formData.get("password") || ""
    );


  const confirmPassword =
    String(
      formData.get("confirmPassword") || ""
    );


  const termsAccepted =
    formData.get("terms") === "on";


  let valid = true;


  /* -------------------------------------------------------
     VALIDATION
     ------------------------------------------------------- */

  if (fullName.length < 2) {

    showSignupError(
      "signup-name-error",
      "Please enter your full name."
    );

    valid = false;
  }


  if (!isValidEmail(email)) {

    showSignupError(
      "signup-email-error",
      "Please enter a valid email address."
    );

    valid = false;
  }


  if (password.length < 8) {

    showSignupError(
      "signup-password-error",
      "Password must contain at least 8 characters."
    );

    valid = false;
  }


  if (password !== confirmPassword) {

    showSignupError(
      "signup-confirm-password-error",
      "Passwords do not match."
    );

    valid = false;
  }


  if (!termsAccepted) {

    showSignupError(
      "signup-terms-error",
      "You must accept the terms and conditions."
    );

    valid = false;
  }


  if (!valid) {

    setSignupStatus(
      "Please correct the highlighted fields.",
      "error"
    );

    return;
  }


  /* -------------------------------------------------------
     CREATE ACCOUNT
     ------------------------------------------------------- */

  try {

    const account =
      createAccount({
        fullName,
        email,
        password,
      });


    /*
     * Signup and authentication remain separate steps.
     * Creating an account does not automatically sign
     * the user in.
     */

    setSignupStatus(
      `Account created for ${account.fullName}. You can sign in next.`,
      "success"
    );


    /*
     * Prevent accidental duplicate submissions after
     * successful account creation.
     */

    disableSignupForm(true);


    /* -----------------------------------------------------
       ACCOUNT CREATED EVENT
       ----------------------------------------------------- */

    window.dispatchEvent(
      new CustomEvent(
        "cap:account-created",
        {
          detail: {

            userId:
              account.id,

            fullName:
              account.fullName,

            email:
              account.email,

          },
        }
      )
    );


  } catch (error) {

    setSignupStatus(
      error instanceof Error
        ? error.message
        : "Unable to create the account.",
      "error"
    );
  }
}


/* =========================================================
   SIGN-IN REQUEST
   ========================================================= */

function handleSigninRequest() {

  /*
   * The application router already handles this event
   * and navigates to the Sign In screen.
   */

  window.dispatchEvent(
    new CustomEvent(
      "cap:signin-requested"
    )
  );
}


/* =========================================================
   DISABLE SIGNUP FORM
   ========================================================= */

function disableSignupForm(
  disabled
) {

  const form =
    document.getElementById(
      "signup-form"
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
      "signup-submit"
    );


  if (submitButton) {

    submitButton.textContent =
      disabled
        ? "Account created"
        : "Create account";
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

function showSignupError(
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

function clearSignupErrors() {

  const errors =
    document.querySelectorAll(
      ".field-error"
    );


  errors.forEach(
    (error) => {
      error.textContent = "";
    }
  );


  setSignupStatus(
    "",
    ""
  );
}


/* =========================================================
   STATUS
   ========================================================= */

function setSignupStatus(
  message,
  type
) {

  const status =
    document.getElementById(
      "signup-status"
    );

  if (!status) {
    return;
  }


  status.textContent =
    message;

  status.dataset.type =
    type || "";
}
