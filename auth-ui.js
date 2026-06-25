import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
  auth,
  ADMIN_UID
} from "./firebase-config.js";

const loginLink = document.querySelector("#auth-login");
const logoutButton = document.querySelector("#auth-logout");

function updateAuthInterface(isAdmin) {
  document.body.classList.toggle("is-admin", isAdmin);

  if (loginLink) {
    loginLink.hidden = isAdmin;
  }

  if (logoutButton) {
    logoutButton.hidden = !isAdmin;
  }
}

onAuthStateChanged(auth, async (user) => {
  if (user && user.uid !== ADMIN_UID) {
    await signOut(auth);
    updateAuthInterface(false);
    return;
  }

  updateAuthInterface(Boolean(user));
});

logoutButton?.addEventListener("click", async () => {
  logoutButton.disabled = true;

  try {
    await signOut(auth);
    window.location.reload();
  } finally {
    logoutButton.disabled = false;
  }
});