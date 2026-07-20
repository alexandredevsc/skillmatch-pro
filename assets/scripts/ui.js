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

  const documento = bestMatchContent.ownerDocument;
  const { vaga } = resultado;
  const painel = criarElemento("div", ["match-result"], "", documento);
  const resumo = criarElemento("div", ["match-score-panel"], "", documento);
  const circulo = criarElemento("div", ["match-score-circle"], "", documento);
  circulo.style.setProperty("--match-value", `${resultado.percentual * 3.6}deg`);
  circulo.setAttribute(
    "aria-label",
    `${resultado.percentual}% de compatibilidade`,
  );
  circulo.append(
    criarElemento(
      "strong",
      ["match-score-value"],
      `${resultado.percentual}%`,
      documento,
    ),
  );
  resumo.append(
    circulo,
    criarElemento("span", ["match-score-label"], "Compatibilidade", documento),
    criarElemento(
      "strong",
      ["match-score-classification"],
      resultado.classificacao,
      documento,
    ),
  );

  const conteudo = criarElemento("div", ["match-result-content"], "", documento);
  const cabecalho = criarElemento("header", ["match-company-header"], "", documento);
  const logo = criarElemento("span", ["job-company-logo", "is-blue"], vaga.sigla, documento);
  logo.setAttribute("aria-hidden", "true");
  const titulos = criarElemento("div", ["match-company-titles"], "", documento);
  titulos.append(
    criarElemento("p", ["match-company-name"], vaga.empresa, documento),
    criarElemento("h3", ["match-company-role"], vaga.cargo, documento),
  );
  cabecalho.append(
    logo,
    titulos,
    criarElemento("span", ["job-contract-badge"], vaga.contrato, documento),
  );

  const detalhes = criarElemento("ul", ["job-details"], "", documento);
  detalhes.append(
    criarDetalhe("⌖", vaga.localizacao, documento),
    criarDetalhe("◷", vaga.modalidade, documento),
    criarDetalhe("$", formatarSalario(vaga.salario), documento),
  );
  const habilidades = criarElemento("div", ["match-skills"], "", documento);
  if (resultado.encontradas.length) {
    habilidades.append(
      criarGrupoHabilidades(
        "Habilidades que você possui",
        resultado.encontradas,
        "is-matched",
        documento,
      ),
    );
  }
  if (resultado.faltantes.length) {
    habilidades.append(
      criarGrupoHabilidades(
        "Habilidades que pode desenvolver",
        resultado.faltantes,
        "is-missing",
        documento,
      ),
    );
  }
  conteudo.append(cabecalho, detalhes, habilidades);
  painel.append(resumo, conteudo);
  bestMatchContent.append(painel);
  bestMatchDetails.disabled = false;
  bestMatchDetails.dataset.vagaId = vaga.id;
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

export function prepararPainelHero(documento = document) {
  const heroVisual = documento.querySelector(".hero-visual");
  if (!heroVisual) return;

  const painelExistente = heroVisual.querySelector(".hero-dashboard-live");
  if (painelExistente && !painelExistente.classList.contains("is-welcome")) {
    return;
  }

  const painel = painelExistente
    ?? criarElemento("div", ["hero-dashboard-live"], "", documento);
  painel.replaceChildren();
  painel.classList.remove("is-welcome");
  painel.setAttribute("aria-live", "polite");
  painel.setAttribute("aria-label", "Resultado atual da análise");

  const saudacao = criarElemento("div", ["hero-live-welcome"], "", documento);
  saudacao.append(
    criarElemento("span", [], "Olá!", documento),
    criarElemento("strong", ["hero-live-name"], "Seu resultado está pronto", documento),
    criarElemento("small", [], "Veja sua melhor oportunidade", documento),
  );

  const texto = criarElemento("div", ["hero-dashboard-copy"], "", documento);
  texto.append(
    criarElemento("span", [], "Compatibilidade", documento),
    criarElemento("strong", ["hero-live-percent"], "96%", documento),
    criarElemento("small", ["hero-live-points"], "De 100 pontos", documento),
    criarElemento("strong", ["hero-live-job"], "Sua vaga ideal", documento),
  );

  const barras = criarElemento("div", ["hero-live-bars"], "", documento);
  [42, 58, 72, 88, 65].forEach((altura) => {
    const barra = criarElemento("span", [], "", documento);
    barra.style.height = `${altura}%`;
    barras.append(barra);
  });
  texto.append(barras);

  const indicador = criarElemento("div", ["hero-live-gauge"], "", documento);
  indicador.style.setProperty("--hero-match", "345.6deg");
  indicador.append(
    criarElemento("span", ["hero-live-check"], "✓", documento),
    criarElemento("strong", ["hero-live-level"], "Excelente", documento),
  );
  const recomendacao = criarElemento(
    "div",
    ["hero-live-recommendation"],
    "",
    documento,
  );
  recomendacao.append(
    criarElemento(
      "span",
      ["hero-live-recommendation-title"],
      "Recomendações para evoluir ainda mais",
      documento,
    ),
    criarElemento("div", ["hero-live-recommendation-list"], "", documento),
  );
  painel.append(saudacao, texto, indicador, recomendacao);
  if (!painelExistente) heroVisual.append(painel);
}

