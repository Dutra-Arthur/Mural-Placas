import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const mural = document.getElementById("mural");
const placasCount = document.getElementById("placasCount");
const PLACAS_COLLECTION = "placas";
let placas = [];
let usuarioAutenticado = false;

const fotoDialog = document.createElement("dialog");
fotoDialog.className = "foto-dialog";

const fecharFotoButton = document.createElement("button");
fecharFotoButton.className = "foto-dialog-close";
fecharFotoButton.type = "button";
fecharFotoButton.textContent = "Fechar";
fecharFotoButton.addEventListener("click", () => fotoDialog.close());

const fotoAmpliada = document.createElement("img");
fotoDialog.append(fecharFotoButton, fotoAmpliada);
fotoDialog.addEventListener("click", (event) => {
  if (event.target === fotoDialog) fotoDialog.close();
});
fotoDialog.addEventListener("close", () => fotoAmpliada.removeAttribute("src"));
document.body.appendChild(fotoDialog);

function atualizarPlacasCount() {
  placasCount.textContent = `${placas.length} placa${placas.length === 1 ? "" : "s"}`;
}

function criarListaRecolhivel(titulo, textoNomes) {
  const secao = document.createElement("section");
  secao.className = "placa-list-section";

  const botao = document.createElement("button");
  botao.className = "placa-list-toggle";
  botao.type = "button";
  botao.textContent = titulo;
  botao.setAttribute("aria-expanded", "false");

  const indicador = document.createElement("span");
  indicador.className = "placa-list-indicator";
  indicador.setAttribute("aria-hidden", "true");
  indicador.textContent = "+";
  botao.appendChild(indicador);

  const lista = document.createElement("ul");
  lista.hidden = true;

  const nomes = (textoNomes || "").split(/\r?\n/).filter((nome) => nome.trim());
  if (nomes.length === 0) {
    const item = document.createElement("li");
    item.textContent = "Nenhum informado.";
    lista.appendChild(item);
  } else {
    nomes.forEach((nome) => {
      const item = document.createElement("li");
      item.textContent = nome.trim();
      lista.appendChild(item);
    });
  }

  botao.addEventListener("click", () => {
    const expandida = botao.getAttribute("aria-expanded") === "true";
    botao.setAttribute("aria-expanded", String(!expandida));
    lista.hidden = expandida;
    indicador.textContent = expandida ? "+" : "-";
  });

  secao.append(botao, lista);
  return secao;
}

