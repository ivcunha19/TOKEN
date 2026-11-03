# TOKEN — Sistema de Moeda Estudantil

O projeto **TOKEN** consiste em um sistema completo que permite que alunos recebam moedas atribuídas pelos seus professores baseadas em seu desempenho acadêmico e que essas moedas sejam trocadas por vantagens cadastradas pelas empresas parceiras.

---

## Modelagem do Sistema

### Diagrama de Classes
![Diagrama de Classes](Diagramas/DiagramaDeClassesTOKEN.png)

### Diagrama de Componentes
![Diagrama de Componentes](Diagramas/DiagramaDeComponentesTOKEN.png)

### Modelo Entidade-Relacionamento (ER)
![Diagrama ER](Diagramas/DiagramaER_TOKEN.png)

### Diagrama de Casos de Uso
Consulte o arquivo [Diagrama_Casos_de_Uso.drawio.pdf](Diagramas/Diagrama_Casos_de_Uso.drawio.pdf).

---

## Histórias de Usuário

- **US01 (Autenticação)**: Como usuário (aluno, professor ou empresa parceira), quero realizar login informando meu usuário e senha, para acessar as funcionalidades do meu perfil com segurança.
- **US02 (CRUD de Aluno)**: Como aluno, quero gerenciar meu cadastro informando meus dados pessoais, instituição de ensino e curso, para ingressar e participar do sistema de mérito estudantil.
- **US03 (CRUD de Empresa Parceira)**: Como empresa parceira, quero realizar e gerenciar meu cadastro no sistema, para poder ofertar produtos e descontos aos estudantes.
- **US04 (Cadastro de Vantagens)**: Como empresa parceira, quero cadastrar vantagens informando nome, descrição, foto, estoque e custo em moedas, para disponibilizá-las no catálogo de trocas.
- **US05 (Envio de Moedas)**: Como professor, quero enviar moedas do meu saldo acumulado (1.000 por semestre) a um aluno informando o motivo do reconhecimento, para premiar seu mérito e notificá-lo por e-mail.
- **US06 (Consulta de Extrato)**: Como aluno ou professor, quero consultar meu saldo atual e o histórico de transações realizadas, para acompanhar minhas movimentações de moedas.
- **US07 (Resgate de Vantagem)**: Como aluno, quero trocar minhas moedas por uma vantagem disponível e receber um cupom com código único por e-mail (enviado também à empresa parceira), para utilizá-lo presencialmente.

---

## Como Executar o Projeto (Lab03S02)

### Pré-requisitos
- **Java 21+**
- **Apache Maven 3.8+**

### Passos para Execução
1. Acesse o diretório do projeto Maven:
   ```bash
   cd token
   ```
2. Execute a aplicação Spring Boot:
   ```bash
   mvn spring-boot:run
   ```
3. Acesse no navegador:
   - **Interface Web (CRUD de Alunos e Empresas Parceiras)**: `http://localhost:8080`
   - **Console do Banco de Dados H2**: `http://localhost:8080/h2-console`
     - **JDBC URL**: `jdbc:h2:file:./data/tokendb`
     - **User Name**: `sa`
     - **Password**: *(em branco)*

### Endpoints da API REST (Lab03S02)
- `GET /api/alunos` — Lista todos os alunos cadastrados
- `GET /api/alunos/{id}` — Busca um aluno por ID
- `POST /api/alunos` — Cadastra um novo aluno
- `PUT /api/alunos/{id}` — Atualiza os dados de um aluno
- `DELETE /api/alunos/{id}` — Remove um aluno
- `GET /api/empresas` — Lista todas as empresas parceiras
- `GET /api/empresas/{id}` — Busca uma empresa parceira por ID
- `POST /api/empresas` — Cadastra uma nova empresa parceira
- `PUT /api/empresas/{id}` — Atualiza os dados de uma empresa parceira
- `DELETE /api/empresas/{id}` — Remove uma empresa parceira
- `GET /api/instituicoes` — Lista as instituições de ensino pré-cadastradas
- `GET /api/cursos` — Lista os cursos disponíveis (`ECurso`)
