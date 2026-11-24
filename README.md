# TOKEN — Sistema de Moeda Estudantil

> **T**alent & **O**utstanding **K**nowledge **E**ducational **N**etwork

O **TOKEN** (*Talent & Outstanding Knowledge Educational Network*) permite que professores reconheçam o mérito dos alunos enviando moedas virtuais. Os alunos trocam essas moedas por vantagens (descontos e produtos) cadastradas por empresas parceiras e recebem um cupom com código único por e-mail para usar na troca presencial.

---

## Aplicação online

| | Endereço |
|---|---|
| Aplicação (front-end no Vercel) | https://token-wpzt.onrender.com/login |


> O back-end usa o plano gratuito do Render, que hiberna após 15 minutos sem uso. O primeiro acesso depois disso leva cerca de 1 minuto. Como implantar: [Implantação na nuvem](#implantação-na-nuvem-vercel--render).

---

## Modelagem do Sistema

Os diagramas da **Release 1** (classes, componentes, ER e casos de uso) foram feitos no draw.io. Os da **Release 2** (sequência, visão geral de interação e implantação) estão em PlantUML na pasta [`Diagramas/Release2`](Diagramas/Release2): o `.puml` é o fonte editável e o `.png` é a imagem gerada. Depois de editar um `.puml`, gere as imagens de novo com `docker compose run --rm diagramas`.

### Release 1

#### Diagrama de Classes
![Diagrama de Classes](Diagramas/DiagramaDeClassesTOKEN.png)

#### Diagrama de Componentes
![Diagrama de Componentes](Diagramas/DiagramaDeComponentesTOKEN.png)

#### Modelo Entidade-Relacionamento (ER)
![Diagrama ER](Diagramas/DiagramaER_TOKEN.png)

#### Diagrama de Casos de Uso
Consulte o arquivo [Diagrama_Casos_de_Uso.drawio.pdf](Diagramas/Diagrama_Casos_de_Uso.drawio.pdf).

### Release 2

#### Diagrama de Visão Geral de Interação

Mostra a ordem em que as interações acontecem: cadastro (se o usuário ainda não tem conta), login e as ações disponíveis para cada perfil. Cada nó **ref** aponta para um diagrama de sequência abaixo.

![Diagrama de Visão Geral de Interação](Diagramas/Release2/VisaoGeralInteracao/VisaoGeralInteracao.png)

#### Diagramas de Sequência

Os participantes são as classes reais do código, agrupadas pelas camadas do MVC: View (React), Controller, Service, Model e Repository.

| Diagrama | Caso de uso | História |
|----------|-------------|----------|
| [SD01 — Realizar login](#sd01--realizar-login) | Realizar login (e crédito semestral do professor) | US01 |
| [SD02 — Cadastrar aluno](#sd02--cadastrar-aluno) | Realizar cadastro (aluno) | US02 |
| [SD03 — Cadastrar empresa parceira](#sd03--cadastrar-empresa-parceira) | Realizar cadastro (empresa) | US03 |
| [SD04 — Cadastrar vantagem](#sd04--cadastrar-vantagem) | Cadastrar vantagens | US04 |
| [SD05 — Enviar moedas](#sd05--enviar-moedas) | Distribuir moedas aos alunos · Receber moedas · Receber notificações | US05 |
| [SD06 — Consultar extrato](#sd06--consultar-extrato) | Consultar saldo · Visualizar transações | US06 |
| [SD07 — Resgatar vantagem](#sd07--resgatar-vantagem) | Resgatar vantagens · Enviar notificações à empresa parceira | US07 |
| [SD08 — Conferir e utilizar cupom](#sd08--conferir-e-utilizar-cupom) | Conferir cupom (empresa) | US07 |
| [SD09 — Gerenciar o próprio cadastro](#sd09--gerenciar-o-próprio-cadastro) | Editar e excluir cadastro (aluno e empresa) | US02 · US03 |

##### SD01 — Realizar login
![SD01 — Realizar login](Diagramas/Release2/Sequencia/SD01_RealizarLogin.png)

##### SD02 — Cadastrar aluno
![SD02 — Cadastrar aluno](Diagramas/Release2/Sequencia/SD02_CadastrarAluno.png)

##### SD03 — Cadastrar empresa parceira
![SD03 — Cadastrar empresa parceira](Diagramas/Release2/Sequencia/SD03_CadastrarEmpresa.png)

##### SD04 — Cadastrar vantagem
![SD04 — Cadastrar vantagem](Diagramas/Release2/Sequencia/SD04_CadastrarVantagem.png)

##### SD05 — Enviar moedas
![SD05 — Enviar moedas](Diagramas/Release2/Sequencia/SD05_EnviarMoedas.png)

##### SD06 — Consultar extrato
![SD06 — Consultar extrato](Diagramas/Release2/Sequencia/SD06_ConsultarExtrato.png)

##### SD07 — Resgatar vantagem
![SD07 — Resgatar vantagem](Diagramas/Release2/Sequencia/SD07_ResgatarVantagem.png)

##### SD08 — Conferir e utilizar cupom
![SD08 — Conferir e utilizar cupom](Diagramas/Release2/Sequencia/SD08_ConferirCupom.png)

##### SD09 — Gerenciar o próprio cadastro
![SD09 — Gerenciar o próprio cadastro](Diagramas/Release2/Sequencia/SD09_GerenciarCadastro.png)

#### Diagrama de Implantação

![Diagrama de Implantação](Diagramas/Release2/Implantacao/DiagramaImplantacao.png)

| Nó | O que roda | Comunicação |
|----|------------|-------------|
| Navegador do usuário | SPA React (build do Vite) | HTTPS com o domínio do Vercel |
| **Vercel** (CDN) | Arquivos estáticos de `frontend/dist`; rewrite de `/api/**` para o Render (`frontend/vercel.json`) | HTTPS (proxy reverso) até o Render |
| **Render** – Web Service | Contêiner Docker com o `token-1.0.0.jar` (Spring Boot, perfil `prod`) | JDBC até o PostgreSQL; SMTP até o servidor de e-mail |
| **Render** – PostgreSQL 16 | Banco `tokendb` (tabelas criadas pelo Hibernate) | Rede privada do Render |
| Servidor SMTP externo | Mailtrap ou Brevo (opcional) | SMTP porta 2525 com STARTTLS |
| GitHub | Repositório | Cada push na `main` dispara o deploy no Vercel e no Render |

---

## Histórias de Usuário

| ID | História | Status |
|----|----------|--------|
| US01 | **Autenticação.** Como usuário (aluno, professor ou empresa parceira), quero fazer login com usuário e senha para acessar as funcionalidades do meu perfil com segurança. | ✅ |
| US02 | **CRUD de Aluno.** Como aluno, quero gerenciar meu cadastro (dados pessoais, instituição de ensino e curso) para participar do sistema de mérito estudantil. | ✅ |
| US03 | **CRUD de Empresa Parceira.** Como empresa parceira, quero fazer e gerenciar meu cadastro no sistema para ofertar produtos e descontos aos estudantes. | ✅ |
| US04 | **Cadastro de Vantagens.** Como empresa parceira, quero cadastrar vantagens com nome, descrição, foto, estoque e custo em moedas para disponibilizá-las no catálogo de trocas. | ✅ |
| US05 | **Envio de Moedas.** Como professor, quero enviar moedas do meu saldo acumulado (1.000 por semestre) a um aluno, informando o motivo do reconhecimento, para premiar seu mérito e notificá-lo por e-mail. | ✅ |
| US06 | **Consulta de Extrato.** Como aluno ou professor, quero consultar meu saldo atual e o histórico de transações para acompanhar minhas movimentações de moedas. | ✅ |
| US07 | **Resgate de Vantagem.** Como aluno, quero trocar minhas moedas por uma vantagem disponível e receber por e-mail um cupom com código único (também enviado à empresa parceira) para usá-lo presencialmente. | ✅ |

**Release 2:** todos os casos de uso do diagrama estão implementados. Os casos que surgiram durante o desenvolvimento (conferir/utilizar cupom pela empresa e editar/excluir o próprio cadastro) também estão prontos. A tabela dos [diagramas de sequência](#diagramas-de-sequência) mostra qual diagrama detalha cada caso de uso.

---

## Tecnologias

Detalhes, versões e o papel de cada tecnologia: **[STACK.md](STACK.md)**.

| Camada | Tecnologia |
|--------|-----------|
| View (front-end) | React 19 + React Router, Vite, Tailwind CSS 4 (SPA servida pelo Vercel na nuvem; no Docker local, empacotada dentro do jar do Spring Boot) |
| Testes | Vitest + Testing Library (front-end), JUnit 5 + MockMvc (back-end) |
| Controller | Spring Web MVC (API REST), Bean Validation (inclusive `@CPF` e `@CNPJ`) |
| Model / Service | Java 21, Spring Boot 3.5 |
| Persistência | Spring Data JPA + Hibernate (ORM), padrão Repository/DAO; H2 em arquivo (local) e PostgreSQL 16 (nuvem) |
| Segurança | Sessão HTTP, senhas com hash **BCrypt**, controle de acesso por perfil (`@PerfilPermitido`) |
| E-mail | Spring Mail (SMTP), envio assíncrono após o commit da transação; Mailpit no ambiente Docker, Mailtrap/Brevo na nuvem |
| Infraestrutura | Docker e Docker Compose (local); **Vercel** (front-end) + **Render** (back-end e PostgreSQL) na nuvem |
| Modelagem | draw.io (Release 1); PlantUML (Release 2: sequência, visão geral de interação e implantação) |

## Arquitetura (MVC em camadas)

```
token/src/main/java/com/management
├── controller/   → Controllers REST (C do MVC) + tratamento global de erros
├── auth/         → Interceptor de autenticação, @Publico, @PerfilPermitido, UsuarioLogado
├── service/      → Regras de aplicação (AutenticacaoService, AlunoService, EmpresaService,
│                   ProfessorService, VantagemService, TransacaoMoedaService,
│                   VantagemResgateService, NotificacaoEmailService)
├── model/        → Entidades JPA com as regras de domínio (M do MVC)
├── repository/   → Interfaces Spring Data JPA (camada de acesso a dados / DAO)
├── dto/          → Objetos de entrada/saída da API (a senha nunca é exposta)
├── event/        → Eventos de domínio que disparam e-mails após o commit
└── config/       → Seed de dados, agendamento do crédito semestral, configuração web (serve o React)

frontend/src      → View (React)
├── pages/        → telas por perfil: publico/, aluno/, professor/, empresa/ e ExtratoPage
├── components/   → layout, rotas protegidas, formulários, gráfico e componentes de UI
├── context/      → sessão do usuário (AuthContext) e notificações
├── hooks/ lib/   → acesso à API, validações, formatação e indicadores dos painéis
└── test/         → utilitários do Vitest (mock da API e dados de exemplo)
```

Os componentes do diagrama correspondem ao código assim:

| Componente do diagrama | Implementação |
|------------------------|---------------|
| Portal de Autenticação | `frontend/src/pages/publico/*` + `AuthContext` + `RotaProtegida` |
| Painéis (Aluno, Professor, Empresa) | `frontend/src/pages/aluno/*`, `professor/*`, `empresa/*` |
| AutenticacaoService | `AutenticacaoService` + `AuthController` + `AutenticacaoInterceptor` |
| GestaoUsuariosModule | `AlunoService`, `EmpresaService`, `ProfessorService`, `InstituicaoService` |
| TransacaoMoedaService | `TransacaoMoedaService` (envio, saldo e extrato) |
| VantagemResgateService | `VantagemService` (CRUD de vantagens) + `VantagemResgateService` (resgate e cupom) |
| NotificacaoEmailService | `NotificacaoEmailService` |
| Camada de Persistência | `repository/*` (Spring Data JPA) |

---

## Como Executar (Docker, sem instalar Java nem Maven)

Pré-requisito: **Docker Desktop**.

```bash
# na raiz do repositório
docker compose up --build
```

| Serviço | Endereço |
|---------|----------|
| Aplicação | http://localhost:8080 |
| Caixa de e-mails (Mailpit): todos os e-mails enviados aparecem aqui | http://localhost:8025 |
| Console do H2 | http://localhost:8080/h2-console (JDBC URL `jdbc:h2:file:./data/tokendb`, usuário `sa`, senha em branco) |

Outros comandos:

```bash
docker compose run --rm testes            # testes do back-end (JUnit + MockMvc)
docker compose run --rm testes-front      # testes do front-end (Vitest + Testing Library)
docker compose --profile dev up --build   # front com hot reload em http://localhost:5173
docker compose run --rm diagramas         # gera os PNGs dos diagramas .puml (Diagramas/Release2)
docker compose down                       # para os containers (mantém o banco)
docker compose down -v                    # para e APAGA o banco (volta aos dados iniciais)
```

### Usuários de demonstração

| Perfil | Login | Senha |
|--------|-------|-------|
| Professor (PUC Minas) | `milena.adao` | `senha123` |
| Professor (PUC Minas) | `ricardo.almeida` | `senha123` |
| Professor (UFMG) | `carlos.silva` | `senha123` |
| Aluno (PUC Minas) | `lucas.santos` | `aluno123` |
| Aluno (PUC Minas) | `mariana.alves` | `aluno123` |
| Empresa | `livraria.univ` | `empresa123` |
| Empresa | `restaurante.campus` | `empresa123` |

**Roteiro de demonstração:**
1. Entre como `milena.adao` e envie moedas para Lucas.
2. Abra o Mailpit e veja o e-mail de notificação.
3. Entre como `lucas.santos`, consulte o extrato e resgate o "Café com pão de queijo".
4. Confira os dois e-mails com o código do cupom no Mailpit.
5. Entre como `restaurante.campus`, confira o cupom e marque-o como utilizado.

### Execução sem Docker (opcional)
Requer Java 21, Maven e Node 22 instalados:
1. Back-end: `cd token && mvn spring-boot:run` (API em http://localhost:8080).
2. Front-end: `cd frontend && npm install && npm run dev`. Abra http://localhost:5173; o Vite encaminha `/api` para a porta 8080.

Sem um servidor SMTP local, os e-mails falham e o erro aparece apenas no log; as operações continuam funcionando normalmente.

---

## Implantação na nuvem (Vercel + Render)

O front-end fica no **Vercel** e o back-end, junto com o banco PostgreSQL, fica no **Render**. O [diagrama de implantação](#diagrama-de-implantação) mostra os nós.

**Como o login funciona entre os dois:** o navegador só acessa o domínio do Vercel. O `frontend/vercel.json` tem um *rewrite* que repassa `/api/**` ao Render, e esse repasse acontece no servidor do Vercel. Para o navegador, front e API estão na mesma origem, então o cookie de sessão (`JSESSIONID`) continua funcionando sem CORS, como no Docker local. Por isso não foi preciso mudar a autenticação.

| Arquivo | Função |
|---------|--------|
| [`render.yaml`](render.yaml) | Blueprint do Render: Web Service Docker (usa o mesmo `Dockerfile` da raiz) + PostgreSQL 16 gratuito |
| [`frontend/vercel.json`](frontend/vercel.json) | Build do Vite, rewrite de `/api/**` para o Render e fallback das rotas do React para o `index.html` |
| [`application-prod.properties`](token/src/main/resources/application-prod.properties) | Perfil `prod`: PostgreSQL, cookie `Secure`, cabeçalhos de proxy e SMTP com autenticação |

### Passo a passo

**1. Back-end e banco no Render**
1. Entre em https://dashboard.render.com com a conta do GitHub.
2. Clique em **New › Blueprint** e escolha este repositório. O Render lê o `render.yaml` e cria o serviço `token-moeda-estudantil` e o banco `token-db`.
3. O Render pede `MAIL_USERNAME` e `MAIL_PASSWORD`. Pode deixar em branco por enquanto (veja o passo 3).
4. Espere o primeiro deploy terminar (cerca de 10 min, porque compila o React e o Java). Depois, abra `https://<serviço>.onrender.com/api/instituicoes`: deve aparecer a lista de instituições em JSON.
5. Anote a URL do serviço. Se o Render tiver acrescentado um sufixo ao nome, ela será diferente de `token-moeda-estudantil.onrender.com`.

**2. Front-end no Vercel**
1. Se a URL do passo 1.5 for diferente, corrija o `destination` em `frontend/vercel.json` e faça o push.
2. Entre em https://vercel.com com a conta do GitHub, clique em **Add New › Project** e importe o repositório.
3. Em **Root Directory**, escolha `frontend`. O resto (Vite, `npm run build`, pasta `dist`) já vem do `vercel.json`.
4. Clique em **Deploy** e abra a URL `https://<projeto>.vercel.app`. Os [usuários de demonstração](#usuários-de-demonstração) já existem, porque o `DataSeeder` popula o banco vazio.
5. Coloque as duas URLs na seção [Aplicação online](#aplicação-online).

**3. E-mails na nuvem (opcional)**

No Docker local, os e-mails vão para o Mailpit. Na nuvem é preciso um servidor SMTP de verdade. Sugestão: **Mailtrap › Email Testing** (gratuito). Ele guarda os e-mails numa caixa web, como o Mailpit, e não entrega a ninguém de fato.
1. Crie uma inbox no Mailtrap e copie o *username* e a *password* do SMTP.
2. No Render, abra **token-moeda-estudantil › Environment** e preencha `MAIL_USERNAME`, `MAIL_PASSWORD` e `EMAIL_HABILITADO=true`. O `MAIL_HOST` (`sandbox.smtp.mailtrap.io`) e a `MAIL_PORT` (`2525`) já vêm do `render.yaml`.
3. Salve. O Render reinicia o serviço.

A porta 2525 foi escolhida porque o plano gratuito do Render pode bloquear as portas SMTP tradicionais (25, 465 e 587). Com `EMAIL_HABILITADO=false`, as operações funcionam normalmente e o e-mail só aparece no log.

### Limitações do plano gratuito
- **Hibernação:** o Web Service dorme após 15 min sem acesso, e a primeira requisição depois disso leva cerca de 1 minuto. Enquanto isso, o front mostra *"O servidor está iniciando..."*. Antes de uma apresentação, abra o site alguns minutos antes.
- **Banco:** o PostgreSQL gratuito do Render expira 30 dias após a criação. Para continuar depois disso, crie outro banco (ou use um plano pago) e atualize as variáveis `DB_*` do serviço.
- **Deploy automático:** cada push na `main` gera um novo deploy no Render e no Vercel.

Para testar o perfil `prod` localmente (com um PostgreSQL em Docker), defina `SPRING_PROFILES_ACTIVE=prod`, as variáveis `DB_HOST`, `DB_NAME`, `DB_USER` e `DB_PASSWORD`, e `COOKIE_SECURE=false` (porque o acesso local é por HTTP).

---

## Endpoints da API REST

🔓 = público · 🎓 aluno · 👩‍🏫 professor · 🏢 empresa

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| POST | `/api/auth/login` | 🔓 | Login (cria sessão) |
| POST | `/api/auth/logout` | 🔓 | Logout |
| GET | `/api/auth/me` | logado | Usuário da sessão |
| GET | `/api/instituicoes` · `/api/cursos` | 🔓 | Dados de apoio ao cadastro |
| POST | `/api/alunos` | 🔓 | Cadastro de aluno |
| GET / PUT / DELETE | `/api/alunos/me` | 🎓 | Consultar, editar ou excluir o próprio cadastro |
| GET | `/api/alunos` | 👩‍🏫 | Alunos da instituição do professor |
| POST | `/api/empresas` | 🔓 | Cadastro de empresa parceira |
| GET | `/api/empresas` | 🔓 | Lista pública de parceiras |
| GET / PUT / DELETE | `/api/empresas/me` | 🏢 | Consultar, editar ou excluir o próprio cadastro |
| GET | `/api/professores/me` | 👩‍🏫 | Dados e saldo do professor |
| GET | `/api/vantagens` | logado | Catálogo de vantagens |
| GET | `/api/vantagens/minhas` | 🏢 | Vantagens da empresa |
| POST / PUT | `/api/vantagens` · `/api/vantagens/{id}` | 🏢 | Cadastrar ou editar vantagem (multipart com foto) |
| DELETE | `/api/vantagens/{id}` | 🏢 | Excluir vantagem (bloqueado se já resgatada) |
| GET | `/api/vantagens/{id}/foto` | 🔓 | Foto da vantagem |
| POST | `/api/transacoes` | 👩‍🏫 | Enviar moedas (`alunoId`, `valor`, `motivo`) |
| GET | `/api/extrato` | 🎓 👩‍🏫 | Saldo e histórico de transações |
| POST | `/api/resgates` | 🎓 | Resgatar vantagem (gera cupom e envia e-mails) |
| GET | `/api/resgates` | 🎓 🏢 | Cupons do aluno ou resgates das vantagens da empresa |
| GET | `/api/resgates/cupom/{codigo}` | 🏢 | Conferir cupom |
| POST | `/api/resgates/cupom/{codigo}/utilizar` | 🏢 | Marcar cupom como utilizado |

## Regras de negócio implementadas

- Professores são pré-cadastrados e vinculados a uma instituição. Recebem **1.000 moedas por semestre**, de forma acumulável: o crédito é aplicado no login e por uma tarefa agendada diária quando o semestre muda.
- Para enviar moedas, o professor precisa ter saldo suficiente, informar um motivo (obrigatório) e escolher um aluno **da mesma instituição**. O aluno é notificado por e-mail.
- No resgate, o sistema verifica estoque e saldo, debita as moedas, baixa o estoque e gera um código único (`TKN-XXXX-XXXX`), enviado por e-mail ao aluno e à empresa.
- A empresa confere o cupom e o marca como utilizado; um cupom não pode ser usado duas vezes.
- CPF e CNPJ são validados (dígitos verificadores) e únicos. Login e e-mail também são únicos.
- Contas com histórico de transações não podem ser excluídas, para preservar a auditoria.
- Controle de concorrência otimista (`@Version`) evita gasto duplo de saldo ou estoque em requisições simultâneas.
