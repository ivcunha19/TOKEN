import { useApi } from '../../hooks/useApi';
import { useFormulario } from '../../hooks/useFormulario';
import { endpoints } from '../../lib/api';
import { cpfValido, mascararCpf } from '../../lib/documentos';
import { Button } from '../ui/Button';
import { FormError, Input, PasswordInput, Select, Textarea } from '../ui/Form';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const VAZIO_ALUNO = {
  nome: '',
  email: '',
  cpf: '',
  rg: '',
  endereco: '',
  instituicaoId: '',
  curso: '',
  matricula: '',
  login: '',
  senha: '',
};

export function validarAluno(v, { edicao = false } = {}) {
  return {
    nome: !v.nome.trim() && 'Informe o nome completo.',
    email: (!v.email.trim() && 'Informe o e-mail.') || (!EMAIL.test(v.email.trim()) && 'Informe um e-mail válido.'),
    cpf: (!v.cpf && 'Informe o CPF.') || (!cpfValido(v.cpf) && 'CPF inválido: confira os dígitos.'),
    rg: !v.rg.trim() && 'Informe o RG.',
    endereco: !v.endereco.trim() && 'Informe o endereço.',
    instituicaoId: !v.instituicaoId && 'Selecione a instituição.',
    curso: !v.curso && 'Selecione o curso.',
    matricula: v.matricula && !/^\d{1,9}$/.test(String(v.matricula)) && 'Use apenas números (até 9 dígitos).',
    login:
      (!v.login.trim() && 'Informe o login.') ||
      ((v.login.trim().length < 3 || v.login.trim().length > 50) && 'O login deve ter entre 3 e 50 caracteres.'),
    senha:
      (!edicao && !v.senha && 'Crie uma senha.') ||
      (v.senha && v.senha.length < 6 && 'A senha deve ter pelo menos 6 caracteres.'),
  };
}

/** Converte o estado do formulário para o AlunoRequestDTO do back-end. */
export function paraRequisicaoAluno(v) {
  return {
    nome: v.nome.trim(),
    email: v.email.trim(),
    cpf: v.cpf,
    rg: v.rg.trim(),
    endereco: v.endereco.trim(),
    instituicaoId: Number(v.instituicaoId),
    curso: v.curso,
    matricula: v.matricula ? Number(v.matricula) : null,
    login: v.login.trim(),
    senha: v.senha || null,
  };
}

/** Formulário de aluno usado no cadastro (público) e na edição do próprio cadastro. */
export function AlunoForm({ inicial, edicao = false, aoEnviar, textoBotao, acoesExtras }) {
  const apoio = useApi(() => Promise.all([endpoints.catalogo.instituicoes(), endpoints.catalogo.cursos()]), []);
  const [instituicoes = [], cursos = []] = apoio.dados || [];

  const form = useFormulario(
    inicial
      ? {
          ...VAZIO_ALUNO,
          ...inicial,
          instituicaoId: String(inicial.instituicaoId ?? ''),
          matricula: inicial.matricula ? String(inicial.matricula) : '',
          senha: '',
        }
      : VAZIO_ALUNO,
    (v) => validarAluno(v, { edicao }),
  );

  return (
    <form noValidate onSubmit={form.enviar((v) => aoEnviar(paraRequisicaoAluno(v)))} className="space-y-6">
      <FormError mensagem={form.erroGeral} />

      <fieldset className="space-y-4">
        <legend className="mb-3 text-sm font-bold tracking-wide text-slate-400 uppercase">Dados pessoais</legend>
        <Input label="Nome completo" obrigatorio autoComplete="name" maxLength={120} {...form.campo('nome')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="CPF"
            obrigatorio
            inputMode="numeric"
            placeholder="000.000.000-00"
            dica="Validamos os dígitos verificadores"
            {...form.campo('cpf', mascararCpf)}
          />
          <Input label="RG" obrigatorio maxLength={20} placeholder="MG-12.345.678" {...form.campo('rg')} />
        </div>
        <Textarea
          label="Endereço completo"
          obrigatorio
          rows={2}
          maxLength={255}
          autoComplete="street-address"
          {...form.campo('endereco')}
        />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-3 text-sm font-bold tracking-wide text-slate-400 uppercase">Vida acadêmica</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Instituição de ensino"
            obrigatorio
            disabled={apoio.carregando}
            opcoes={instituicoes.map((i) => ({ value: String(i.id), label: i.nome }))}
            dica="Somente instituições parceiras"
            {...form.campo('instituicaoId')}
          />
          <Select
            label="Curso"
            obrigatorio
            disabled={apoio.carregando}
            opcoes={cursos.map((c) => ({ value: c.codigo, label: c.nome }))}
            {...form.campo('curso')}
          />
        </div>
        <Input
          label="Matrícula"
          inputMode="numeric"
          maxLength={9}
          dica="Opcional — apenas números"
          {...form.campo('matricula', (x) => x.replace(/\D/g, ''))}
        />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-3 text-sm font-bold tracking-wide text-slate-400 uppercase">Acesso</legend>
        <Input
          label="E-mail"
          obrigatorio
          type="email"
          autoComplete="email"
          dica="Você recebe aqui os avisos de moedas e os cupons"
          {...form.campo('email')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Login"
            obrigatorio
            autoComplete="username"
            autoCapitalize="off"
            spellCheck={false}
            maxLength={50}
            {...form.campo('login')}
          />
          <PasswordInput
            label={edicao ? 'Nova senha' : 'Senha'}
            obrigatorio={!edicao}
            autoComplete="new-password"
            dica={edicao ? 'Deixe em branco para manter a atual' : 'Mínimo de 6 caracteres'}
            {...form.campo('senha')}
          />
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
        {acoesExtras || <span />}
        <Button type="submit" tamanho="lg" carregando={form.enviando}>
          {textoBotao || (edicao ? 'Salvar alterações' : 'Criar minha conta')}
        </Button>
      </div>
    </form>
  );
}