function renderizarMural() {
  mural.innerHTML = "";

  if (placas.length === 0) {
    mural.innerHTML = `<div class="placa-card"><div class="placa-body"><p>Nenhuma placa adicionada ainda. Use o link acima para cadastrar uma nova placa.</p></div></div>`;
    atualizarPlacasCount();
    return;
  }

  placas.forEach((placa) => {
    const card = document.createElement("article");
    card.className = "placa-card";

    const imageContainer = document.createElement(placa.imageData ? "button" : "div");
    imageContainer.className = "placa-image";
    if (placa.imageData) {
      imageContainer.type = "button";
      imageContainer.setAttribute("aria-label", `Ampliar foto da placa da turma ${placa.nomeTurma || "sem nome"}`);

      const imagem = document.createElement("img");
      imagem.src = placa.imageData;
      imagem.alt = `Placa da turma ${placa.nomeTurma || "sem nome"}`;
      imageContainer.appendChild(imagem);
      imageContainer.addEventListener("click", () => {
        fotoAmpliada.src = placa.imageData;
        fotoAmpliada.alt = `Foto ampliada da placa da turma ${placa.nomeTurma || "sem nome"}`;
        fotoDialog.showModal();
      });
    }

    const body = document.createElement("div");
    body.className = "placa-body";

    const titulo = document.createElement("h3");
    titulo.textContent = `Turma ${placa.nomeTurma || "Sem Nome"}`;

    const ano = document.createElement("p");
    ano.textContent = `Ano/Semestre: ${placa.anoSemestre}`;

    const presidenteP = document.createElement("p");
    presidenteP.textContent = `Presidente: ${placa.presidente || "Não informado"}`;

    const reitorP = document.createElement("p");
    reitorP.textContent = `Reitor/a: ${placa.reitor}`;

    const diretorP = document.createElement("p");
    diretorP.textContent = `Diretor/a do campus: ${placa.diretorCampus}`;

    const coordenadorP = document.createElement("p");
    coordenadorP.textContent = `Coordenador/a: ${placa.coordenador}`;

    const paraninfoP = document.createElement("p");
    paraninfoP.textContent = `Paraninfo/a: ${placa.paraninfo}`;

    const patronoP = document.createElement("p");
    patronoP.textContent = `Patrono ou Patronesse: ${placa.patrono}`;

    const mestreAmigoP = document.createElement("p");
    mestreAmigoP.textContent = `Mestre Amigo: ${placa.mestreAmigo}`;

    const oradoraP = document.createElement("p");
    oradoraP.textContent = `Oradora: ${placa.oradora}`;

    const juramentistaP = document.createElement("p");
    juramentistaP.textContent = `Juramentista: ${placa.juramentista}`;

    const professoresSection = criarListaRecolhivel(
      "Professores/as Homenageados/as",
      placa.professoresHomenageados
    );
    const comissaoSection = criarListaRecolhivel(
      "Comissão de Formatura",
      placa.comissaoFormatura
    );
    const formandosSection = criarListaRecolhivel("Formandos", placa.formandos);

    if (usuarioAutenticado) {
      const actions = document.createElement("div");
      actions.className = "card-actions";

      const editButton = document.createElement("button");
      editButton.className = "card-button edit";
      editButton.textContent = "Editar";
      editButton.type = "button";
      editButton.addEventListener("click", () => editarPlaca(placa.id));

      const deleteButton = document.createElement("button");
      deleteButton.className = "card-button delete";
      deleteButton.textContent = "Remover";
      deleteButton.type = "button";
      deleteButton.addEventListener("click", () => removerPlaca(placa.id));

      actions.appendChild(editButton);
      actions.appendChild(deleteButton);
      body.appendChild(actions);
    }

    body.appendChild(titulo);
    body.appendChild(ano);
    body.appendChild(presidenteP);
    body.appendChild(reitorP);
    body.appendChild(diretorP);
    body.appendChild(coordenadorP);
    body.appendChild(paraninfoP);
    body.appendChild(patronoP);
    body.appendChild(mestreAmigoP);
    body.appendChild(oradoraP);
    body.appendChild(juramentistaP);
    body.appendChild(professoresSection);
    body.appendChild(comissaoSection);
    body.appendChild(formandosSection);
    card.appendChild(imageContainer);
    card.appendChild(body);
    mural.appendChild(card);
  });

  atualizarPlacasCount();
}

function editarPlaca(id) {
  window.location.href = `home.html?editId=${encodeURIComponent(id)}`;
}

async function removerPlaca(id) {
  const placa = placas.find((item) => item.id === id);
  if (!placa) return;

  const confirmado = confirm(`Deseja remover a placa da turma ${placa.nomeTurma} (${placa.anoSemestre})?`);
  if (!confirmado) return;

  try {
    await deleteDoc(doc(db, PLACAS_COLLECTION, id));
  } catch (error) {
    console.error("Erro ao remover placa do Firestore:", error);
    alert("Não foi possível remover a placa no momento.");
  }
}

function carregarPlacas() {
  const q = query(collection(db, PLACAS_COLLECTION), orderBy("updatedAt", "desc"));
  onSnapshot(
    q,
    (snapshot) => {
      placas = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      renderizarMural();
    },
    (error) => {
      console.error("Erro ao carregar placas do Firestore:", error);
      placas = [];
      renderizarMural();
    }
  );
}

onAuthStateChanged(auth, (user) => {
  usuarioAutenticado = Boolean(user);
  renderizarMural();
});

carregarPlacas();
