import { useEffect, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { useFormulario } from '../../hooks/useFormulario';
import { Button } from '../ui/Button';
import { Field, FormError, Input, Textarea } from '../ui/Form';

export const TIPOS_FOTO = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
export const TAMANHO_MAXIMO_FOTO = 2 * 1024 * 1024;

/** Mesmas regras do VantagemService: foto obrigatória no cadastro, PNG/JPEG/WEBP/GIF até 2 MB. */
export function validarFoto(arquivo, { obrigatoria }) {
  if (!arquivo) return obrigatoria ? 'Selecione a foto do produto.' : '';
  if (!TIPOS_FOTO.includes(arquivo.type)) return 'Formato não suportado. Use PNG, JPEG, WEBP ou GIF.';
  if (arquivo.size > TAMANHO_MAXIMO_FOTO) return 'A foto deve ter no máximo 2 MB.';
  return '';
}

export function validarVantagem(v, { edicao }) {
  const custo = Number(v.custo);
  const quantidade = Number(v.quantidade);
  return {
    nome: !v.nome.trim() && 'Informe o nome da vantagem.',
    descricao: !v.descricao.trim() && 'Descreva a vantagem.',
    custo: (v.custo === '' && 'Informe o custo em moedas.') || ((!Number.isInteger(custo) || custo < 1) && 'O custo deve ser de pelo menos 1 moeda.'),
    quantidade:
      (v.quantidade === '' && 'Informe a quantidade em estoque.') ||
      ((!Number.isInteger(quantidade) || quantidade < 0) && 'A quantidade não pode ser negativa.'),
    foto: validarFoto(v.foto, { obrigatoria: !edicao }),
  };
}

/** Monta o multipart/form-data esperado pelo VantagemController. */
export function paraFormData(v) {
  const fd = new FormData();
  fd.append('nome', v.nome.trim());
  fd.append('descricao', v.descricao.trim());
  fd.append('custo', String(Number(v.custo)));
  fd.append('quantidade', String(Number(v.quantidade)));
  if (v.foto) fd.append('foto', v.foto);
  return fd;
}

export function VantagemForm({ inicial, aoEnviar, aoCancelar }) {
  const edicao = Boolean(inicial);
  const form = useFormulario(
    {
      nome: inicial?.nome || '',
      descricao: inicial?.descricao || '',
      custo: inicial ? String(inicial.custo) : '',
      quantidade: inicial ? String(inicial.quantidade) : '',
      foto: null,
    },
    (v) => validarVantagem(v, { edicao }),
  );
  const [previa, setPrevia] = useState(inicial?.fotoUrl || null);

  useEffect(() => {
    if (!form.valores.foto || typeof URL.createObjectURL !== 'function') return undefined;
    const url = URL.createObjectURL(form.valores.foto);
    setPrevia(url);
    return () => URL.revokeObjectURL(url);
  }, [form.valores.foto]);

  return (
    <form noValidate onSubmit={form.enviar((v) => aoEnviar(paraFormData(v)))} className="space-y-5">
      <FormError mensagem={form.erroGeral} />

      <Field label={edicao ? 'Foto do produto (opcional para trocar)' : 'Foto do produto'} obrigatorio={!edicao} erro={form.erros.foto} dica="PNG, JPEG, WEBP ou GIF, até 2 MB">
        {(a11y) => (
          <label className="group relative flex aspect-[16/9] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-brand-400 hover:bg-brand-50/40 focus-within:border-brand-500">
            {previa ? (
              <img src={previa} alt="Prévia da foto" className="size-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-2 text-sm text-slate-500">
                <ImagePlus className="size-8 text-slate-400" aria-hidden="true" />
                Clique para escolher uma imagem
              </span>
            )}
            {previa && (
              <span className="absolute inset-x-0 bottom-0 bg-slate-900/60 py-2 text-center text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
                Trocar imagem
              </span>
            )}
            <input
              type="file"
              name="foto"
              accept={TIPOS_FOTO.join(',')}
              className="sr-only"
              onChange={(e) => form.alterar('foto', e.target.files?.[0] || null)}
              {...a11y}
            />
          </label>
        )}
      </Field>

      <Input label="Nome da vantagem" obrigatorio maxLength={120} {...form.campo('nome')} />
      <Textarea label="Descrição" obrigatorio rows={3} maxLength={1000} contador dica="Regras de uso, validade, etc." {...form.campo('descricao')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Custo (moedas)" obrigatorio type="number" min={1} step={1} inputMode="numeric" {...form.campo('custo')} />
        <Input label="Quantidade em estoque" obrigatorio type="number" min={0} step={1} inputMode="numeric" dica="0 deixa a vantagem esgotada" {...form.campo('quantidade')} />
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-5">
        {aoCancelar && (
          <Button variante="secundario" onClick={aoCancelar} disabled={form.enviando}>
            Cancelar
          </Button>
        )}
        <Button type="submit" carregando={form.enviando}>
          {edicao ? 'Salvar alterações' : 'Cadastrar vantagem'}
        </Button>
      </div>
    </form>
  );
}
