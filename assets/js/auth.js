/* =========================================================
   CAP MARKETPLACE
   FRONTEND AUTHENTICATION SERVICE
   =========================================================
 *
 * Frontend-only demo authentication.
 *
 * IMPORTANT:
 * This is NOT production-grade authentication.
 * Credentials are stored locally in the browser so the
 * prototype can maintain signup/sign-in state without
 * a backend.
 * ========================================================= */

const STORAGE_KEYS = {
  ACCOUNT: "cap_marketplace_account",
  SESSION: "cap_marketplace_session",
};


/**
 * Create a new local demo account.
 */
export function createAccount({ fullName, email, password }) {
  const normalizedName = String(fullName || "").trim();
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  if (normalizedName.length < 2) {
    throw new Error("Please provide a valid full name.");
  }

  if (!isValidEmail(normalizedEmail)) {
    throw new Error("Please provide a valid email address.");
  }

  if (String(password || "").length < 8) {
    throw new Error("Password must contain at least 8 characters.");
  }

  const existingAccount = getStoredAccount();

  if (existingAccount) {
    throw new Error(
      "A demo account already exists on this device."
    );
  }

  const account = {
    id: createId("user"),
    fullName: normalizedName,
    email: normalizedEmail,

    /*
     * Frontend prototype only.
     * A real production system must never store passwords
     * like this in browser storage.
     */
    password,

    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(
    STORAGE_KEYS.ACCOUNT,
    JSON.stringify(account)
  );

  return sanitizeAccount(account);
}


/**
 * Sign in using the locally stored demo account.
 */
export function signIn({ email, password }) {
  const account = getStoredAccount();

  if (!account) {
    throw new Error(
      "No account exists on this device. Please create an account first."
    );
  }

  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  if (
    account.email !== normalizedEmail ||
    account.password !== String(password || "")
  ) {
    throw new Error("Incorrect email or password.");
  }

  const session = {
    sessionId: createId("session"),
    userId: account.id,
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(
    STORAGE_KEYS.SESSION,
    JSON.stringify(session)
  );

  return {
    user: sanitizeAccount(account),
    session,
  };
}


/**
 * Sign out the current local session.
 */
export function signOut() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}


/**
 * Return whether a local session exists.
 */
export function isSignedIn() {
  return getStoredSession() !== null;
}


/**
 * Return the currently signed-in account.
 */
export function getCurrentAccount() {
  const session = getStoredSession();

  if (!session) {
    return null;
  }

  const account = getStoredAccount();

  if (!account || account.id !== session.userId) {
    signOut();
    return null;
  }

  return sanitizeAccount(account);
}


/**
 * Return a local demo account.
 */
export function getStoredAccount() {
  const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNT);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(STORAGE_KEYS.ACCOUNT);
    return null;
  }
}


/**
 * Return the active local session.
 */
export function getStoredSession() {
  const raw = localStorage.getItem(STORAGE_KEYS.SESSION);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    return null;
  }
}


/**
 * Remove sensitive account data before exposing
 * the account object to other application modules.
 */
function sanitizeAccount(account) {
  return {
    id: account.id,
    fullName: account.fullName,
    email: account.email,
    createdAt: account.createdAt,
  };
}


/**
 * Basic email validation.
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


/**
 * Generate a local identifier.
 */
function createId(prefix) {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}
