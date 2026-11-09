import { useFormulario } from '../../hooks/useFormulario';
import { cnpjValido, mascararCnpj } from '../../lib/documentos';
import { Button } from '../ui/Button';
import { FormError, Input, PasswordInput, Textarea } from '../ui/Form';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const VAZIO_EMPRESA = { nome: '', cnpj: '', email: '', descricao: '', login: '', senha: '' };

export function validarEmpresa(v, { edicao = false } = {}) {
  return {
    nome: !v.nome.trim() && 'Informe o nome da empresa.',
    cnpj: (!v.cnpj && 'Informe o CNPJ.') || (!cnpjValido(v.cnpj) && 'CNPJ inválido: confira os dígitos.'),
    email: (!v.email.trim() && 'Informe o e-mail.') || (!EMAIL.test(v.email.trim()) && 'Informe um e-mail válido.'),
    descricao: !v.descricao.trim() && 'Descreva a empresa e a parceria.',
    login:
      (!v.login.trim() && 'Informe o login.') ||
      ((v.login.trim().length < 3 || v.login.trim().length > 50) && 'O login deve ter entre 3 e 50 caracteres.'),
    senha:
      (!edicao && !v.senha && 'Crie uma senha.') ||
      (v.senha && v.senha.length < 6 && 'A senha deve ter pelo menos 6 caracteres.'),
  };
}

export function paraRequisicaoEmpresa(v) {
  return {
    nome: v.nome.trim(),
    cnpj: v.cnpj,
    email: v.email.trim(),
    descricao: v.descricao.trim(),
    login: v.login.trim(),
    senha: v.senha || null,
  };
}

/** Formulário de empresa parceira (cadastro público e edição do próprio cadastro). */
export function EmpresaForm({ inicial, edicao = false, aoEnviar, textoBotao, acoesExtras }) {
  const form = useFormulario(
    inicial ? { ...VAZIO_EMPRESA, ...inicial, senha: '' } : VAZIO_EMPRESA,
    (v) => validarEmpresa(v, { edicao }),
  );

  return (
    <form noValidate onSubmit={form.enviar((v) => aoEnviar(paraRequisicaoEmpresa(v)))} className="space-y-6">
      <FormError mensagem={form.erroGeral} />

      <fieldset className="space-y-4">
        <legend className="mb-3 text-sm font-bold tracking-wide text-slate-400 uppercase">Empresa</legend>
        <Input label="Razão social / nome fantasia" obrigatorio maxLength={120} autoComplete="organization" {...form.campo('nome')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="CNPJ"
            obrigatorio
            inputMode="numeric"
            placeholder="00.000.000/0000-00"
            {...form.campo('cnpj', mascararCnpj)}
          />
          <Input
            label="E-mail corporativo"
            obrigatorio
            type="email"
            autoComplete="email"
            dica="Recebe a confirmação de cada resgate"
            {...form.campo('email')}
          />
        </div>
        <Textarea
          label="Descrição da empresa e da parceria"
          obrigatorio
          rows={3}
          maxLength={1000}
          contador
          dica="Aparece para os alunos junto das suas vantagens"
          {...form.campo('descricao')}
        />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-3 text-sm font-bold tracking-wide text-slate-400 uppercase">Acesso</legend>
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
          {textoBotao || (edicao ? 'Salvar alterações' : 'Cadastrar empresa')}
        </Button>
      </div>
    </form>
  );
}
