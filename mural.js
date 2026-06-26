const mural = document.getElementById("mural");
const placasCount = document.getElementById("placasCount");
const STORAGE_KEY = "muralPlacasData";
let placas = [];

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

function atualizarPlacasCount() {
  placasCount.textContent = `${placas.length} placa${placas.length === 1 ? "" : "s"}`;
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

    const imageContainer = document.createElement("div");
    imageContainer.className = "placa-image";
    imageContainer.style.backgroundImage = placa.imageData ? `url('${placa.imageData}')` : "none";

    const body = document.createElement("div");
    body.className = "placa-body";

    const titulo = document.createElement("h3");
    titulo.textContent = placa.nomeTurma || "Turma Sem Nome";

    const ano = document.createElement("p");
    ano.textContent = `Ano/Semestre: ${placa.anoSemestre}`;

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

    const professoresUl = document.createElement("ul");
    professoresUl.innerHTML = `<li><strong>Professores/as Homenageados/as:</strong></li>`;
    const professoresArray = placa.professoresHomenageados.split("\n").filter((name) => name.trim());
    if (professoresArray.length === 0) {
      const empty = document.createElement("li");
      empty.textContent = "Nenhum informado.";
      professoresUl.appendChild(empty);
    } else {
      professoresArray.forEach((nome) => {
        const item = document.createElement("li");
        item.textContent = nome.trim();
        professoresUl.appendChild(item);
      });
    }

    const comissaoUl = document.createElement("ul");
    comissaoUl.innerHTML = `<li><strong>Comissão de Formatura:</strong></li>`;
    const comissaoArray = placa.comissaoFormatura.split("\n").filter((name) => name.trim());
    if (comissaoArray.length === 0) {
      const empty = document.createElement("li");
      empty.textContent = "Nenhum informado.";
      comissaoUl.appendChild(empty);
    } else {
      comissaoArray.forEach((nome) => {
        const item = document.createElement("li");
        item.textContent = nome.trim();
        comissaoUl.appendChild(item);
      });
    }

    const lista = document.createElement("ul");
    lista.innerHTML = `<li><strong>Formandos:</strong></li>`;
    const nomesArray = placa.formandos.split("\n").filter((name) => name.trim());
    if (nomesArray.length === 0) {
      const empty = document.createElement("li");
      empty.textContent = "Nenhum informado.";
      lista.appendChild(empty);
    } else {
      nomesArray.forEach((nome) => {
        const item = document.createElement("li");
        item.textContent = nome.trim();
        lista.appendChild(item);
      });
    }

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

    body.appendChild(titulo);
    body.appendChild(ano);
    body.appendChild(reitorP);
    body.appendChild(diretorP);
    body.appendChild(coordenadorP);
    body.appendChild(paraninfoP);
    body.appendChild(patronoP);
    body.appendChild(mestreAmigoP);
    body.appendChild(oradoraP);
    body.appendChild(juramentistaP);
    body.appendChild(professoresUl);
    body.appendChild(comissaoUl);
    body.appendChild(lista);
    body.appendChild(actions);

    card.appendChild(imageContainer);
    card.appendChild(body);
    mural.appendChild(card);
  });

  atualizarPlacasCount();
}

function editarPlaca(id) {
  window.location.href = `home.html?editId=${encodeURIComponent(id)}`;
}

function removerPlaca(id) {
  const placa = placas.find((item) => item.id === id);
  if (!placa) return;

  const confirmado = confirm(`Deseja remover a placa da turma ${placa.nomeTurma} (${placa.anoSemestre})?`);
  if (!confirmado) return;

  placas = placas.filter((item) => item.id !== id);
  salvarPlacas();
  renderizarMural();
}

carregarPlacas();
renderizarMural();
