# TOKEN — O que falta para a entrega da Sprint 03

> Atualizado em 09/11/2026 · Lab 03 — Projeto de Software (PUC Minas)

## Situação atual

**O código está completo.** As 7 histórias de usuário (US01 a US07) estão implementadas e testadas:

- login com perfis;
- CRUDs de aluno e empresa;
- vantagens com foto;
- envio de moedas;
- extrato;
- resgate com cupom e e-mail.

O front-end foi refeito em **React + Tailwind**, com painéis de indicadores para cada perfil. Os testes automatizados passam: 13 no back-end (JUnit) e 67 no front-end (Vitest). O fluxo completo também foi validado no navegador. As tecnologias estão documentadas em [STACK.md](STACK.md).

O que falta é principalmente **modelagem (diagramas)** e **apresentação**. A correção avalia o alinhamento entre os modelos e o código, então os diagramas precisam refletir o que foi implementado.

### Como rodar o projeto (só precisa do Docker Desktop)

```bash
docker compose up --build              # sobe o sistema
docker compose run --rm testes         # testes do back-end
docker compose run --rm testes-front   # testes do front-end
docker compose down -v                 # para e apaga o banco (volta aos dados iniciais)
```

- **Sistema:** http://localhost:8080. A tela de login mostra os usuários de demonstração.
- **Caixa de e-mails (Mailpit):** http://localhost:8025. Todo e-mail enviado pelo sistema aparece aqui.

Logins, endpoints e o roteiro de demonstração estão no [README](README.md).

---

## 1. Atualizar os diagramas (pasta `Diagramas/`, no draw.io)

> Mantenham as versões antigas, como o enunciado pede. Sugestão: salvar as novas com sufixo `_v2`.

### 1.1 Diagrama de Classes — `DiagramaDeClassesTOKEN`

- [ ] **Usuario:** acrescentar `versao: Long` e o método `alterarSenha(novaSenha)`. Anotar que a senha é guardada como hash (BCrypt).
- [ ] **Instituicao:** acrescentar `nome` e `cnpj`; remover `listaCursos`.
- [ ] **Empresa:** remover a associação com Instituição. A assinatura passa a ser `cadastrarVantagem(nome, descricao, custo, foto: byte[], fotoTipo, quantidade): Vantagem`. Manter `conferirCupom(codigo)`.
- [ ] **Vantagem:** `foto: byte[]`, `fotoTipo: String`, `versao: Long`, `resgates: List<ResgateVantagem>`; métodos `possuiFoto()` e `atualizarFoto(foto, tipo)`.
- [ ] **Aluno:** remover `email` (já é herdado de Usuario) e `enviarEmail()`. Trocar para `resgatarVantagem(vantagem, codigoCupom): ResgateVantagem`.
- [ ] **Professor:** `enviarMoedas(aluno, valor, motivo): Transacao`, `receberMoedasSemestrais(): boolean` e o atributo `ultimoSemestreCreditado: String`.
- [ ] **ResgateVantagem:** acrescentar `utilizado: boolean`, `dataUtilizacao: LocalDateTime` e `registrarUtilizacao()`.
- [ ] **Novas classes:** o enum `ETipoUsuario` (ALUNO, PROFESSOR, EMPRESA) e a classe utilitária `Semestre` (`atual()`, `de(data)`).
- [ ] **Decidir sobre `historico` e `consultarExtrato()` em UsuarioPessoa:** estão sem uso no código, porque o extrato vem das transações. Removam dos dois lados (código e diagrama) ou mantenham nos dois.

### 1.2 Diagrama de Componentes — `DiagramaDeComponentesTOKEN`

- [ ] Dividir `VantagemResgateService` em dois componentes:
  - `VantagemService`: cadastro, edição e exclusão de vantagens;
  - `VantagemResgateService`: resgate, conferência e utilização de cupom.
- [ ] Dentro de `GestaoUsuariosModule`: `AlunoService`, `EmpresaService`, `ProfessorService` e `InstituicaoService`.
- [ ] Representar o servidor SMTP externo, usado pelo `NotificacaoEmailService` (Mailpit no ambiente de desenvolvimento).
- [ ] Representar o **front-end React** (SPA) como componente cliente que consome a API REST:
  - "Portal de Autenticação" corresponde a `pages/publico` + `AuthContext`;
  - os "Painéis" correspondem a `pages/aluno`, `pages/professor` e `pages/empresa`.
- [ ] Conferir com a tabela "componente → código" do README.

### 1.3 Diagrama ER — `DiagramaER_TOKEN`

