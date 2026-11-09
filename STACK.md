# TOKEN — Stack de tecnologias

Referência das tecnologias do projeto: o papel de cada uma, a versão usada e como elas se conectam. Serve de base para o tutorial de tecnologias da Sprint 03.

| Pilar | Tecnologia principal | Onde fica |
|-------|----------------------|-----------|
| **Back-end** | Java 21 + Spring Boot 3.5 | `token/` |
| **Front-end** | React 19 + Vite + Tailwind CSS 4 | `frontend/` |
| **Testes** | Vitest (front) · JUnit 5 + MockMvc (back) | `frontend/src/**/*.test.*` · `token/src/test/` |
| **Infraestrutura** | Docker + Docker Compose | `Dockerfile`, `docker-compose.yml` |

> As versões abaixo são as que estão fixadas no `pom.xml`, no `package-lock.json` e nas imagens Docker.

---

## 1. Java (back-end)

| Tecnologia | Versão | Para que serve no TOKEN |
|------------|--------|-------------------------|
| Java (Eclipse Temurin) | 21 | Linguagem do back-end. Records nos DTOs e pattern matching. |
| Spring Boot | 3.5.4 | Base da aplicação: servidor web embutido (Tomcat), configuração automática e injeção de dependências. |
| Spring Web MVC | 6.2 | API REST (`/api/**`) com controllers anotados e tratamento global de erros (`ApiExceptionHandler`). |
| Spring Data JPA + Hibernate | 3.5 / 6.6 | Camada de persistência: os repositórios fazem o papel de DAO, e o ORM mapeia as entidades. Herança `JOINED` (Usuario → UsuarioPessoa → Aluno/Professor) e `@Version` para concorrência otimista. |
| H2 Database | 2.3 | Banco relacional gravado em arquivo (`./data/tokendb`), com console web em `/h2-console`. |
| Bean Validation (Hibernate Validator) | 8.0 | Validação dos DTOs (`@NotBlank`, `@Email`, `@CPF`, `@CNPJ`...). Os erros chegam ao front como `{ erro, campos }`. |
| Spring Mail | 3.5 | E-mails de moedas recebidas e de cupom. O envio é assíncrono (`@Async`) e acontece após o commit (`@TransactionalEventListener`). |
| Spring Security Crypto | 6.5 | Apenas o **BCrypt**, para o hash das senhas. A autenticação é por sessão HTTP com um interceptor próprio (`@PerfilPermitido`). |
| Maven | 3.9.9 | Build e dependências do back-end. |

