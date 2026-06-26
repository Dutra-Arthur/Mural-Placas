import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const placaForm = document.getElementById("placaForm");
const placaIdField = document.getElementById("placaId");
const imagemArquivo = document.getElementById("imagemArquivo");
const imagemUrl = document.getElementById("imagemUrl");
const imagePreview = document.getElementById("imagePreview");
const anoSemestre = document.getElementById("anoSemestre");
const reitor = document.getElementById("reitor");
const diretorCampus = document.getElementById("diretorCampus");
const coordenador = document.getElementById("coordenador");
const nomeTurma = document.getElementById("nomeTurma");
const paraninfo = document.getElementById("paraninfo");
const patrono = document.getElementById("patrono");
const mestreAmigo = document.getElementById("mestreAmigo");
const professoresHomenageados = document.getElementById("professoresHomenageados");
const comissaoFormatura = document.getElementById("comissaoFormatura");
const oradora = document.getElementById("oradora");
const juramentista = document.getElementById("juramentista");
const formandos = document.getElementById("formandos");
const limparBotao = document.getElementById("limparBotao");
const STORAGE_KEY = "muralPlacasData";

let placas = [];
let currentImageData = "";
let isEditing = false;

// Verificar autenticação
function verificarAutenticacao() {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      alert("Acesso restrito. Por favor, faça login como administrador.");
      window.location.href = "login.html?redirect=home.html";
    }
  });
}

// Fazer logout
async function fazerLogout() {
  await signOut(auth);
  window.location.href = "login.html";
}

function carregarPlacas() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    placas = [];
    return;
  }

  try {
    placas = JSON.parse(saved);
  } catch (err) {
    placas = [];
  }
}

function salvarPlacas() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(placas));
}

function atualizarPreviewImagem(source) {
  imagePreview.innerHTML = "";
  if (!source) {
    imagePreview.textContent = "Prévia da imagem";
    return;
  }

  const img = document.createElement("img");
  img.src = source;
  img.alt = "Prévia da placa";
  imagePreview.appendChild(img);
}

function limparFormulario() {
  placaIdField.value = "";
  imagemArquivo.value = "";
  imagemUrl.value = "";
  anoSemestre.value = "";
  reitor.value = "";
  diretorCampus.value = "";
  coordenador.value = "";
  nomeTurma.value = "";
  paraninfo.value = "";
  patrono.value = "";
  mestreAmigo.value = "";
  professoresHomenageados.value = "";
  comissaoFormatura.value = "";
  oradora.value = "";
  juramentista.value = "";
  formandos.value = "";
  currentImageData = "";
  isEditing = false;
  atualizarPreviewImagem("");
  document.getElementById("salvarBotao").textContent = "Salvar placa";
}

function prepararEdicao(placa) {
  placaIdField.value = placa.id;
  imagemArquivo.value = "";
  imagemUrl.value = placa.imageData || "";
  anoSemestre.value = placa.anoSemestre;
  reitor.value = placa.reitor;
  diretorCampus.value = placa.diretorCampus;
  coordenador.value = placa.coordenador;
  nomeTurma.value = placa.nomeTurma;
  paraninfo.value = placa.paraninfo;
  patrono.value = placa.patrono;
  mestreAmigo.value = placa.mestreAmigo;
  professoresHomenageados.value = placa.professoresHomenageados;
  comissaoFormatura.value = placa.comissaoFormatura;
  oradora.value = placa.oradora;
  juramentista.value = placa.juramentista;
  formandos.value = placa.formandos;
  currentImageData = placa.imageData || "";
  isEditing = true;
  atualizarPreviewImagem(currentImageData);
  document.getElementById("salvarBotao").textContent = "Atualizar placa";
}

function carregarEdicaoSeHouver() {
  const params = new URLSearchParams(window.location.search);
  const editId = params.get("editId");
  if (!editId) return;

  const placa = placas.find((item) => item.id === editId);
  if (!placa) return;

  prepararEdicao(placa);
}

imagemArquivo.addEventListener("change", () => {
  const file = imagemArquivo.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    currentImageData = reader.result;
    imagemUrl.value = "";
    atualizarPreviewImagem(currentImageData);
  };
  reader.readAsDataURL(file);
});

imagemUrl.addEventListener("input", () => {
  const value = imagemUrl.value.trim();
  if (!value) {
    currentImageData = "";
    atualizarPreviewImagem("");
    return;
  }

  currentImageData = value;
  atualizarPreviewImagem(currentImageData);
});

placaForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const anoSemestreValue = anoSemestre.value.trim();
  const reitorValue = reitor.value.trim();
  const diretorCampusValue = diretorCampus.value.trim();
  const coordenadorValue = coordenador.value.trim();
  const nomeTurmaValue = nomeTurma.value.trim();
  const paraninfoValue = paraninfo.value.trim();
  const patronoValue = patrono.value.trim();
  const mestreAmigoValue = mestreAmigo.value.trim();
  const professoresHomenageadosValue = professoresHomenageados.value.trim();
  const comissaoFormaturaValue = comissaoFormatura.value.trim();
  const oradoraValue = oradora.value.trim();
  const juramentistaValue = juramentista.value.trim();
  const formandosValue = formandos.value.trim();

  if (!anoSemestreValue || !reitorValue || !diretorCampusValue || !coordenadorValue || !nomeTurmaValue || !paraninfoValue || !patronoValue || !mestreAmigoValue || !oradoraValue || !juramentistaValue || !formandosValue) {
    alert("Preencha todos os campos obrigatórios antes de salvar a placa.");
    return;
  }

  if (!currentImageData) {
    const confirmNoImage = confirm("Nenhuma imagem foi selecionada. Deseja continuar sem imagem?");
    if (!confirmNoImage) return;
  }

  const placaData = {
    id: placaIdField.value || `${Date.now()}`,
    imageData: currentImageData,
    anoSemestre: anoSemestreValue,
    reitor: reitorValue,
    diretorCampus: diretorCampusValue,
    coordenador: coordenadorValue,
    nomeTurma: nomeTurmaValue,
    paraninfo: paraninfoValue,
    patrono: patronoValue,
    mestreAmigo: mestreAmigoValue,
    professoresHomenageados: professoresHomenageadosValue,
    comissaoFormatura: comissaoFormaturaValue,
    oradora: oradoraValue,
    juramentista: juramentistaValue,
    formandos: formandosValue,
    updatedAt: new Date().toISOString(),
  };

  if (isEditing) {
    placas = placas.map((item) => (item.id === placaData.id ? placaData : item));
  } else {
    placas.unshift(placaData);
  }

  salvarPlacas();
  limparFormulario();

  const params = new URLSearchParams(window.location.search);
  if (params.has("editId")) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});

limparBotao.addEventListener("click", limparFormulario);

carregarPlacas();
verificarAutenticacao();
carregarEdicaoSeHouver();

window.fazerLogout = fazerLogout;
