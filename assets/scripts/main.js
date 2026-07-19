import {
  carregarCursos,
  carregarPerfil,
  carregarTema,
  carregarVagas,
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
  prepararPainelHero,
  renderizarCursos,
  renderizarMelhorCompatibilidade,
  renderizarVagas,
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
    jobsContainer.scrollIntoView({ behavior: "smooth", block: "center" });
    jobsContainer.focus({ preventScroll: true });
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
    elementos.coursesContainer.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    elementos.coursesContainer.setAttribute("tabindex", "-1");
    elementos.coursesContainer.focus({ preventScroll: true });
  });
}

function executarAnalise(perfil, catalogo, cursos, elementos) {
  const analise = analisarPerfil(perfil, catalogo, (resultado) => {
    renderizarMelhorCompatibilidade(resultado.melhorResultado, elementos);
    renderizarVagas(resultado.resultados, elementos, {
      melhorId: resultado.melhorResultado?.vaga.id,
    });
    renderizarCursos(cursos, elementos, resultado.recomendacao.habilidade);
    atualizarPainelHero(resultado, elementos.profileForm.ownerDocument);
  });

  atualizarBotoesCarrossel(elementos);
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
}

export async function iniciarAplicacao(documento = document) {
  const elementos = obterElementosUI(documento);
  prepararPainelHero(documento);
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
    renderizarVagas(catalogo, elementos);
    atualizarBotoesCarrossel(elementos);
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
