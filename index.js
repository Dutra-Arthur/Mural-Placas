import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const placaForm = document.getElementById("placaForm");
const placaIdField = document.getElementById("placaId");
const imagemArquivo = document.getElementById("imagemArquivo");
const imagemUrl = document.getElementById("imagemUrl");
const imagePreview = document.getElementById("imagePreview");
const anoSemestre = document.getElementById("anoSemestre");
const presidente = document.getElementById("presidente");
const reitor = document.getElementById("reitor");
const diretorCampus = document.getElementById("diretorCampus");
const coordenador = document.getElementById("coordenador");
const curso = document.getElementById("curso");
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
const PLACAS_COLLECTION = "placas";
const MAX_IMAGE_BYTES = 350 * 1024;
const MAX_IMAGE_DIMENSION = 1280;
const MIN_IMAGE_DIMENSION = 320;

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

async function migrarLocalStorageParaFirestore() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    const dadosAntigos = JSON.parse(saved);
    if (!Array.isArray(dadosAntigos) || dadosAntigos.length === 0) {
      return;
    }

    for (const placa of dadosAntigos) {
      const { id, ...placaSemId } = placa;
      await addDoc(collection(db, PLACAS_COLLECTION), {
        ...placaSemId,
        updatedAt: placa.updatedAt || new Date().toISOString(),
      });
    }

    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Erro ao migrar dados antigos para o Firestore:", error);
  }
}

async function carregarPlacas() {
  try {
    const q = query(collection(db, PLACAS_COLLECTION), orderBy("updatedAt", "desc"));
    const snapshot = await getDocs(q);
    placas = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));

    if (placas.length === 0) {
      await migrarLocalStorageParaFirestore();
      const novoSnapshot = await getDocs(q);
      placas = novoSnapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    }
  } catch (error) {
    console.error("Erro ao carregar placas do Firestore:", error);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        placas = JSON.parse(saved);
      } catch (parseError) {
        console.error("Erro ao ler dados antigos do localStorage:", parseError);
        placas = [];
      }
    } else {
      placas = [];
    }
  }
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

function canvasParaBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Não foi possível converter a imagem."));
      }
    }, "image/jpeg", quality);
  });
}

function blobParaDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("Não foi possível ler a imagem."));
    reader.readAsDataURL(blob);
  });
}

async function otimizarImagem(file) {
  const bitmap = await createImageBitmap(file);

  try {
    const escala = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
    let width = Math.round(bitmap.width * escala);
    let height = Math.round(bitmap.height * escala);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Seu navegador não conseguiu processar a imagem.");
    }

    while (Math.max(width, height) >= MIN_IMAGE_DIMENSION) {
      canvas.width = width;
      canvas.height = height;
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.drawImage(bitmap, 0, 0, width, height);

      for (const quality of [0.78, 0.68, 0.58, 0.48]) {
        const blob = await canvasParaBlob(canvas, quality);
        if (blob.size <= MAX_IMAGE_BYTES) {
          return await blobParaDataUrl(blob);
        }
      }

      width = Math.round(width * 0.85);
      height = Math.round(height * 0.85);
    }

    throw new Error("A imagem continua muito grande após a compressão. Escolha uma imagem menor.");
  } finally {
    bitmap.close();
  }
}

