/* =========================================================
   CAP MARKETPLACE
   GLOBAL DEBUG CONSOLE
   ========================================================= */

/*
   Captures:
   - JavaScript runtime errors
   - Unhandled Promise rejections
   - console.error()
   - CAP application events
   - Startup/module failures that occur after initialization

   Displays:
   - On-screen DEBUG button
   - On-screen diagnostic panel
   - Error count
   - Stack traces
   - Copy Bug Report button
   - Clear button

   IMPORTANT:
   Initialize this module BEFORE the rest of the
   CAP Marketplace application modules.
*/

const CAP_DEBUG_MAX_ENTRIES = 200;

const debugState = {
  initialized: false,
  entries: [],
  fatalError: false,
  originalConsoleError: null,
};


/* =========================================================
   PUBLIC INITIALIZER
   ========================================================= */

export function initCAPDebug() {
  if (debugState.initialized) {
    return;
  }

  debugState.initialized = true;

  installGlobalErrorCapture();
  installPromiseRejectionCapture();
  installConsoleErrorCapture();
  installCAPEventCapture();

  /*
   * Build the UI immediately when possible.
   */
  if (document.body) {
    createCAPDebugPanel();
  }

  addDebugEntry({
    level: "info",
    source: "CAP DEBUG",
    message:
      "CAP Marketplace debug monitor initialized.",
  });
}


/* =========================================================
   GLOBAL ERROR CAPTURE
   ========================================================= */

function installGlobalErrorCapture() {
  window.addEventListener(
    "error",
    (event) => {
      const error =
        event.error;

      const filename =
        event.filename ||
        "Unknown source";

      const line =
        event.lineno || 0;

      const column =
        event.colno || 0;

      const message =
        error?.message ||
        event.message ||
        "Unknown JavaScript error.";

      const stack =
        error?.stack ||
        "";

      addDebugEntry({
        level: "error",
        source: filename,
        message,
        details:
          stack ||
          `Location: ${filename}:${line}:${column}`,
      });

      debugState.fatalError = true;

      /*
       * A startup/rendering failure may produce
       * a blank screen. Automatically open diagnostics.
       */
      openCAPDebugPanel();
    }
  );
}


/* =========================================================
   UNHANDLED PROMISE REJECTION CAPTURE
   ========================================================= */

function installPromiseRejectionCapture() {
  window.addEventListener(
    "unhandledrejection",
    (event) => {
      const reason =
        event.reason;

      const message =
        reason?.message ||
        String(
          reason ||
          "Unknown Promise rejection."
        );

      const stack =
        reason?.stack ||
        "";

      addDebugEntry({
        level: "error",
        source:
          "Unhandled Promise Rejection",
        message,
        details:
          stack ||
          "No stack trace available.",
      });

      debugState.fatalError = true;

      openCAPDebugPanel();
    }
  );
}


/* =========================================================
   CONSOLE.ERROR CAPTURE
   ========================================================= */

function installConsoleErrorCapture() {
  debugState.originalConsoleError =
    console.error;

  console.error =
    (...args) => {
      addDebugEntry({
        level: "error",
        source: "console.error",
        message:
          formatArguments(args),
      });

      /*
       * Preserve the normal browser console.
       */
      debugState.originalConsoleError.apply(
        console,
        args
      );
    };
}


/* =========================================================
   CAP APPLICATION EVENT CAPTURE
   ========================================================= */

function installCAPEventCapture() {
  const events = [
    "cap:order-completed",
    "cap:order-cancelled",
    "cap:order-created",
    "cap:auth-error",
    "cap:auth-ready",
    "cap:marketplace-ready",
  ];

  for (
    const eventName
    of events
  ) {
    window.addEventListener(
      eventName,
      (event) => {
        addDebugEntry({
          level: "event",
          source: eventName,
          message:
            "CAP application event received.",
          details:
            safeSerialize(
              event.detail
            ),
        });
      }
    );
  }
}


/* =========================================================
   ADD DEBUG ENTRY
   ========================================================= */

export function addDebugEntry({
  level = "info",
  source = "CAP",
  message = "",
  details = "",
} = {}) {
  const entry = {
    id:
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,

    timestamp:
      new Date().toISOString(),

    level:
      String(level),

    source:
      String(source),

    message:
      String(message),

    details:
      String(details || ""),

    location:
      typeof window !== "undefined"
        ? window.location.href
        : "unknown",
  };

  debugState.entries.push(entry);

  if (
    debugState.entries.length >
    CAP_DEBUG_MAX_ENTRIES
  ) {
    debugState.entries.shift();
  }

  renderCAPDebugPanel();

  return entry;
}


