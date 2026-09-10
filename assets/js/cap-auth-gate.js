// CAP Marketplace Auth Gate
// Load this AFTER the marketplace's own markup/script.
// It hides the marketplace until CAP authentication succeeds, without replacing marketplace logic.

(() => {
  const SESSION_KEY = 'cap_marketplace_session_v1';
  const originalMarkup = document.body.innerHTML;
  const authStyle = document.createElement('style');
  authStyle.textContent = `.cap-auth-gate{position:fixed;inset:0;z-index:99999;background:#050a12}.cap-auth-gate[hidden]{display:none!important}`;
  document.head.appendChild(authStyle);

  function session(){
    try { const s=JSON.parse(localStorage.getItem(SESSION_KEY)||'null'); return s?.authenticated ? s : null; }
    catch (_) { return null; }
  }

  function mountAuth(){
    if (session()) return;
    document.body.innerHTML = `<div class="cap-auth-gate" id="capAuthGate"><iframe title="CAP authentication" src="CAP_Marketplace/index.html#signin" style="border:0;width:100%;height:100%"></iframe></div>`;
  }

  window.addEventListener('storage', (e) => {
    if (e.key === SESSION_KEY && session()) location.reload();
  });

  if (!session()) mountAuth();
})();
