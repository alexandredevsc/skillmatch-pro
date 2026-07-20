import {
  carregarCursos,
  carregarPerfil,
  carregarTema,
  carregarVagas,
  removerPerfil,
  salvarPerfil,
  salvarTema,
} from "./dados.js";
import { analisarPerfil, criarCatalogo } from "./motor.js";
import {
  atualizarEstado,
  atualizarPainelHero,
  exibirErroFormulario,
  obterElementosUI,
  preencherFormulario,
  renderizarCursos,
  renderizarMelhorCompatibilidade,
  renderizarVagas,
  restaurarPainelHero,
  restaurarResultadoAnalise,
} from "./ui.js";

export function separarHabilidades(valor) {
  return [...new Set(
    String(valor)
      .split(",")
      .map((habilidade) => habilidade.trim())
      .filter(Boolean),
  )];
}

export function criarPerfilDoFormulario(elementos) {
  return {
    nome: elementos.nome.value.trim(),
    area: elementos.area.value,
    experienciaMeses: Number(elementos.experiencia.value),
    habilidades: separarHabilidades(elementos.habilidades.value),
  };
}

export function validarPerfil(perfil) {
  if (perfil.nome.length < 3) {
    return "Informe seu nome completo.";
  }

  if (!perfil.area) {
    return "Selecione sua área de atuação.";
  }

  if (!Number.isFinite(perfil.experienciaMeses) || perfil.experienciaMeses <= 0) {
    return "Selecione seu nível de experiência.";
  }

  if (perfil.habilidades.length === 0) {
    return "Informe pelo menos uma habilidade.";
  }

  return "";
}

function atualizarBotoesCarrossel(elementos) {
  const { jobsContainer, previousJobs, nextJobs } = elementos;
  const limite = jobsContainer.scrollWidth - jobsContainer.clientWidth;
  previousJobs.disabled = jobsContainer.scrollLeft <= 1;
  nextJobs.disabled = limite <= 1 || jobsContainer.scrollLeft >= limite - 1;
}

function deslocamentoDoCarrossel(container) {
  const primeiroCard = container.querySelector(".job-card");
  if (!primeiroCard) return container.clientWidth;

  const estilos = getComputedStyle(container);
  const gap = Number.parseFloat(estilos.columnGap || estilos.gap) || 0;
  return primeiroCard.getBoundingClientRect().width + gap;
}

function atualizarListaRecolhivel({
  container,
  botao,
  seletor,
  expandida = false,
  textoExpandir,
  textoRecolher,
}) {
  const cards = [...container.querySelectorAll(seletor)];
  cards.forEach((card, indice) => {
    card.hidden = !expandida && indice > 0;
  });

  botao.hidden = cards.length <= 1;
  botao.setAttribute("aria-expanded", String(expandida));
  botao.textContent = expandida ? textoRecolher : textoExpandir;
  container.classList.toggle("is-expanded", expandida);

  if (!expandida) container.scrollLeft = 0;
}

function atualizarVisibilidadeVagas(elementos, expandida = false) {
  atualizarListaRecolhivel({
    container: elementos.jobsContainer,
    botao: elementos.viewAllJobs,
    seletor: ".job-card",
    expandida,
    textoExpandir: "Ver todas as vagas",
    textoRecolher: "Mostrar menos vagas",
  });
  atualizarBotoesCarrossel(elementos);
}

function atualizarVisibilidadeCursos(elementos, expandida = false) {
  atualizarListaRecolhivel({
    container: elementos.coursesContainer,
    botao: elementos.viewAllCourses,
    seletor: ".course-card",
    expandida,
    textoExpandir: "Ver todos os cursos",
    textoRecolher: "Mostrar menos cursos",
  });
}

function configurarCarrossel(elementos) {
  const { jobsContainer, previousJobs, nextJobs, viewAllJobs } = elementos;

  previousJobs.addEventListener("click", () => {
    jobsContainer.scrollBy({
      left: -deslocamentoDoCarrossel(jobsContainer),
      behavior: "smooth",
    });
  });

  nextJobs.addEventListener("click", () => {
    jobsContainer.scrollBy({
      left: deslocamentoDoCarrossel(jobsContainer),
      behavior: "smooth",
    });
  });

  viewAllJobs.addEventListener("click", () => {
    const expandida = viewAllJobs.getAttribute("aria-expanded") !== "true";
    atualizarVisibilidadeVagas(elementos, expandida);
    jobsContainer.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  jobsContainer.addEventListener("scroll", () => {
    requestAnimationFrame(() => atualizarBotoesCarrossel(elementos));
  });
  window.addEventListener("resize", () => atualizarBotoesCarrossel(elementos));
}

function configurarDetalhes(elementos) {
  elementos.bestMatchDetails.addEventListener("click", () => {
    const id = elementos.bestMatchDetails.dataset.vagaId;
    if (!id) return;

    const card = [...elementos.jobsContainer.querySelectorAll(".job-card")]
      .find((item) => item.dataset.vagaId === id);

    if (!card) return;
    card.setAttribute("tabindex", "-1");
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.focus({ preventScroll: true });
  });
}

function aplicarTema(tema, elementos) {
  const documento = elementos.themeToggle.ownerDocument;
  const escuro = tema === "dark";
  documento.documentElement.dataset.theme = tema;
  elementos.themeToggle.setAttribute("aria-pressed", String(escuro));
  elementos.themeToggle.setAttribute(
    "aria-label",
    escuro ? "Ativar tema claro" : "Ativar tema escuro",
  );
  const corDoNavegador = documento.querySelector('meta[name="theme-color"]');
  if (corDoNavegador) corDoNavegador.content = escuro ? "#050816" : "#f7f9fd";
}

function configurarTema(elementos) {
  aplicarTema(carregarTema(), elementos);
  elementos.themeToggle.addEventListener("click", () => {
    const temaAtual =
      elementos.themeToggle.ownerDocument.documentElement.dataset.theme;
    const novoTema = temaAtual === "dark" ? "light" : "dark";
    aplicarTema(novoTema, elementos);
    salvarTema(novoTema);
  });
}

function configurarMenuMobile(documento) {
  const botao = documento.getElementById("navToggle");
  const menu = documento.getElementById("navMenu");
  if (!botao || !menu) return;

  const fecharMenu = () => {
    menu.classList.remove("is-open");
    botao.setAttribute("aria-expanded", "false");
    botao.setAttribute("aria-label", "Abrir menu principal");
  };

  botao.addEventListener("click", () => {
    const aberto = botao.getAttribute("aria-expanded") === "true";
    menu.classList.toggle("is-open", !aberto);
    botao.setAttribute("aria-expanded", String(!aberto));
    botao.setAttribute(
      "aria-label",
      aberto ? "Abrir menu principal" : "Fechar menu principal",
    );
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", fecharMenu);
  });

  documento.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") fecharMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 832) fecharMenu();
  });
}