/* =========================================================
   CREATE DEBUG UI
   ========================================================= */

function createCAPDebugPanel() {
  if (
    document.getElementById(
      "cap-debug-root"
    )
  ) {
    return;
  }

  const root =
    document.createElement("section");

  root.id =
    "cap-debug-root";

  root.className =
    "cap-debug-root";

  root.innerHTML = `
    <button
      type="button"
      class="cap-debug-toggle"
      id="cap-debug-toggle"
      aria-label="Open CAP Debug Console"
    >
      <span class="cap-debug-toggle-icon">
        🐛
      </span>

      <span class="cap-debug-toggle-label">
        DEBUG
      </span>

      <span
        class="cap-debug-count"
        id="cap-debug-count"
      >
        0
      </span>
    </button>

    <div
      class="cap-debug-panel"
      id="cap-debug-panel"
      aria-hidden="true"
    >

      <div class="cap-debug-header">

        <div class="cap-debug-title-group">
          <strong>
            CAP DEBUG CONSOLE
          </strong>

          <span>
            Runtime diagnostics
          </span>
        </div>

        <div class="cap-debug-header-actions">

          <button
            type="button"
            class="cap-debug-action"
            id="cap-debug-copy"
          >
            Copy Bug Report
          </button>

          <button
            type="button"
            class="cap-debug-action"
            id="cap-debug-clear"
          >
            Clear
          </button>

          <button
            type="button"
            class="cap-debug-close"
            id="cap-debug-close"
            aria-label="Close debug panel"
          >
            ×
          </button>

        </div>

      </div>

      <div class="cap-debug-status">

        <span
          class="cap-debug-status-dot"
          id="cap-debug-status-dot"
        ></span>

        <span
          id="cap-debug-status-text"
        >
          Monitoring application
        </span>

      </div>

      <div
        class="cap-debug-log"
        id="cap-debug-log"
      ></div>

      <div class="cap-debug-footer">

        <span>
          Diagnostics are stored locally for this session.
        </span>

        <span
          id="cap-debug-runtime"
        ></span>

      </div>

    </div>
  `;

  document.body.appendChild(root);

  bindCAPDebugControls();

  renderCAPDebugPanel();
}


/* =========================================================
   BIND CONTROLS
   ========================================================= */

function bindCAPDebugControls() {
  document
    .getElementById(
      "cap-debug-toggle"
    )
    ?.addEventListener(
      "click",
      () => {
        toggleCAPDebugPanel();
      }
    );

  document
    .getElementById(
      "cap-debug-close"
    )
    ?.addEventListener(
      "click",
      () => {
        closeCAPDebugPanel();
      }
    );

  document
    .getElementById(
      "cap-debug-clear"
    )
    ?.addEventListener(
      "click",
      () => {
        clearCAPDebug();
      }
    );

  document
    .getElementById(
      "cap-debug-copy"
    )
    ?.addEventListener(
      "click",
      async () => {
        await copyCAPBugReport();
      }
    );
}


/* =========================================================
   RENDER DEBUG PANEL
   ========================================================= */

