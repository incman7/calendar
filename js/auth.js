import { supabase } from './supabase.js';

/**
 * Initialises auth state. If Supabase is not configured, calls onSignedOut
 * immediately (app runs in local-only mode).
 */
export async function initAuth(onSignedIn, onSignedOut) {
  if (!supabase) {
    onSignedOut();
    return;
  }

  // Handle error hash from magic link redirect (e.g. expired link)
  const hash = new URLSearchParams(window.location.hash.slice(1));
  if (hash.get('error')) {
    const desc = hash.get('error_description')?.replace(/\+/g, ' ') || 'Sign-in link failed.';
    history.replaceState(null, '', window.location.pathname);
    _showAuthUI();
    const msgEl = document.getElementById('authMsg');
    if (msgEl) { msgEl.textContent = desc + ' Please request a new link.'; msgEl.className = 'auth-msg error'; }
    onSignedOut();
    return;
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    _showUserUI(session.user);
    await onSignedIn(session.user);
  } else {
    _showAuthUI();
    onSignedOut();
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session) {
      _showUserUI(session.user);
      await onSignedIn(session.user);
    } else {
      _showAuthUI();
      onSignedOut();
    }
  });
}

function _showAuthUI() {
  document.getElementById('authOverlay').classList.add('open');
}

function _showUserUI(user) {
  document.getElementById('authOverlay').classList.remove('open');
  const el = document.getElementById('userEmail');
  if (el) el.textContent = user.email;
}

export function initAuthHandlers() {
  if (!supabase) return;

  const emailInput = document.getElementById('authEmail');
  const sendBtn    = document.getElementById('authSendBtn');
  const msgEl      = document.getElementById('authMsg');

  sendBtn.onclick = async () => {
    const email = emailInput.value.trim();
    if (!email) { emailInput.focus(); return; }
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending…';
    msgEl.className = 'auth-msg';
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) {
      msgEl.textContent = error.message;
      msgEl.classList.add('error');
      sendBtn.disabled = false;
      sendBtn.textContent = 'Send magic link';
    } else {
      msgEl.textContent = `Check ${email} for your magic link!`;
      msgEl.classList.add('success');
    }
  };

  emailInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendBtn.click();
  });

  const signOutBtn = document.getElementById('signOutBtn');
  if (signOutBtn) signOutBtn.onclick = () => supabase.auth.signOut();
}
