import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockApi, renderizarApp, sessao, USUARIOS } from '../../test/utils';
import { RESGATE, VANTAGENS } from '../../test/dados';
import { paraFormData, validarFoto } from '../../components/forms/VantagemForm';

const DO_RESTAURANTE = VANTAGENS.filter((v) => v.empresaId === 6);

describe('regras do formulário de vantagem', () => {
  it('valida tipo e tamanho da foto como o back-end', () => {
    const png = new File(['x'], 'foto.png', { type: 'image/png' });
    const pdf = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
    const grande = new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'g.png', { type: 'image/png' });
    expect(validarFoto(null, { obrigatoria: true })).toBe('Selecione a foto do produto.');
    expect(validarFoto(null, { obrigatoria: false })).toBe('');
    expect(validarFoto(png, { obrigatoria: true })).toBe('');
    expect(validarFoto(pdf, { obrigatoria: true })).toMatch('Formato não suportado');
    expect(validarFoto(grande, { obrigatoria: true })).toBe('A foto deve ter no máximo 2 MB.');
  });

  it('monta o multipart com os campos do VantagemRequestDTO', () => {
    const foto = new File(['x'], 'foto.png', { type: 'image/png' });
    const fd = paraFormData({ nome: ' Suco ', descricao: 'Natural', custo: '15', quantidade: '0', foto });
    expect(fd.get('nome')).toBe('Suco');
    expect(fd.get('custo')).toBe('15');
    expect(fd.get('quantidade')).toBe('0');
    expect(fd.get('foto')).toBeInstanceOf(File);
  });
});

describe('MinhasVantagens', () => {
  const rotas = (extra = {}) => ({
    ...sessao(USUARIOS.empresa),
    'GET /api/vantagens/minhas': DO_RESTAURANTE,
    'GET /api/resgates': [RESGATE],
    ...extra,
  });

  it('impede excluir vantagem já resgatada e mostra o total de resgates', async () => {
    mockApi(rotas());
    renderizarApp('/empresa/vantagens');
    expect(await screen.findByRole('button', { name: 'Excluir Café com pão de queijo' })).toBeDisabled();
    expect(screen.getByText('1 resgate(s)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Excluir Almoço executivo grátis' })).toBeEnabled();
  });

  it('exige a foto ao cadastrar e envia o formulário multipart', async () => {
    const fetchMock = mockApi(rotas({ 'POST /api/vantagens': { ...VANTAGENS[0], id: 99, nome: 'Suco natural' } }));
    renderizarApp('/empresa/vantagens');
    await userEvent.click(await screen.findByRole('button', { name: 'Nova vantagem' }));
    const dialogo = screen.getByRole('dialog', { name: 'Nova vantagem' });

    await userEvent.type(within(dialogo).getByLabelText(/Nome da vantagem/), 'Suco natural');
    await userEvent.type(within(dialogo).getByLabelText(/Descrição/), 'Copo de 300 ml');
    await userEvent.type(within(dialogo).getByLabelText(/Custo/), '15');
    await userEvent.type(within(dialogo).getByLabelText(/Quantidade em estoque/), '30');
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Cadastrar vantagem' }));
    expect(within(dialogo).getByText('Selecione a foto do produto.')).toBeInTheDocument();

    const foto = new File(['png'], 'suco.png', { type: 'image/png' });
    await userEvent.upload(within(dialogo).getByLabelText(/Foto do produto/), foto);
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Cadastrar vantagem' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    const [, opcoes] = fetchMock.mock.calls.find(([u, o = {}]) => u === '/api/vantagens' && o.method === 'POST');
    expect(opcoes.body).toBeInstanceOf(FormData);
    expect(opcoes.body.get('nome')).toBe('Suco natural');
    expect(opcoes.body.get('foto').name).toBe('suco.png');
  });

  it('exclui uma vantagem sem resgates após confirmação', async () => {
    const fetchMock = mockApi(rotas({ 'DELETE /api/vantagens/2': null }));
    renderizarApp('/empresa/vantagens');
    await userEvent.click(await screen.findByRole('button', { name: 'Excluir Almoço executivo grátis' }));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(fetchMock.mock.calls.some(([u, o = {}]) => u === '/api/vantagens/2' && o.method === 'DELETE')).toBe(true));
    expect(await screen.findByText('Vantagem excluída.')).toBeInTheDocument();
  });
});
