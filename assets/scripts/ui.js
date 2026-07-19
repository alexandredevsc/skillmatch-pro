const CORES_LOGO = ["is-blue", "is-purple", "is-green", "is-orange"];

function criarElemento(tag, classes = [], texto = "", documento = document) {
  const elemento = documento.createElement(tag);
  elemento.classList.add(...classes.filter(Boolean));

  if (texto) {
    elemento.textContent = texto;
  }

  return elemento;
}

function classeDaCompatibilidade(classificacao) {
  if (classificacao === "Média") return "is-medium";
  if (classificacao === "Baixa") return "is-low";
  return "";
}

export function formatarSalario(salario) {
  if (!salario) return "Salário não informado";

  const formato = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: salario.moeda ?? "BRL",
    maximumFractionDigits: 0,
  });

  return `${formato.format(salario.minimo)} – ${formato.format(salario.maximo)}`;
}

function criarDetalhe(icone, texto, documento) {
  const item = criarElemento("li", ["job-detail"], "", documento);
  const simbolo = criarElemento(
    "span",
    ["job-detail-icon"],
    icone,
    documento,
  );
  simbolo.setAttribute("aria-hidden", "true");
  item.append(simbolo, documento.createTextNode(texto));
  return item;
}

function criarGrupoHabilidades(titulo, habilidades, classe, documento) {
  const grupo = criarElemento("div", ["job-skills-group"], "", documento);
  grupo.append(criarElemento("p", ["job-skills-title"], titulo, documento));

  const lista = criarElemento("ul", ["job-skill-list"], "", documento);
  habilidades.forEach((habilidade) => {
    lista.append(
      criarElemento("li", ["job-skill", classe], habilidade, documento),
    );
  });

  grupo.append(lista);
  return grupo;
}

export function criarCardVaga(resultadoOuVaga, opcoes = {}) {
  const documento = opcoes.documento ?? document;
  const resultado = resultadoOuVaga.vaga ? resultadoOuVaga : null;
  const vaga = resultado?.vaga ?? resultadoOuVaga;
  const card = criarElemento("article", ["job-card"], "", documento);
  card.dataset.vagaId = vaga.id;

  if (opcoes.melhorVaga) card.classList.add("is-best-match");

  const cabecalho = criarElemento("header", ["job-card-header"], "", documento);
  const indiceCor = Math.abs(String(vaga.id).length) % CORES_LOGO.length;
  const logo = criarElemento(
    "span",
    ["job-company-logo", CORES_LOGO[indiceCor]],
    vaga.sigla,
    documento,
  );
  logo.setAttribute("aria-hidden", "true");

  const titulos = criarElemento("div", ["job-heading-group"], "", documento);
  titulos.append(
    criarElemento("h3", ["job-company"], vaga.empresa, documento),
    criarElemento("p", ["job-role"], vaga.cargo, documento),
  );
  cabecalho.append(
    logo,
    titulos,
    criarElemento("span", ["job-contract-badge"], vaga.contrato, documento),
  );
  card.append(cabecalho);

  if (resultado) {
    const linha = criarElemento("div", ["job-match-row"], "", documento);
    const variacao = classeDaCompatibilidade(resultado.classificacao);
    linha.append(
      criarElemento(
        "p",
        ["job-compatibility", variacao],
        `${resultado.percentual}% compatível`,
        documento,
      ),
      criarElemento(
        "span",
        ["job-classification", variacao],
        `${resultado.classificacao} compatibilidade`,
        documento,
      ),
    );
    card.append(linha);
  }

  const detalhes = criarElemento("ul", ["job-details"], "", documento);
  detalhes.append(
    criarDetalhe("⌖", vaga.localizacao, documento),
    criarDetalhe("◷", vaga.modalidade, documento),
    criarDetalhe("$", formatarSalario(vaga.salario), documento),
  );
  card.append(detalhes);

  const habilidades = criarElemento("div", ["job-skills"], "", documento);
  if (resultado) {
    if (resultado.encontradas.length) {
      habilidades.append(
        criarGrupoHabilidades(
          "Você já possui",
          resultado.encontradas,
          "is-matched",
          documento,
        ),
      );
    }
    if (resultado.faltantes.length) {
      habilidades.append(
        criarGrupoHabilidades(
          "Para desenvolver",
          resultado.faltantes,
          "is-missing",
          documento,
        ),
      );
    }
  } else {
    habilidades.append(
      criarGrupoHabilidades(
        "Principais habilidades",
        vaga.requisitos.slice(0, 5),
        "",
        documento,
      ),
    );
  }
  card.append(habilidades);
  return card;
}

export function atualizarEstado(elemento, mensagem, classe = "") {
  elemento.hidden = !mensagem;
  elemento.textContent = mensagem;
  elemento.className = elemento.className
    .split(" ")
    .filter((nome) => !nome.startsWith("is-"))
    .join(" ");
  if (classe) elemento.classList.add(classe);
}

export function renderizarVagas(itens, elementos, opcoes = {}) {
  const { jobsContainer, jobsStatus } = elementos;
  const documento = opcoes.documento ?? document;
  jobsContainer.replaceChildren();
  jobsContainer.setAttribute("aria-busy", "false");

  if (!itens.length) {
    atualizarEstado(jobsStatus, "Nenhuma vaga disponível no momento.", "is-empty");
    return;
  }

  const melhorId = opcoes.melhorId;
  const fragmento = documento.createDocumentFragment();
  itens.forEach((item) => {
    const vaga = item.vaga ?? item;
    fragmento.append(
      criarCardVaga(item, {
        documento,
        melhorVaga: vaga.id === melhorId,
      }),
    );
  });
  jobsContainer.append(fragmento);
  atualizarEstado(jobsStatus, "");
}

