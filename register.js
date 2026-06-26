import { auth } from "./firebase.js";
import { createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const ADMIN_ACCESS_KEY = "CHAVE_ADMIN_123"; // Substitua pela sua chave segura
const registerForm = document.getElementById("registerForm");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const senhaConfirmacaoInput = document.getElementById("senhaConfirmacao");
const adminKeyInput = document.getElementById("adminKey");
const errorMessage = document.getElementById("errorMessage");

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "home.html";
  }
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = emailInput.value.trim().toLowerCase();
  const senha = senhaInput.value.trim();
  const senhaConfirmacao = senhaConfirmacaoInput.value.trim();
  const adminKey = adminKeyInput.value.trim();

  if (senha !== senhaConfirmacao) {
    errorMessage.textContent = "As senhas não coincidem.";
    return;
  }

  if (adminKey !== ADMIN_ACCESS_KEY) {
    errorMessage.textContent = "Chave de administrador inválida.";
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, senha);
    window.location.href = "home.html";
  } catch (error) {
    errorMessage.textContent = error.message || "Erro ao criar cadastro.";
  }
});
