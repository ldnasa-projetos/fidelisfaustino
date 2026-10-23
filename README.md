# Fidelis & Faustino

Front-end institucional em avaliação. HTML5, Tailwind CSS compilado localmente e JavaScript nativo. Direção visual com Lora, Inter, vinho e tons neutros.

## Executar localmente

Na pasta do projeto, execute:

```sh
python -m http.server 8797 --bind 127.0.0.1
```

Abra http://127.0.0.1:8797/ . Não é necessário instalar dependências para visualizar o site.

## Páginas

- `index.html`: homepage.
- `escritorio.html`: apresentação do escritório.
- `areas.html`: áreas de atuação com seleção e FAQs.
- `virada-de-bandeira.html`: landing page do serviço.
- `blog.html`: destaque e listagem com filtros por categoria.
- `artigo-galonagem.html`: detalhe demonstrativo com compartilhamento.
- `contato.html`: formulário demonstrativo e Google Maps interativo.

## Estilos

Tokens em `design_system/tokens.css`; estilos compartilhados em `css/custom.css` e composições específicas em `css/`. Para recompilar o Tailwind, com Node.js instalado:

```powershell
pwsh -File scripts/build-css.ps1
```

O comando usa Tailwind CSS 3.4.17. Os arquivos compilados já estão no repositório.

## Estado da prévia

O formulário demonstra validação e feedback, sem enviar mensagens. Textos, indicadores, canais e imagens continuam sujeitos à revisão final. Parte das imagens é ilustrativa, gerada por IA ou utilizada como placeholder. Os demais artigos apontam para o site atual. O Google Maps depende de conexão à internet.

Briefing, pesquisas, documentos internos, referências e capturas de avaliação permanecem fora deste repositório público. As licenças das fontes acompanham os arquivos em `assets/fonts/`.

Projeto por Londrina S/A (LDNA S/A).
