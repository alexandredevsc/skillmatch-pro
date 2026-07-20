export function normalizarHabilidade(habilidade) {
  return String(habilidade)
    .trim()
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function classificarCompatibilidade(percentual) {
  if (percentual >= 80) {
    return "Alta";
  }

  if (percentual >= 50) {
    return "Média";
  }

  return "Baixa";
}

export class Vaga {
  constructor(dados) {
    this.id = dados.id;
    this.empresa = dados.empresa;
    this.sigla = dados.sigla;
    this.cargo = dados.cargo;
    this.area = dados.area;
    this.senioridade = dados.senioridade;
    this.experienciaMinimaMeses = Number(dados.experienciaMinimaMeses) || 0;
    this.requisitos = [...dados.requisitos];
    this.habilidadesDesejaveis = [...(dados.habilidadesDesejaveis ?? [])];
    this.salario = { ...dados.salario };
    this.modalidade = dados.modalidade;
    this.localizacao = dados.localizacao;
    this.contrato = dados.contrato;
  }

  calcularCompatibilidade(perfil) {
    const habilidadesNormalizadas = new Set(
      perfil.habilidades.map(normalizarHabilidade),
    );

    const encontradas = this.requisitos.filter((requisito) =>
      habilidadesNormalizadas.has(normalizarHabilidade(requisito)),
    );

    const faltantes = this.requisitos.filter(
      (requisito) =>
        !habilidadesNormalizadas.has(normalizarHabilidade(requisito)),
    );

    const percentual = this.requisitos.length
      ? Math.round((encontradas.length / this.requisitos.length) * 100)
      : 0;

    const experienciaMeses = Number(perfil.experienciaMeses) || 0;

    return {
      vaga: this,
      percentual,
      classificacao: classificarCompatibilidade(percentual),
      encontradas,
      faltantes,
      areaCompativel: perfil.area === this.area,
      atendeExperiencia: experienciaMeses >= this.experienciaMinimaMeses,
      distanciaExperiencia: Math.abs(
        experienciaMeses - this.experienciaMinimaMeses,
      ),
    };
  }

  obterRotulo() {
    return `${this.cargo} • ${this.senioridade}`;
  }
}

export class VagaFrontEnd extends Vaga {
  constructor(dados) {
    super(dados);
    this.stack = [...dados.requisitos];
  }

  obterRotulo() {
    return `${super.obterRotulo()} • Stack Front-end`;
  }
}

export function criarVaga(dados) {
  if (dados.area === "front-end") {
    return new VagaFrontEnd(dados);
  }

  return new Vaga(dados);
}

export function criarCatalogo(dadosDasVagas) {
  if (!Array.isArray(dadosDasVagas)) {
    throw new TypeError("O catálogo precisa ser uma lista de vagas.");
  }

  return dadosDasVagas.map(criarVaga);
}

function escolherMelhorResultado(melhorAtual, resultado) {
  if (!melhorAtual || resultado.percentual > melhorAtual.percentual) {
    return resultado;
  }

  if (resultado.percentual < melhorAtual.percentual) {
    return melhorAtual;
  }

  if (resultado.areaCompativel !== melhorAtual.areaCompativel) {
    return resultado.areaCompativel ? resultado : melhorAtual;
  }

  if (resultado.atendeExperiencia !== melhorAtual.atendeExperiencia) {
    return resultado.atendeExperiencia ? resultado : melhorAtual;
  }

  return resultado.distanciaExperiencia < melhorAtual.distanciaExperiencia
    ? resultado
    : melhorAtual;
}

export function encontrarMelhorVaga(resultados) {
  return resultados.reduce(escolherMelhorResultado, null);
}

export function gerarRecomendacao(resultados) {
  const frequencias = resultados
    .flatMap((resultado) => resultado.faltantes)
    .reduce((acumulador, habilidade) => {
      const chave = normalizarHabilidade(habilidade);

      if (!acumulador[chave]) {
        acumulador[chave] = { habilidade, quantidade: 0 };
      }

      acumulador[chave].quantidade += 1;
      return acumulador;
    }, {});

  const prioridades = Object.values(frequencias).sort(
    (a, b) => b.quantidade - a.quantidade,
  );

  if (prioridades.length === 0) {
    return {
      habilidade: null,
      mensagem: "Seu perfil já atende a todos os requisitos analisados.",
    };
  }

  const prioridade = prioridades[0];

  return {
    habilidade: prioridade.habilidade,
    mensagem: `Priorize o estudo de ${prioridade.habilidade} para aumentar sua compatibilidade.`,
  };
}

export function criarContadorAnalises() {
  let total = 0;

  return () => {
    total += 1;
    return total;
  };
}

const contarAnaliseDaSessao = criarContadorAnalises();

export function analisarPerfil(perfil, catalogo, aoConcluir = () => {}) {
  if (!perfil || !Array.isArray(perfil.habilidades)) {
    throw new TypeError("O perfil precisa possuir uma lista de habilidades.");
  }

  if (!Array.isArray(catalogo)) {
    throw new TypeError("O catálogo precisa ser uma lista.");
  }

  const resultados = catalogo.map((vaga) =>
    vaga.calcularCompatibilidade(perfil),
  );

  const analise = {
    perfil,
    resultados,
    melhorResultado: encontrarMelhorVaga(resultados),
    recomendacao: gerarRecomendacao(resultados),
    totalAnalisesSessao: contarAnaliseDaSessao(),
  };

  aoConcluir(analise);
  return analise;
}