export function restaurarPainelHero(documento = document, catalogo = []) {
  prepararPainelHero(documento);
  const painel = documento.querySelector(".hero-dashboard-live");
  if (!painel) return;

  painel.replaceChildren(
    criarElemento(
      "strong",
      ["hero-live-reset-title"],
      "Seja bem-vindo",
      documento,
    ),
  );
  painel.classList.add("is-welcome");
  painel.setAttribute("aria-label", "Seja bem-vindo ao SkillMatch Pro");

  const empresas = new Set(catalogo.map((vaga) => vaga.empresa));
  const dadosIniciais = [
    ["Vagas disponíveis", catalogo.length || "—"],
    ["Empresas parceiras", empresas.size || "—"],
    ["Recomendações", "Preencha o perfil"],
  ];

  documento.querySelectorAll(".hero-stat").forEach((card, indice) => {
    const [rotulo, valor] = dadosIniciais[indice];
    card.querySelector("span").textContent = rotulo;
    card.querySelector("strong").textContent = String(valor);
  });
}

export function restaurarResultadoAnalise(elementos) {
  const { bestMatchContent, bestMatchDetails } = elementos;
  const documento = bestMatchContent.ownerDocument;
  bestMatchContent.replaceChildren(
    criarElemento(
      "p",
      ["empty-result"],
      "Preencha seu perfil para descobrir a vaga mais compatível.",
      documento,
    ),
  );
  bestMatchDetails.disabled = true;
  bestMatchDetails.removeAttribute("data-vaga-id");
}

export function atualizarPainelHero(analise, documento = document, cursos = []) {
  const melhor = analise.melhorResultado;
  if (!melhor) return;

  prepararPainelHero(documento);
  const percentual = melhor.percentual;
  const resultadosCompativeis = analise.resultados.filter(
    (resultado) => resultado.percentual >= 50,
  );
  const empresasCompativeis = new Set(
    resultadosCompativeis.map((resultado) => resultado.vaga.empresa),
  );

  const percentualHero = documento.querySelector(".hero-live-percent");
  const pontosHero = documento.querySelector(".hero-live-points");
  const nivelHero = documento.querySelector(".hero-live-level");
  const indicadorHero = documento.querySelector(".hero-live-gauge");
  const nomeHero = documento.querySelector(".hero-live-name");
  const vagaHero = documento.querySelector(".hero-live-job");
  const listaDeRecomendacoes = documento.querySelector(
    ".hero-live-recommendation-list",
  );
  const primeiroNome = analise.perfil.nome.trim().split(/\s+/)[0];
  nomeHero.textContent = `Olá, ${primeiroNome}!`;
  percentualHero.textContent = `${percentual}%`;
  pontosHero.textContent = `${melhor.encontradas.length} de ${melhor.vaga.requisitos.length} requisitos`;
  nivelHero.textContent = melhor.classificacao;
  vagaHero.textContent = `${melhor.vaga.cargo} • ${melhor.vaga.empresa}`;
  listaDeRecomendacoes.replaceChildren();
  cursos.forEach((curso) => {
    const card = criarElemento("span", ["hero-live-course"], "", documento);
    card.append(
      criarElemento("strong", [], curso.habilidade, documento),
      criarElemento("small", [], `${curso.recomendacao}%`, documento),
    );
    listaDeRecomendacoes.append(card);
  });
  indicadorHero.style.setProperty("--hero-match", `${percentual * 3.6}deg`);

  const recomendacoesParaEvoluir = [
    analise.recomendacao.habilidade,
    ...melhor.faltantes,
    ...analise.resultados.flatMap((resultado) => resultado.faltantes),
  ].filter((habilidade, indice, lista) => {
    if (!habilidade) return false;
    const chave = habilidade.toLocaleLowerCase("pt-BR");
    return lista.findIndex((item) =>
      item?.toLocaleLowerCase("pt-BR") === chave
    ) === indice;
  }).slice(0, 3);

  const cursosRecomendados = cursos.map(
    (curso) => `${curso.habilidade} ${curso.recomendacao}%`,
  );
  const listaCompactaDeCursos = cursosRecomendados
    .map((curso) => `• ${curso}`)
    .join("\n");

  const valores = [
    resultadosCompativeis.length,
    empresasCompativeis.size,
    cursosRecomendados.length
      ? listaCompactaDeCursos
      : recomendacoesParaEvoluir.length
        ? recomendacoesParaEvoluir.map((habilidade) => `• ${habilidade}`).join("\n")
      : "Perfil completo",
  ];
  const formatador = new Intl.NumberFormat("pt-BR");
  documento.querySelectorAll(".hero-stat strong").forEach((elemento, indice) => {
    elemento.textContent = typeof valores[indice] === "number"
      ? formatador.format(valores[indice])
      : valores[indice];
  });
  const terceiroRotulo = documento.querySelector(".hero-stat-three span");
  if (terceiroRotulo) terceiroRotulo.textContent = "Recomendações para evoluir";
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
    "clearProfile",
    "formError",
    "bestMatchContent",
    "bestMatchDetails",
    "jobsContainer",
    "jobsStatus",
    "previousJobs",
    "nextJobs",
    "viewAllJobs",
    "viewAllCourses",
    "coursesContainer",
    "coursesStatus",
    "themeToggle",
    "newsletterForm",
    "newsletterEmail",
    "newsletterMessage",
  ];

  return ids.reduce((elementos, id) => {
    const elemento = documento.getElementById(id);
    if (!elemento) throw new Error(`Elemento obrigatório não encontrado: #${id}`);
    elementos[id] = elemento;
    return elementos;
  }, {});
}
