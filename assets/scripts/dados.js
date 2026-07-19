const CAMINHO_VAGAS = "./assets/dados/vagas.json";
const CAMINHO_CURSOS = "./assets/dados/cursos.json";
const CHAVE_PERFIL = "skillmatch-pro:perfil";

/**
 * Carrega o catálogo de vagas usando fetch e async/await.
 * A função de fetch pode ser substituída nos testes.
 */
export async function carregarVagas(fetchFn = fetch) {
  try {
    const resposta = await fetchFn(CAMINHO_VAGAS);

    if (!resposta.ok) {
      throw new Error(`Falha HTTP ${resposta.status}`);
    }

    const vagas = await resposta.json();

    if (!Array.isArray(vagas)) {
      throw new TypeError("O catálogo de vagas precisa ser uma lista.");
    }

    return vagas;
  } catch (erro) {
    const detalhe = erro instanceof Error ? erro.message : "erro desconhecido";

    throw new Error(`Não foi possível carregar as vagas: ${detalhe}`);
  }
}

export async function carregarCursos(fetchFn = fetch) {
  try {
    const resposta = await fetchFn(CAMINHO_CURSOS);

    if (!resposta.ok) {
      throw new Error(`Falha HTTP ${resposta.status}`);
    }

    const cursos = await resposta.json();
    if (!Array.isArray(cursos)) {
      throw new TypeError("O catálogo de cursos precisa ser uma lista.");
    }

    return cursos;
  } catch (erro) {
    const detalhe = erro instanceof Error ? erro.message : "erro desconhecido";
    throw new Error(`Não foi possível carregar os cursos: ${detalhe}`);
  }
}

/**
 * Salva somente dados não sensíveis do perfil no navegador.
 */
export function salvarPerfil(perfil, storage = localStorage) {
  if (!perfil || typeof perfil !== "object" || Array.isArray(perfil)) {
    throw new TypeError("O perfil precisa ser um objeto válido.");
  }

  storage.setItem(CHAVE_PERFIL, JSON.stringify(perfil));
}

/**
 * Recupera o perfil salvo. Retorna null quando ainda não existe perfil
 * ou quando o conteúdo armazenado está corrompido.
 */
export function carregarPerfil(storage = localStorage) {
  const perfilSalvo = storage.getItem(CHAVE_PERFIL);

  if (perfilSalvo === null) {
    return null;
  }

  try {
    const perfil = JSON.parse(perfilSalvo);

    if (!perfil || typeof perfil !== "object" || Array.isArray(perfil)) {
      storage.removeItem(CHAVE_PERFIL);
      return null;
    }

    return perfil;
  } catch {
    storage.removeItem(CHAVE_PERFIL);
    return null;
  }
}

export function removerPerfil(storage = localStorage) {
  storage.removeItem(CHAVE_PERFIL);
}

export { CAMINHO_CURSOS, CAMINHO_VAGAS, CHAVE_PERFIL };