function configurarNewsletter(elementos) {
  elementos.newsletterForm.addEventListener("submit", (evento) => {
    evento.preventDefault();
    elementos.newsletterMessage.classList.remove("is-error");

    if (!elementos.newsletterEmail.validity.valid) {
      elementos.newsletterMessage.textContent = "Informe um e-mail válido.";
      elementos.newsletterMessage.classList.add("is-error");
      elementos.newsletterEmail.focus();
      return;
    }

    elementos.newsletterMessage.textContent =
      "Cadastro realizado! Você receberá novas oportunidades.";
    elementos.newsletterForm.reset();
  });
}

function configurarCursos(elementos) {
  elementos.viewAllCourses.addEventListener("click", () => {
    const expandida =
      elementos.viewAllCourses.getAttribute("aria-expanded") !== "true";
    atualizarVisibilidadeCursos(elementos, expandida);
    elementos.coursesContainer.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  });
}

function executarAnalise(perfil, catalogo, cursos, elementos) {
  const analise = analisarPerfil(perfil, catalogo, (resultado) => {
    renderizarMelhorCompatibilidade(resultado.melhorResultado, elementos);
    renderizarVagas(resultado.resultados, elementos, {
      melhorId: resultado.melhorResultado?.vaga.id,
    });
    renderizarCursos(cursos, elementos, resultado.recomendacao.habilidade);
    atualizarVisibilidadeVagas(elementos);
    atualizarVisibilidadeCursos(elementos);
    atualizarPainelHero(resultado, elementos.profileForm.ownerDocument, cursos);
  });

  return analise;
}

function configurarFormulario(catalogo, cursos, elementos) {
  elementos.profileForm.addEventListener("input", () => {
    exibirErroFormulario(elementos.formError);
    salvarPerfil(criarPerfilDoFormulario(elementos));
  });

  elementos.profileForm.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const perfil = criarPerfilDoFormulario(elementos);
    const erro = validarPerfil(perfil);

    if (erro) {
      exibirErroFormulario(elementos.formError, erro);
      return;
    }

    exibirErroFormulario(elementos.formError);
    salvarPerfil(perfil);
    executarAnalise(perfil, catalogo, cursos, elementos);
    elementos.bestMatchContent.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  });

  elementos.clearProfile.addEventListener("click", () => {
    elementos.profileForm.reset();
    removerPerfil();
    exibirErroFormulario(elementos.formError);
    restaurarResultadoAnalise(elementos);
    restaurarPainelHero(
      elementos.profileForm.ownerDocument,
      catalogo,
    );
    renderizarVagas(catalogo, elementos);
    atualizarVisibilidadeVagas(elementos);
    elementos.coursesContainer.replaceChildren();
    atualizarVisibilidadeCursos(elementos);
    atualizarEstado(
      elementos.coursesStatus,
      "Preencha seu perfil para receber recomendações de estudo.",
      "is-waiting",
    );
    elementos.nome.focus();
  });
}

export async function iniciarAplicacao(documento = document) {
  const elementos = obterElementosUI(documento);
  restaurarPainelHero(documento);
  configurarMenuMobile(documento);
  configurarTema(elementos);
  configurarCarrossel(elementos);
  configurarDetalhes(elementos);
  configurarNewsletter(elementos);
  configurarCursos(elementos);

  try {
    const [dadosDasVagas, cursos] = await Promise.all([
      carregarVagas(),
      carregarCursos(),
    ]);
    const catalogo = criarCatalogo(dadosDasVagas);
    restaurarPainelHero(documento, catalogo);
    renderizarVagas(catalogo, elementos);
    atualizarVisibilidadeVagas(elementos);
    configurarFormulario(catalogo, cursos, elementos);

    const perfilSalvo = carregarPerfil();
    if (perfilSalvo) {
      preencherFormulario(perfilSalvo, elementos);
      const erro = validarPerfil(perfilSalvo);
      if (!erro) executarAnalise(perfilSalvo, catalogo, cursos, elementos);
    }

    return { catalogo, cursos, elementos };
  } catch (erro) {
    elementos.jobsContainer.setAttribute("aria-busy", "false");
    atualizarEstado(
      elementos.jobsStatus,
      erro instanceof Error ? erro.message : "Não foi possível iniciar a aplicação.",
      "is-error",
    );
    console.error(erro);
    return null;
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => iniciarAplicacao());
}