**Organização (MVC em camadas):** `controller` → `service` → `model` (regras de domínio nas entidades) → `repository`. A documentação completa dos pacotes está no [README](README.md#arquitetura-mvc-em-camadas).

---

## 2. React (front-end)

| Tecnologia | Versão | Para que serve no TOKEN |
|------------|--------|-------------------------|
| React | 19.3 | Interface em componentes (SPA). É a camada **View** do MVC. |
| React Router | 7.18 | Rotas por perfil (`/aluno/*`, `/professor/*`, `/empresa/*`) com proteção de rota que espelha o `@PerfilPermitido` do back-end. |
| Vite | 6.4 | Servidor de desenvolvimento com hot reload e build de produção. Em desenvolvimento, faz proxy de `/api` para o Spring Boot. |
| Tailwind CSS | 4.3 | Estilização por classes utilitárias. Os tokens visuais (cores `brand` e `coin`, sombras, animações) ficam em `src/index.css` (`@theme`). |
| lucide-react | 0.468 | Ícones SVG. |
| JavaScript (ES2022, JSX) | — | Linguagem do front-end. |

**Estrutura de `frontend/src`:**

```
lib/          → cliente da API (fetch + sessão por cookie), formatação, CPF/CNPJ, indicadores dos painéis
context/      → AuthContext (usuário da sessão) e ToastContext (notificações)
hooks/        → useApi (carregamento/erro) e useFormulario (validação + erros da API por campo)
components/   → Layout, rotas protegidas, UI básica (botões, campos, modal...), formulários, gráfico
pages/        → publico/ (login, cadastros), aluno/, professor/, empresa/ e ExtratoPage (compartilhada)
test/         → setup do Vitest, mock da API e dados de exemplo no formato dos DTOs
```

**Integração com o back-end:** em produção, o build do React vai para dentro do jar do Spring Boot (`classpath:/static`). O front e a API ficam na mesma origem, então o cookie de sessão funciona sem CORS. As rotas do React Router (ex.: `/aluno/extrato`) devolvem o `index.html` (`WebConfig`).

---

## 3. Docker (infraestrutura)

| Serviço (`docker-compose.yml`) | Imagem | Função |
|--------------------------------|--------|--------|
| `app` | build do `Dockerfile` (multi-stage) | Aplicação completa em http://localhost:8080 |
| `mailpit` | `axllent/mailpit:v1.21.8` | Servidor SMTP de teste. Os e-mails aparecem em http://localhost:8025 |
| `frontend-dev` *(perfil `dev`)* | `node:22-alpine` | Vite com hot reload em http://localhost:5173 |
| `testes` *(perfil `testes`)* | `maven:3.9.9-eclipse-temurin-21` | Testes do back-end |
| `testes-front` *(perfil `testes`)* | `node:22-alpine` | Testes do front-end |

**Etapas do `Dockerfile`:**
1. `node:22-alpine`: `npm ci` e `npm run build` (React).
2. `maven:3.9.9-eclipse-temurin-21`: copia o `dist/` do React para `src/main/resources/static` e gera o jar.
3. `eclipse-temurin:21-jre`: imagem final, só com o JRE e o jar.

Nenhuma linguagem precisa estar instalada na máquina, só o **Docker Desktop**.

```bash
docker compose up --build                 # sobe tudo (app + Mailpit)
docker compose --profile dev up --build   # + front com hot reload (porta 5173)
docker compose run --rm testes            # testes do back-end
docker compose run --rm testes-front      # testes do front-end
docker compose down -v                    # para e apaga o banco (volta aos dados de demonstração)
```

---

## 4. Vitest (testes)

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Vitest | 3.2 | Executor de testes do front-end. Usa a mesma configuração do Vite (`vite.config.js` → `test`). |
| Testing Library (React, DOM, user-event, jest-dom) | 16.3 / 10.4 / 14.6 / 6.9 | Testa as telas como o usuário usa: busca por papel e rótulo acessível, cliques e digitação. |
| jsdom | 26.1 | DOM simulado (navegador) para os testes. |
| @vitest/coverage-v8 | 3.2 | Cobertura de código (`npm run test:coverage`). |
| JUnit 5 + MockMvc *(back-end)* | Spring Boot 3.5 | Testes de integração da API com banco H2 em memória e testes de unidade do modelo. |

**O que os testes do front cobrem:**
- **Funções puras** (`lib/*.test.js`): formatação, máscaras e validação de CPF/CNPJ, indicadores dos painéis, cliente da API (erros, 204, 401).
- **Fluxos completos** (`pages/**/*.test.jsx`): a aplicação inteira é renderizada com as rotas reais e o `fetch` simulado (`test/utils.jsx` → `mockApi`). Os fluxos testados são:
  - login, logout e proteção de rotas por perfil;
  - cadastro de aluno, incluindo erro de campo vindo da API;
  - catálogo, resgate e cupom gerado;
  - extrato com filtros;
  - envio de moedas e suas validações;
  - CRUD de vantagens com upload de foto;
  - conferência e validação de cupom pela empresa;
  - indicadores dos três painéis.

**Convenções:**
- O teste fica ao lado do arquivo testado (`Componente.jsx` → `Componente.test.jsx`).
- Os dados de exemplo seguem exatamente o formato dos DTOs Java (`test/dados.js`).
- As consultas usam papéis e rótulos acessíveis (`getByRole`, `getByLabelText`), o que também garante a acessibilidade das telas.

```bash
docker compose run --rm testes-front                                       # roda uma vez
docker compose run --rm testes-front sh -c "npm ci && npm run test:coverage"  # com cobertura
```
