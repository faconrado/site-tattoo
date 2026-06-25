import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
  auth,
  ADMIN_USERNAME,
  ADMIN_EMAIL,
  ADMIN_UID
} from "./firebase-config.js";

const form = document.querySelector("#login-form");
const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");
const submitButton = document.querySelector("#login-submit");
const message = document.querySelector("#login-message");
const passwordToggle = document.querySelector("#toggle-password");

function showMessage(text, success = false) {
  message.textContent = text;
  message.classList.toggle("is-success", success);
}

function setLoading(loading) {
  submitButton.disabled = loading;
  submitButton.textContent = loading ? "Entrando..." : "Entrar";
}

passwordToggle.addEventListener("click", () => {
  const passwordIsVisible = passwordInput.type === "text";

  passwordInput.type = passwordIsVisible ? "password" : "text";
  passwordToggle.textContent = passwordIsVisible ? "Mostrar" : "Ocultar";
  passwordToggle.setAttribute("aria-pressed", String(!passwordIsVisible));
  passwordToggle.setAttribute(
    "aria-label",
    passwordIsVisible ? "Mostrar senha" : "Ocultar senha"
  );
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showMessage("");

  const username = usernameInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  if (!username || !password) {
    showMessage("Preencha o usuário e a senha.");
    return;
  }

  if (username !== ADMIN_USERNAME) {
    showMessage("Usuário ou senha inválidos.");
    return;
  }

  setLoading(true);

  try {
    await setPersistence(auth, browserLocalPersistence);

    const credential = await signInWithEmailAndPassword(
      auth,
      ADMIN_EMAIL,
      password
    );

    if (credential.user.uid !== ADMIN_UID) {
      await signOut(auth);
      throw new Error("unauthorized-user");
    }

    showMessage("Login realizado. Redirecionando...", true);
    window.location.replace("index.html");

  } catch {
    passwordInput.value = "";
    passwordInput.focus();
    showMessage("Usuário ou senha inválidos.");
  } finally {
    setLoading(false);
  }
});

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  if (user.uid === ADMIN_UID) {
    window.location.replace("index.html");
    return;
  }

  await signOut(auth);
});