function limparFormulario() {
  placaIdField.value = "";
  imagemArquivo.value = "";
  imagemUrl.value = "";
  anoSemestre.value = "";
  presidente.value = "";
  reitor.value = "";
  diretorCampus.value = "";
  coordenador.value = "";
  curso.value = "";
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
  presidente.value = placa.presidente || "";
  reitor.value = placa.reitor;
  diretorCampus.value = placa.diretorCampus;
  coordenador.value = placa.coordenador;
  curso.value = placa.curso || "";
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

imagemArquivo.addEventListener("change", async () => {
  const file = imagemArquivo.files[0];
  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    imagemArquivo.value = "";
    alert("Selecione um arquivo de imagem válido.");
    return;
  }

  const imagemAnterior = currentImageData;
  try {
    currentImageData = await otimizarImagem(file);
    imagemUrl.value = "";
    atualizarPreviewImagem(currentImageData);
  } catch (error) {
    currentImageData = imagemAnterior;
    imagemArquivo.value = "";
    console.error("Erro ao processar a imagem:", error);
    alert(error?.message || "Não foi possível processar a imagem selecionada.");
  }
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

placaForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const anoSemestreValue = anoSemestre.value.trim();
  const presidenteValue = presidente.value.trim();
  const reitorValue = reitor.value.trim();
  const diretorCampusValue = diretorCampus.value.trim();
  const coordenadorValue = coordenador.value.trim();
  const cursoValue = curso.value.trim();
  const nomeTurmaValue = nomeTurma.value.trim();
  const paraninfoValue = paraninfo.value.trim();
  const patronoValue = patrono.value.trim();
  const mestreAmigoValue = mestreAmigo.value.trim();
  const professoresHomenageadosValue = professoresHomenageados.value.trim();
  const comissaoFormaturaValue = comissaoFormatura.value.trim();
  const oradoraValue = oradora.value.trim();
  const juramentistaValue = juramentista.value.trim();
  const formandosValue = formandos.value.trim();

  if (!anoSemestreValue || !presidenteValue || !reitorValue || !diretorCampusValue || !coordenadorValue || !cursoValue || !nomeTurmaValue || !paraninfoValue || !patronoValue || !mestreAmigoValue || !oradoraValue || !juramentistaValue || !formandosValue) {
    alert("Preencha todos os campos obrigatórios antes de salvar a placa.");
    return;
  }

  if (!currentImageData) {
    const confirmNoImage = confirm("Nenhuma imagem foi selecionada. Deseja continuar sem imagem?");
    if (!confirmNoImage) return;
  }

  if (currentImageData.startsWith("data:image/") && currentImageData.length * 0.75 > MAX_IMAGE_BYTES) {
    alert("A imagem continua muito grande. Selecione uma imagem menor ou use uma URL externa.");
    return;
  }

  const placaData = {
    id: placaIdField.value || "",
    imageData: currentImageData,
    anoSemestre: anoSemestreValue,
    presidente: presidenteValue,
    reitor: reitorValue,
    diretorCampus: diretorCampusValue,
    coordenador: coordenadorValue,
    curso: cursoValue,
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
  const { id: placaDataId, ...dadosDaPlaca } = placaData;

  try {
    if (isEditing && placaDataId) {
      await updateDoc(doc(db, PLACAS_COLLECTION, placaDataId), dadosDaPlaca);
      placas = placas.map((item) => (item.id === placaDataId ? { ...item, ...placaData } : item));
    } else {
      const novoDoc = await addDoc(collection(db, PLACAS_COLLECTION), dadosDaPlaca);
      placaData.id = novoDoc.id;
      placas = [{ ...placaData }, ...placas];
    }

    limparFormulario();

    const params = new URLSearchParams(window.location.search);
    if (params.has("editId")) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  } catch (error) {
    console.error("Erro ao salvar placa no Firestore:", error);
    const codigoErro = error?.code || "desconhecido";
    const mensagensErro = {
      "permission-denied": "O Firestore negou a gravação. Verifique se as regras foram publicadas e se sua conta está autenticada.",
      unauthenticated: "Sua sessão não está autenticada. Entre novamente e tente salvar.",
      "resource-exhausted": "O documento ultrapassou um limite do Firestore. Se você anexou uma imagem, tente uma imagem menor.",
      "invalid-argument": "O Firestore recebeu dados inválidos ou um documento muito grande. Confira os campos e o tamanho da imagem.",
      unavailable: "O Firestore está temporariamente indisponível. Verifique a conexão e tente novamente.",
    };
    const mensagem = mensagensErro[codigoErro] || error?.message || "O Firestore recusou a gravação.";
    alert(`${mensagem}\n\nCódigo: ${codigoErro}\nDetalhe: ${error?.message || "Sem detalhes adicionais."}`);
  }
});

limparBotao.addEventListener("click", limparFormulario);

verificarAutenticacao();
carregarPlacas().then(() => {
  carregarEdicaoSeHouver();
});

carregarPlacas();
verificarAutenticacao();
carregarEdicaoSeHouver();

window.fazerLogout = fazerLogout;
