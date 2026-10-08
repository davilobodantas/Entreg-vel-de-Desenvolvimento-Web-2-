/* ========== Parte 1 – Manipulação e validação de dados ========== */
const pedidos = [
  { id: 1, cliente: "Bia",   valor: 120,   status: "pago" },
  { id: 2, cliente: "",      valor: 80,    status: "pago" },
  { id: 3, cliente: "Caio",  valor: -10,   status: "pago" },
  { id: 4, cliente: "Dani",  valor: 45.5,  status: "pendente" },
  { id: 5, cliente: "Edu",   valor: "abc", status: "pago" },
  { id: 6, cliente: "Fabi",  valor: 200.9, status: "pago" },
];

const pedidoValido = (p) =>
  typeof p.cliente === "string" && p.cliente.trim() !== "" &&
  typeof p.valor === "number" && Number.isFinite(p.valor) && p.valor > 0;

const validos = pedidos.filter(pedidoValido);
const pagos = validos.filter((p) => p.status === "pago");
const totalFaturado = pagos.reduce((soma, p) => soma + p.valor, 0);
const textos = pagos.map((p) => `${p.cliente} — R$ ${p.valor.toFixed(2)}`);

const saida = document.getElementById("pedidos-saida");
const listaPedidos = document.createElement("ul");
listaPedidos.className = "pedidos";
textos.forEach((texto) => {
  const li = document.createElement("li");
  const span = document.createElement("span");
  const badge = document.createElement("span");
  span.textContent = texto;
  badge.className = "badge";
  badge.textContent = "pago";
  li.append(span, badge);
  listaPedidos.append(li);
});

const total = document.createElement("div");
total.className = "total";
const rotuloTotal = document.createElement("span");
const valorTotal = document.createElement("strong");
rotuloTotal.textContent = "Total faturado";
valorTotal.textContent = `R$ ${totalFaturado.toFixed(2)}`;
total.append(rotuloTotal, valorTotal);

const nota = document.createElement("p");
nota.className = "nota";
nota.textContent =
  `${pedidos.length} pedidos recebidos: ${pedidos.length - validos.length} inválidos ` +
  `e ${validos.length - pagos.length} não pagos ficaram de fora.`;

saida.replaceChildren(listaPedidos, total, nota);

/* ========== Utilitário de status (quatro estados) ========== */
function setStatus(el, msg = "", erro = false) {
  el.textContent = msg;
  el.classList.toggle("erro", erro);
}

/* ========== Parte 2 – Buscador de CEP ========== */
const formCep = document.getElementById("form-cep");
const inputCep = document.getElementById("cep");
const btnCep = document.getElementById("btn-cep");
const statusCep = document.getElementById("status-cep");
const resultadoCep = document.getElementById("resultado-cep");
const historicoCep = document.getElementById("historico-cep");
const historico = []; // [{ cep, local }]

function limparCep(valor) {
  return valor.trim().replace(/\D/g, "");
}

function renderHistorico() {
  historicoCep.replaceChildren();
  historico.forEach((h) => {
    const li = document.createElement("li");
    li.textContent = `${h.cep.slice(0, 5)}-${h.cep.slice(5)} · ${h.local}`;
    historicoCep.append(li);
  });
}

function addLinha(dl, rotulo, valor) {
  const dt = document.createElement("dt");
  const dd = document.createElement("dd");
  dt.textContent = rotulo;
  dd.textContent = valor || "—";
  dl.append(dt, dd);
}

async function buscarCep(cep) {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

formCep.addEventListener("submit", async (e) => {
  e.preventDefault();
  const bruto = inputCep.value.trim();
  const cep = limparCep(bruto);

  // Validação: só dígitos e exatamente 8 caracteres
  if (!/^\d{8}$/.test(cep) || /\D/.test(bruto.replace(/-/g, ""))) {
    resultadoCep.replaceChildren();
    setStatus(statusCep, "CEP inválido: digite exatamente 8 números.", true);
    return;
  }

  // Estado: carregando
  resultadoCep.replaceChildren();
  setStatus(statusCep, "Buscando...");
  btnCep.disabled = true;

  try {
    const dados = await buscarCep(cep);

    // Estado: vazio / não encontrado
    if (dados.erro) {
      setStatus(statusCep, "CEP não encontrado");
      return;
    }

    // Estado: sucesso
    resultadoCep.replaceChildren();
    addLinha(resultadoCep, "Rua", dados.logradouro);
    addLinha(resultadoCep, "Bairro", dados.bairro);
    addLinha(resultadoCep, "Cidade", dados.localidade);
    addLinha(resultadoCep, "UF", dados.uf);
    setStatus(statusCep, "");

    historico.unshift({ cep, local: `${dados.localidade}/${dados.uf}` });
    renderHistorico();
  } catch (err) {
    // Estado: erro (rede, timeout ou HTTP)
    setStatus(statusCep, "Falha na conexão. Verifique sua internet e tente novamente.", true);
    console.error(err);
  } finally {
    btnCep.disabled = false;
  }
});

/* ========== Parte 3 – Mini Pokédex ========== */
const formPoke = document.getElementById("form-poke");
const inputPoke = document.getElementById("poke");
const btnPoke = document.getElementById("btn-poke");
const statusPoke = document.getElementById("status-poke");
const resultadoPoke = document.getElementById("resultado-poke");

async function buscarPokemon(nome) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(nome)}`, {
    signal: AbortSignal.timeout(5000),
  });
  if (response.status === 404) return null; // não encontrado
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

formPoke.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = inputPoke.value.trim().toLowerCase();

  if (nome === "") {
    resultadoPoke.replaceChildren();
    setStatus(statusPoke, "Digite o nome de um Pokémon.", true);
    return;
  }

  resultadoPoke.replaceChildren();
  setStatus(statusPoke, "Buscando...");
  btnPoke.disabled = true;

  try {
    const poke = await buscarPokemon(nome);

    if (poke === null) {
      setStatus(statusPoke, "Pokémon não encontrado");
      return;
    }

    const card = document.createElement("article");
    card.className = "poke-card";

    const figura = document.createElement("figure");
    const img = document.createElement("img");
    img.src = poke.sprites.front_default || "";
    img.alt = `Imagem de ${poke.name}`;
    figura.append(img);

    const info = document.createElement("div");
    const titulo = document.createElement("h3");
    titulo.textContent = poke.name;
    const numero = document.createElement("span");
    numero.className = "poke-id";
    numero.textContent = `#${poke.id}`;

    const tipos = document.createElement("ul");
    tipos.className = "tipos";
    poke.types.forEach((t) => {
      const li = document.createElement("li");
      li.textContent = t.type.name;
      li.dataset.tipo = t.type.name;
      tipos.append(li);
    });

    info.append(titulo, numero, tipos);
    card.append(figura, info);
    resultadoPoke.replaceChildren(card);
    setStatus(statusPoke, "");
  } catch (err) {
    setStatus(statusPoke, "Falha na conexão. Verifique sua internet e tente novamente.", true);
    console.error(err);
  } finally {
    btnPoke.disabled = false;
  }
});
