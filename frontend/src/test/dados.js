/** Dados de exemplo no formato exato dos DTOs do back-end. */

export const ALUNO = {
  id: 4,
  nome: 'Lucas Oliveira Santos',
  email: 'lucas@aluno.pucminas.br',
  login: 'lucas.santos',
  cpf: '935.411.347-80',
  rg: 'MG-12.345.678',
  endereco: 'Rua Dom José Gaspar, 500',
  instituicaoId: 1,
  instituicaoNome: 'PUC Minas',
  curso: 'ENGENHARIA_SOFTWARE',
  cursoNome: 'Engenharia de Software',
  matricula: 123456,
  saldo: 150,
};

export const VANTAGENS = [
  {
    id: 1,
    nome: 'Café com pão de queijo',
    descricao: 'Um café coado e um pão de queijo.',
    custo: 40,
    quantidade: 100,
    disponivel: true,
    fotoUrl: '/api/vantagens/1/foto?v=0',
    empresaId: 6,
    empresaNome: 'Restaurante Sabor do Campus',
  },
  {
    id: 2,
    nome: 'Almoço executivo grátis',
    descricao: 'Prato do dia com suco.',
    custo: 200,
    quantidade: 3,
    disponivel: true,
    fotoUrl: '/api/vantagens/2/foto?v=0',
    empresaId: 6,
    empresaNome: 'Restaurante Sabor do Campus',
  },
  {
    id: 3,
    nome: 'Kit papelaria completo',
    descricao: 'Cadernos, canetas e marca-textos.',
    custo: 120,
    quantidade: 0,
    disponivel: false,
    fotoUrl: null,
    empresaId: 5,
    empresaNome: 'Livraria e Papelaria Universitária',
  },
];

export const EXTRATO_ALUNO = {
  saldo: 150,
  transacoes: [
    {
      tipo: 'RESGATE',
      valor: -40,
      descricao: 'Resgate da vantagem: Café com pão de queijo',
      contraparte: 'Restaurante Sabor do Campus',
      dataHora: '2026-11-08T10:00:00',
      codigoCupom: 'TKN-AAAA-BBBB',
    },
    {
      tipo: 'RECEBIMENTO',
      valor: 150,
      descricao: 'Participação ativa nas aulas',
      contraparte: 'Profa. Milena Menezes Adão',
      dataHora: '2026-11-05T09:00:00',
      codigoCupom: null,
    },
    {
      tipo: 'RECEBIMENTO',
      valor: 40,
      descricao: 'Ótimo trabalho em grupo',
      contraparte: 'Prof. Ricardo Almeida',
      dataHora: '2026-09-15T14:00:00',
      codigoCupom: null,
    },
  ],
};

export const RESGATE = {
  id: 10,
  codigoCupom: 'TKN-W23N-F7E6',
  valor: 40,
  dataHora: '2026-11-08T10:00:00',
  utilizado: false,
  dataUtilizacao: null,
  vantagemId: 1,
  vantagemNome: 'Café com pão de queijo',
  empresaNome: 'Restaurante Sabor do Campus',
  alunoId: 4,
  alunoNome: 'Lucas Oliveira Santos',
  alunoEmail: 'lucas@aluno.pucminas.br',
  saldoAluno: 110,
};

export const PROFESSOR = {
  id: 1,
  nome: 'Profa. Milena Menezes Adão',
  email: 'milena@pucminas.br',
  login: 'milena.adao',
  cpf: '123.456.789-09',
  departamentoNome: 'Computação',
  instituicaoId: 1,
  instituicaoNome: 'PUC Minas',
  saldo: 800,
  valorSemestral: 1000,
  ultimoSemestreCreditado: '2026-2',
};

export const ALUNOS_DA_INSTITUICAO = [
  { id: 4, nome: 'Lucas Oliveira Santos', email: 'lucas@aluno.pucminas.br', cursoNome: 'Engenharia de Software', matricula: 123456 },
  { id: 5, nome: 'Mariana Alves Pereira', email: 'mariana@aluno.pucminas.br', cursoNome: 'Ciência da Computação', matricula: 654321 },
];

export const EXTRATO_PROFESSOR = {
  saldo: 800,
  transacoes: [
    {
      tipo: 'ENVIO',
      valor: -200,
      descricao: 'Participação ativa nas aulas',
      contraparte: 'Lucas Oliveira Santos',
      dataHora: '2026-11-05T09:00:00',
      codigoCupom: null,
    },
  ],
};