- [ ] Remover a tabela `InstituicaoAlunoProfessor` e a FK `Instituicao.IdEmpresa`.
- [ ] **Instituicao:** acrescentar `Nome` e `CNPJ`.
- [ ] **Herança JOINED:** em `Aluno` e `Professor`, a PK é a própria FK para `UsuarioPessoa`. Remover o `Id` separado e o `Aluno.InstituicaoId`, porque a instituição fica em `UsuarioPessoa`.
- [ ] **Usuario:** acrescentar `Versao`.
- [ ] **Vantagem:** acrescentar `Foto` (BLOB), `FotoTipo` e `Versao`.
- [ ] **ResgateVantagem:** acrescentar `Utilizado`, `DataUtilizacao` e `DescricaoMotivo`.
- [ ] **Professor:** acrescentar `UltimoSemestreCreditado`. `Departamento` é um enum gravado como texto.
- [ ] **Opcional:** conferir as tabelas reais no console do H2 (http://localhost:8080/h2-console, JDBC `jdbc:h2:file:./data/tokendb`, usuário `sa`, senha em branco).

### 1.4 Diagrama de Casos de Uso — `Diagrama_Casos_de_Uso`

- [ ] **Professor:** remover a ligação com "Realizar cadastro", porque ele é pré-cadastrado.
- [ ] **Professor:** remover a ligação com "Receber moedas" ou renomear para "Receber moedas semestrais".
- [ ] Ligar **Empresa Parceira** a "Cadastrar vantagens".
- [ ] Acrescentar "Conferir/validar cupom" (Empresa).
- [ ] Acrescentar "Editar/Excluir cadastro" (Aluno e Empresa).

### 1.5 Arquivos

- [ ] Subir os `.drawio` (ou `.xml`) **editáveis** dos diagramas de Classes e de Componentes. Hoje só existe o PNG deles.
- [ ] Exportar os PNGs novos. Se mudarem os nomes dos arquivos, atualizar as imagens no README.

---

## 2. Apresentação da Sprint 03

- [ ] **Slides de arquitetura:**
  - MVC em camadas: View (React em `frontend/`), Controller, Service, Model, Repository;
  - como o build do React vai para dentro do jar (mesma origem, sessão por cookie);
  - diagrama de componentes;
  - a árvore de pacotes do README serve de base.
- [ ] **Slides da camada de persistência:**
  - Spring Data JPA/Hibernate como DAO (padrão Repository);
  - herança `JOINED` (Usuario → UsuarioPessoa → Aluno/Professor; Usuario → Empresa);
  - controle de concorrência com `@Version`;
  - banco H2 em arquivo.
- [ ] **Tutorial de 20 min sobre as tecnologias:** usar o [STACK.md](STACK.md) como roteiro. Sugestão de divisão em 4 partes de cerca de 5 min:
  - **Java/Spring:** Spring Boot, JPA, Bean Validation, Spring Mail;
  - **React:** componentes, React Router, Tailwind;
  - **Vitest:** Testing Library e mock da API;
  - **Docker:** build multi-stage e Compose.
- [ ] **Demonstração do protótipo:** ensaiar o roteiro de 5 passos do README:
  1. professor envia moedas;
  2. e-mail aparece no Mailpit;
  3. aluno resgata vantagem;
  4. cupom chega por e-mail;
  5. empresa confere o cupom.
- [ ] **Apresentação de andamento da semana em sala.** É obrigatória: faltar custa 50% da sprint.

---

## 3. Conferência final

- [ ] **Revisão da interface pelo grupo.** Cada um entra com um perfil e anota ajustes de texto ou visual:
  - o fluxo principal já foi testado num navegador automatizado, em desktop e celular;
  - falta um olhar humano sobre textos e preferências visuais.
- [ ] Rodar `docker compose run --rm testes` e `docker compose run --rm testes-front` e confirmar que tudo passa.
- [ ] **Fazer commit e push** de tudo. `token/target/` e `token/data/` saíram do versionamento de propósito (estão no `.gitignore`).
- [ ] Conferir no GitHub se README, diagramas e slides estão atualizados.

### Avisos

- Quem rodar **sem Docker** precisa apagar o arquivo antigo `token/data/tokendb.mv.db` antes. Ele tem senhas sem hash e o esquema antigo.
- Para voltar aos dados de demonstração no Docker, usem `docker compose down -v`.

---

## Divisão de tarefas (preencher)

| Tarefa | Responsável | Status |
|--------|-------------|--------|
| Diagrama de Classes | | ⬜ |
| Diagrama de Componentes | | ⬜ |
| Diagrama ER | | ⬜ |
| Diagrama de Casos de Uso | | ⬜ |
| Slides de arquitetura e persistência | | ⬜ |
| Tutorial de tecnologias (20 min) | | ⬜ |
| Ensaio da demonstração | | ⬜ |
| Teste da interface no navegador | | ⬜ |
| Commit/push final | | ⬜ |