function renderCAPDebugPanel() {
  if (
    typeof document === "undefined"
  ) {
    return;
  }

  if (!document.body) {
    return;
  }

  createCAPDebugPanelWithoutRecursion();

  const log =
    document.getElementById(
      "cap-debug-log"
    );

  const count =
    document.getElementById(
      "cap-debug-count"
    );

  const statusText =
    document.getElementById(
      "cap-debug-status-text"
    );

  const statusDot =
    document.getElementById(
      "cap-debug-status-dot"
    );

  if (!log) {
    return;
  }

  log.innerHTML = "";

  for (
    const entry
    of debugState.entries
  ) {
    const item =
      document.createElement("article");

    item.className =
      `cap-debug-entry is-${entry.level}`;

    item.innerHTML = `
      <div class="cap-debug-entry-top">

        <span class="cap-debug-entry-level">
          ${escapeHTML(
            entry.level
          )}
        </span>

        <span class="cap-debug-entry-source">
          ${escapeHTML(
            entry.source
          )}
        </span>

        <time>
          ${escapeHTML(
            formatDebugTime(
              entry.timestamp
            )
          )}
        </time>

      </div>

      <div class="cap-debug-entry-message">
        ${escapeHTML(
          entry.message
        )}
      </div>

      ${
        entry.details
          ? `
            <pre
              class="cap-debug-entry-details"
            >${escapeHTML(
              entry.details
            )}</pre>
          `
          : ""
      }
    `;

    log.appendChild(item);
  }

  if (count) {
    count.textContent =
      String(
        debugState.entries.length
      );
  }

  const errorCount =
    debugState.entries.filter(
      (entry) =>
        entry.level === "error"
    ).length;

  if (
    debugState.fatalError ||
    errorCount > 0
  ) {
    if (statusText) {
      statusText.textContent =
        `${errorCount} error${
          errorCount === 1
            ? ""
            : "s"
        } detected`;
    }

    statusDot?.classList.add(
      "is-error"
    );
  } else {
    if (statusText) {
      statusText.textContent =
        "Monitoring application";
    }

    statusDot?.classList.remove(
      "is-error"
    );
  }

  const runtime =
    document.getElementById(
      "cap-debug-runtime"
    );

  if (runtime) {
    runtime.textContent =
      `Entries: ${debugState.entries.length}`;
  }

  /*
   * Keep the newest error visible.
   */
  if (
    errorCount > 0
  ) {
    log.scrollTop =
      log.scrollHeight;
  }
}


/* =========================================================
   SAFE UI CREATION
   ========================================================= */

function createCAPDebugPanelWithoutRecursion() {
  if (
    document.getElementById(
      "cap-debug-root"
    )
  ) {
    return;
  }

  const root =
    document.createElement("section");

  root.id =
    "cap-debug-root";

  root.className =
    "cap-debug-root";

  root.innerHTML = `
    <button
      type="button"
      class="cap-debug-toggle"
      id="cap-debug-toggle"
      aria-label="Open CAP Debug Console"
    >
      <span class="cap-debug-toggle-icon">
        🐛
      </span>

      <span class="cap-debug-toggle-label">
        DEBUG
      </span>

      <span
        class="cap-debug-count"
        id="cap-debug-count"
      >
        0
      </span>
    </button>

    <div
      class="cap-debug-panel"
      id="cap-debug-panel"
      aria-hidden="true"
    >

      <div class="cap-debug-header">

        <div class="cap-debug-title-group">
          <strong>
            CAP DEBUG CONSOLE
          </strong>

          <span>
            Runtime diagnostics
          </span>
        </div>

        <div class="cap-debug-header-actions">

          <button
            type="button"
            class="cap-debug-action"
            id="cap-debug-copy"
          >
            Copy Bug Report
          </button>

          <button
            type="button"
            class="cap-debug-action"
            id="cap-debug-clear"
          >
            Clear
          </button>

          <button
            type="button"
            class="cap-debug-close"
            id="cap-debug-close"
            aria-label="Close debug panel"
          >
            ×
          </button>

        </div>

      </div>

      <div class="cap-debug-status">

        <span
          class="cap-debug-status-dot"
          id="cap-debug-status-dot"
        ></span>

        <span
          id="cap-debug-status-text"
        >
          Monitoring application
        </span>

      </div>

      <div
        class="cap-debug-log"
        id="cap-debug-log"
      ></div>

      <div class="cap-debug-footer">

        <span>
          Diagnostics are stored locally for this session.
        </span>

        <span
          id="cap-debug-runtime"
        ></span>

      </div>

    </div>
  `;

  document.body.appendChild(root);

  bindCAPDebugControls();
}


/* =========================================================
   OPEN / CLOSE
   ========================================================= */

export function openCAPDebugPanel() {
  if (!document.body) {
    return;
  }

  createCAPDebugPanelWithoutRecursion();

  const panel =
    document.getElementById(
      "cap-debug-panel"
    );

  if (!panel) {
    return;
  }

  panel.classList.add(
    "is-open"
  );

  panel.setAttribute(
    "aria-hidden",
    "false"
  );
}


function closeCAPDebugPanel() {
  const panel =
    document.getElementById(
      "cap-debug-panel"
    );

  if (!panel) {
    return;
  }

  panel.classList.remove(
    "is-open"
  );

  panel.setAttribute(
    "aria-hidden",
    "true"
  );
}


