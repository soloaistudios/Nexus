/* =========================================================
   CAP MARKETPLACE
   SIGNUP SCREEN
   ========================================================= */

import { createAccount } from "./auth.js";

export function renderSignup(app) {
  app.innerHTML = `
    <section class="signup-page">
      <div class="signup-shell">

        <div class="signup-brand">
          <img
            class="signup-logo"
            src="assets/icons/cap-logo.png"
            alt="CAP Marketplace"
          />

          <h1>CAP Marketplace</h1>

          <p class="signup-tagline">
            P2P Opportunity Exchange
          </p>
        </div>

        <div class="signup-card">

          <div class="signup-header">
            <h2>Create your account</h2>

            <p>
              Join the marketplace and discover new P2P opportunities.
            </p>
          </div>

          <form id="signup-form" novalidate>

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

            <button
              type="submit"
              class="signup-submit"
              id="signup-submit"
            >
              Create account
            </button>

            <div
              id="signup-status"
              class="signup-status"
              role="status"
              aria-live="polite"
            ></div>

          </form>

          <div class="signup-footer">
            <span>Already have an account?</span>

            <button
              type="button"
              id="show-signin"
              class="signin-link"
            >
              Sign in
            </button>
          </div>

        </div>

        <p class="signup-security">
          This browser-only prototype keeps account data on this
          device. Production authentication will require a secure
          server-side authentication system.
        </p>

      </div>
    </section>
  `;

  const form = document.getElementById("signup-form");

  if (!form) {
    throw new Error(
      "CAP Marketplace: signup form could not be created."
    );
  }

  form.addEventListener(
    "submit",
    handleSignupSubmit
  );

  /*
   * Sign-in navigation will be connected when the
   * signin module is added.
   */
  const signinButton =
    document.getElementById("show-signin");

  signinButton?.addEventListener(
    "click",
    handleSigninRequest
  );
}


/**
 * Handle account creation.
 */
function handleSignupSubmit(event) {
  event.preventDefault();

  clearSignupErrors();

  const form = event.currentTarget;

  const formData = new FormData(form);

  const fullName = String(
    formData.get("name") || ""
  ).trim();

  const email = String(
    formData.get("email") || ""
  ).trim();

  const password = String(
    formData.get("password") || ""
  );

  const confirmPassword = String(
    formData.get("confirmPassword") || ""
  );

  const termsAccepted =
    formData.get("terms") === "on";

  let valid = true;

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

  try {
    const account = createAccount({
      fullName,
      email,
      password,
    });

    /*
     * Account creation succeeded.
     *
     * We do NOT sign the user in automatically.
     * Signup and authentication remain separate steps.
     */

    setSignupStatus(
      `Account created for ${account.fullName}. You can sign in next.`,
      "success"
    );

    /*
     * Lock the creation form after successful account
     * creation so the user doesn't accidentally create
     * another account from the same form.
     */
    disableSignupForm(true);

    /*
     * Notify the application shell.
     *
     * The sign-in module/router will consume this event
     * once it is added.
     */
    window.dispatchEvent(
      new CustomEvent("cap:account-created", {
        detail: {
          userId: account.id,
          fullName: account.fullName,
          email: account.email,
        },
      })
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


/**
 * Temporary navigation event.
 *
 * The actual Sign In screen will be connected in the
 * next authentication module.
 */
function handleSigninRequest() {
  window.dispatchEvent(
    new CustomEvent("cap:signin-requested")
  );

  setSignupStatus(
    "Sign In will be connected in the next module.",
    "success"
  );
}


/**
 * Disable or enable signup controls.
 */
function disableSignupForm(disabled) {
  const form = document.getElementById("signup-form");

  if (!form) {
    return;
  }

  const controls =
    form.querySelectorAll(
      "input, button"
    );

  controls.forEach((control) => {
    control.disabled = disabled;
  });

  const submitButton =
    document.getElementById("signup-submit");

  if (submitButton) {
    submitButton.textContent =
      disabled
        ? "Account created"
        : "Create account";
  }
}


/**
 * Basic email validation.
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


/**
 * Display a field error.
 */
function showSignupError(
  elementId,
  message
) {
  const element =
    document.getElementById(elementId);

  if (element) {
    element.textContent = message;
  }
}


/**
 * Clear field errors.
 */
function clearSignupErrors() {
  const errors =
    document.querySelectorAll(
      ".field-error"
    );

  errors.forEach((error) => {
    error.textContent = "";
  });

  setSignupStatus("", "");
}


/**
 * Display form status.
 */
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

  status.textContent = message;
  status.dataset.type = type || "";
}
