# SkillMatch Pro

O **SkillMatch Pro** é uma aplicação web que compara o perfil profissional de uma pessoa com um catálogo de vagas de tecnologia. A aplicação calcula a compatibilidade, identifica habilidades encontradas e faltantes, apresenta a melhor oportunidade e recomenda conteúdos para evolução profissional.

Projeto avaliativo do Módulo 1 do curso de Desenvolvimento Web Front-End, desenvolvido com HTML, CSS e JavaScript puro.

## Funcionalidades

- Cadastro de nome, área, experiência e habilidades do candidato.
- Validação acessível do formulário, sem recarregar a página.
- Cálculo do percentual de compatibilidade com cada vaga.
- Classificação dos resultados em compatibilidade alta, média ou baixa.
- Identificação da melhor vaga e das habilidades encontradas e faltantes.
- Recomendações de estudo de acordo com o resultado.
- Cards de vagas e cursos criados dinamicamente pelo JavaScript.
- Catálogo carregado de arquivos JSON utilizando `fetch` e `async/await`.
- Tratamento dos estados de carregamento, lista vazia e erro.
- Perfil e preferência de tema armazenados no `localStorage`.
- Tema claro/escuro persistente.
- Menu mobile acessível e layout responsivo.
- Navegação por teclado, foco visível e regiões com `aria-live`.

## Tecnologias e técnicas

- HTML5 semântico e SEO on-page.
- CSS3 externo, Flexbox, media queries e unidades fluidas.
- JavaScript moderno sem frameworks.
- Módulos ES com `import` e `export`.
- Manipulação do DOM com `createElement` e `classList`.
- Eventos com `addEventListener` e `preventDefault`.
- Métodos de array como `map`, `filter`, `reduce`, `find` e `flatMap`.
- Programação orientada a objetos, herança e uso de `this`.
- Callback e closure.
- Promises, `fetch`, `async/await` e tratamento de erros.
- Persistência com `localStorage` e JSON.
- Git e GitHub com branches e commits descritivos.

## Estrutura do projeto

```text
skillmatch-pro/
├── index.html
├── README.md
├── package.json
└── assets/
    ├── dados/
    │   ├── cursos.json
    │   └── vagas.json
    ├── img/
    ├── scripts/
    │   ├── dados.js
    │   ├── main.js
    │   ├── motor.js
    │   └── ui.js
    └── styles/
        └── style.css
```

## Arquitetura JavaScript

- `dados.js`: carrega os arquivos JSON e controla a persistência do perfil e do tema.
- `motor.js`: contém as regras de compatibilidade, classificação, recomendação e as classes do domínio.
- `ui.js`: cria e atualiza os elementos visuais da aplicação.
- `main.js`: coordena os módulos, eventos, formulários e o fluxo principal.

### Programação orientada a objetos

A classe `Vaga` possui construtor, atributos e métodos que utilizam `this`. A classe `VagaFrontEnd` herda de `Vaga`, acrescenta a propriedade `stack` e sobrescreve `obterRotulo()`. A especialização permite identificar vagas de Front-End sem duplicar as regras comuns das demais vagas.

### Callback e closure

`analisarPerfil` recebe uma função de callback executada ao concluir a análise. A função `criarContadorAnalises` cria uma closure que preserva a quantidade de análises realizadas durante a sessão.

### Escopo e variáveis

O projeto prioriza `const` para referências que não são reatribuídas. Variáveis locais mutáveis são mantidas no menor escopo possível. A closure do contador demonstra como uma variável local continua protegida e disponível entre chamadas.

## Como executar

O projeto utiliza módulos ES e `fetch`, por isso deve ser executado por um servidor local. Não abra o `index.html` diretamente com `file://`.

1. Clone o repositório:

```bash
git clone https://github.com/alexandredevsc/skillmatch-pro.git
```

2. Entre na pasta:

```bash
cd skillmatch-pro
```

3. Abra a pasta no Visual Studio Code.
4. Execute o `index.html` com a extensão **Live Server**.
5. Acesse o endereço exibido pelo Live Server, normalmente `http://127.0.0.1:5500`.

Para verificar a sintaxe dos módulos JavaScript:

```bash
npm run check
```

## Como utilizar

1. Acesse a seção **Seu perfil**.
2. Informe nome, área, experiência e habilidades separadas por vírgulas.
3. Selecione **Analisar compatibilidade**.
4. Confira a melhor vaga, os percentuais das oportunidades e os cursos recomendados.
5. Recarregue a página para confirmar que o perfil foi preservado.

## Acessibilidade e responsividade

A página utiliza landmarks semânticos, um único `h1`, labels associados aos campos, textos alternativos, foco visível, atalho para o conteúdo principal e mensagens acessíveis. O layout foi construído com Flexbox e breakpoints para desktop, tablet e celular, sem utilizar CSS Grid como sistema de layout.

## Versionamento

O desenvolvimento utiliza a branch `develop` para integração e feature branches para cada etapa, incluindo estrutura, HTML semântico, seções de CSS e JavaScript. Os commits seguem mensagens curtas e descritivas.

Repositório: [github.com/alexandredevsc/skillmatch-pro](https://github.com/alexandredevsc/skillmatch-pro)

## Organização do projeto

- Quadro Kanban/Trello: **[adicionar link público antes da entrega]**
- Aplicação publicada: **[adicionar link do GitHub Pages após publicar]**
- Vídeo de apresentação: **[adicionar link público ou não listado antes da entrega]**

## Uso de inteligência artificial

A IA foi utilizada como ferramenta de apoio para criação e revisão visual, geração de imagens e sugestões de acessibilidade e responsividade. Todo o resultado foi adaptado ao escopo do Módulo 1: HTML, CSS e JavaScript puro, sem React, TypeScript, bibliotecas externas, back-end ou ferramentas de build. O código foi revisado e validado com testes de sintaxe e conferência dos requisitos do projeto.

## Melhorias futuras

- Publicar a aplicação no GitHub Pages.
- Adicionar filtros de modalidade, salário e compatibilidade.
- Criar testes automatizados para o motor de compatibilidade.
- Executar auditorias periódicas com Lighthouse.
- Integrar uma API pública de vagas quando houver uma fonte compatível e sem bloqueio de CORS.

## Autor

Desenvolvido por **Alexandre Milton Alves**.
