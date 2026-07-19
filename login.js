import { auth } from "./firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const toggleSenhaButton = document.getElementById("toggleSenha");
const errorMessage = document.getElementById("errorMessage");
const params = new URLSearchParams(window.location.search);
const redirectTarget = params.get("redirect") || "home.html";

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = emailInput.value.trim().toLowerCase();
  const senha = senhaInput.value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    window.location.href = redirectTarget;
  } catch (error) {
    errorMessage.textContent = "E-mail ou senha incorretos. Tente novamente.";
    senhaInput.value = "";
    senhaInput.focus();
  }
});

toggleSenhaButton.addEventListener("click", () => {
  const isVisible = senhaInput.type === "text";
  senhaInput.type = isVisible ? "password" : "text";
  toggleSenhaButton.textContent = isVisible ? "Mostrar" : "Ocultar";
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = redirectTarget;
  }
});