function toggleCAPDebugPanel() {
  const panel =
    document.getElementById(
      "cap-debug-panel"
    );

  if (!panel) {
    return;
  }

  if (
    panel.classList.contains(
      "is-open"
    )
  ) {
    closeCAPDebugPanel();
  } else {
    openCAPDebugPanel();
  }
}


/* =========================================================
   CLEAR LOG
   ========================================================= */

function clearCAPDebug() {
  debugState.entries = [];
  debugState.fatalError = false;

  renderCAPDebugPanel();

  addDebugEntry({
    level: "info",
    source: "CAP DEBUG",
    message:
      "Debug console cleared.",
  });
}


/* =========================================================
   COPY BUG REPORT
   ========================================================= */

async function copyCAPBugReport() {
  const report =
    buildCAPBugReport();

  try {
    await navigator.clipboard.writeText(
      report
    );

    const button =
      document.getElementById(
        "cap-debug-copy"
      );

    if (button) {
      const originalText =
        button.textContent;

      button.textContent =
        "Copied ✓";

      setTimeout(
        () => {
          button.textContent =
            originalText;
        },
        1400
      );
    }

    addDebugEntry({
      level: "info",
      source: "CAP DEBUG",
      message:
        "Bug report copied to clipboard.",
    });
  } catch (error) {
    addDebugEntry({
      level: "error",
      source: "Clipboard",
      message:
        "Clipboard copy failed.",
      details:
        error?.stack ||
        error?.message ||
        String(error),
    });

    /*
     * Browser fallback.
     */
    window.prompt(
      "Copy CAP Bug Report",
      report
    );
  }
}


/* =========================================================
   BUILD BUG REPORT
   ========================================================= */

function buildCAPBugReport() {
  const errors =
    debugState.entries.filter(
      (entry) =>
        entry.level === "error"
    );

  const lines = [
    "=================================================",
    "CAP MARKETPLACE BUG REPORT",
    "=================================================",
    "",

    `Generated:
${new Date().toISOString()}`,

    `Page:
${window.location.href}`,

    `User Agent:
${navigator.userAgent}`,

    `Online:
${navigator.onLine}`,

    `Fatal Error:
${debugState.fatalError}`,

    `Errors:
${errors.length}`,

    `Total Entries:
${debugState.entries.length}`,

    "",
    "-------------------------------------------------",
    "DIAGNOSTIC LOG",
    "-------------------------------------------------",
    "",
  ];

  debugState.entries.forEach(
    (entry, index) => {
      lines.push(
        `[${index + 1}]`,
        `Time: ${entry.timestamp}`,
        `Level: ${entry.level}`,
        `Source: ${entry.source}`,
        `Message: ${entry.message}`,
        `Location: ${entry.location}`,
      );

      if (entry.details) {
        lines.push(
          `Details:\n${entry.details}`
        );
      }

      lines.push("");
    }
  );

  lines.push(
    "-------------------------------------------------",
    "END CAP BUG REPORT",
    "-------------------------------------------------"
  );

  return lines.join("\n");
}


/* =========================================================
   FORMAT HELPERS
   ========================================================= */

function formatArguments(args) {
  return args
    .map(
      (value) => {
        if (
          value instanceof Error
        ) {
          return (
            value.stack ||
            value.message
          );
        }

        if (
          value &&
          typeof value ===
            "object"
        ) {
          return safeSerialize(
            value
          );
        }

        return String(value);
      }
    )
    .join(" ");
}


function safeSerialize(value) {
  try {
    return JSON.stringify(
      value,
      null,
      2
    );
  } catch {
    return String(value);
  }
}


function escapeHTML(value) {
  return String(value)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}


function formatDebugTime(iso) {
  try {
    return new Date(
      iso
    ).toLocaleTimeString();
  } catch {
    return iso;
  }
}


/* =========================================================
   EARLY AUTO-START
   ========================================================= */

/*
   This starts as early as this module is imported.
   It is still best practice to explicitly call:

       initCAPDebug();

   from the main application entry file before
   importing/initializing the remaining CAP modules.
*/

if (
  typeof window !==
  "undefined"
) {
  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        initCAPDebug();
      },
      {
        once: true,
      }
    );
  } else {
    initCAPDebug();
  }
}