export function renderizarMelhorCompatibilidade(resultado, elementos) {
  const { bestMatchContent, bestMatchDetails } = elementos;
  bestMatchContent.replaceChildren();

  if (!resultado) {
    bestMatchContent.append(
      criarElemento(
        "p",
        ["empty-result"],
        "Não encontramos uma vaga compatível com o perfil informado.",
        bestMatchContent.ownerDocument,
      ),
    );
    bestMatchDetails.disabled = true;
    bestMatchDetails.removeAttribute("data-vaga-id");
    return;
  }

  bestMatchContent.append(
    criarCardVaga(resultado, {
      documento: bestMatchContent.ownerDocument,
      melhorVaga: true,
    }),
  );
  bestMatchDetails.disabled = false;
  bestMatchDetails.dataset.vagaId = resultado.vaga.id;
}

export function criarCardCurso(curso, documento = document) {
  const nivel = curso.recomendacao >= 90
    ? "is-highly-recommended"
    : "is-medium-recommended";
  const card = criarElemento("article", ["course-card", nivel], "", documento);
  card.dataset.cursoId = curso.id;

  const cabecalho = criarElemento("header", ["course-card-header"], "", documento);
  const icone = criarElemento(
    "span",
    ["course-icon", `is-${curso.tema}`],
    curso.icone,
    documento,
  );
  icone.setAttribute("aria-hidden", "true");
  const titulos = criarElemento("div", ["course-heading-group"], "", documento);
  titulos.append(
    criarElemento("h3", ["course-title"], curso.titulo, documento),
    criarElemento("p", ["course-description"], curso.descricao, documento),
  );
  cabecalho.append(icone, titulos);

  const metadados = criarElemento("ul", ["course-meta"], "", documento);
  const criarMeta = (simbolo, texto) => {
    const item = criarElemento("li", ["course-meta-item"], "", documento);
    const iconeMeta = criarElemento(
      "span",
      ["course-meta-icon"],
      simbolo,
      documento,
    );
    iconeMeta.setAttribute("aria-hidden", "true");
    item.append(iconeMeta, documento.createTextNode(texto));
    return item;
  };
  metadados.append(
    criarMeta("◉", curso.plataforma),
    criarMeta("◷", curso.duracao),
  );
  const avaliacao = criarElemento("li", ["course-rating"], "", documento);
  const estrela = criarElemento("span", [], "★", documento);
  estrela.setAttribute("aria-hidden", "true");
  avaliacao.append(
    estrela,
    documento.createTextNode(curso.avaliacao.toLocaleString("pt-BR")),
  );
  metadados.append(avaliacao);

  const recomendacao = criarElemento(
    "div",
    ["course-recommendation"],
    "",
    documento,
  );
  recomendacao.append(
    criarElemento(
      "span",
      ["course-recommendation-label"],
      "Recomendação",
      documento,
    ),
    criarElemento(
      "strong",
      ["course-recommendation-value"],
      `${curso.recomendacao}% recomendado`,
      documento,
    ),
  );

  const progresso = criarElemento("progress", ["course-progress"], "", documento);
  progresso.max = 100;
  progresso.value = curso.recomendacao;
  progresso.setAttribute("aria-label", `${curso.recomendacao}% recomendado`);
  card.append(cabecalho, metadados, recomendacao, progresso);
  return card;
}

export function renderizarCursos(cursos, elementos, habilidadePrioritaria = null) {
  const { coursesContainer, coursesStatus } = elementos;
  const documento = coursesContainer.ownerDocument;
  coursesContainer.replaceChildren();
  coursesContainer.setAttribute("aria-busy", "false");

  if (!cursos.length) {
    atualizarEstado(coursesStatus, "Nenhum curso disponível no momento.", "is-empty");
    return;
  }

  const prioridade = String(habilidadePrioritaria ?? "").toLocaleLowerCase("pt-BR");
  const ordenados = [...cursos].sort((cursoA, cursoB) => {
    const aPrioritario = cursoA.habilidade.toLocaleLowerCase("pt-BR") === prioridade;
    const bPrioritario = cursoB.habilidade.toLocaleLowerCase("pt-BR") === prioridade;
    return Number(bPrioritario) - Number(aPrioritario);
  });

  const fragmento = documento.createDocumentFragment();
  ordenados.forEach((curso) => fragmento.append(criarCardCurso(curso, documento)));
  coursesContainer.append(fragmento);
  atualizarEstado(coursesStatus, "");
}

export function exibirErroFormulario(elemento, mensagem = "") {
  elemento.textContent = mensagem;
  elemento.hidden = !mensagem;
}

export function preencherFormulario(perfil, elementos) {
  if (!perfil) return;
  elementos.nome.value = perfil.nome ?? "";
  elementos.area.value = perfil.area ?? "";
  elementos.experiencia.value = String(perfil.experienciaMeses ?? "");
  elementos.habilidades.value = (perfil.habilidades ?? []).join(", ");
}

export function obterElementosUI(documento = document) {
  const ids = [
    "profileForm",
    "nome",
    "area",
    "experiencia",
    "habilidades",
    "formError",
    "bestMatchContent",
    "bestMatchDetails",
    "jobsContainer",
    "jobsStatus",
    "previousJobs",
    "nextJobs",
    "viewAllJobs",
    "coursesContainer",
    "coursesStatus",
  ];

  return ids.reduce((elementos, id) => {
    const elemento = documento.getElementById(id);
    if (!elemento) throw new Error(`Elemento obrigatório não encontrado: #${id}`);
    elementos[id] = elemento;
    return elementos;
  }, {});
}
