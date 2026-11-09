'use strict';

/* ==========================================================================
   TOKEN — Front-end (View da arquitetura MVC)
   Comunica-se com a API REST do Spring Boot via fetch; a sessão é mantida
   pelo cookie JSESSIONID após o login.
   ========================================================================== */

const estado = { usuario: null, instituicoes: [], cursos: [] };

const $app = document.getElementById('app');
const $banner = document.getElementById('status-banner');
const $userArea = document.getElementById('user-area');
let bannerTimer;

const TIPO_LABEL = { ALUNO: 'Aluno', PROFESSOR: 'Professor', EMPRESA: 'Empresa parceira' };
const TIPO_TRANSACAO = { ENVIO: 'Envio', RECEBIMENTO: 'Recebimento', RESGATE: 'Resgate' };

const DEMO = [
    { tipo: 'Professor', nome: 'Profa. Milena (PUC Minas)', login: 'milena.adao', senha: 'senha123' },
    { tipo: 'Professor', nome: 'Prof. Carlos (UFMG)', login: 'carlos.silva', senha: 'senha123' },
    { tipo: 'Aluno', nome: 'Lucas Oliveira (PUC Minas)', login: 'lucas.santos', senha: 'aluno123' },
    { tipo: 'Aluno', nome: 'Mariana Alves (PUC Minas)', login: 'mariana.alves', senha: 'aluno123' },
    { tipo: 'Empresa', nome: 'Livraria Universitária', login: 'livraria.univ', senha: 'empresa123' },
    { tipo: 'Empresa', nome: 'Restaurante Sabor do Campus', login: 'restaurante.campus', senha: 'empresa123' },
];

/* ------------------------------------------------------------------ Utilitários */

function esc(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, c => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
}

function fmtData(iso) {
    return iso ? new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—';
}

function fmtMoedas(n) {
    const v = Number(n) || 0;
    return `${v.toLocaleString('pt-BR')} ${Math.abs(v) === 1 ? 'moeda' : 'moedas'}`;
}

function mostrarStatus(mensagem, tipo = 'success') {
    $banner.textContent = mensagem;
    $banner.className = `status-banner ${tipo}`;
    $banner.hidden = false;
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => { $banner.hidden = true; }, tipo === 'error' ? 9000 : 6000);
    $banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function api(url, { method = 'GET', json, form } = {}) {
    const opcoes = { method, headers: { Accept: 'application/json' } };
    if (form) {
        opcoes.body = form;
    } else if (json !== undefined) {
        opcoes.headers['Content-Type'] = 'application/json';
        opcoes.body = JSON.stringify(json);
    }

    const resposta = await fetch(url, opcoes);
    if (resposta.status === 204) return null;
    const dados = await resposta.json().catch(() => null);

    if (!resposta.ok) {
        if (resposta.status === 401 && estado.usuario && !url.startsWith('/api/auth/')) {
            estado.usuario = null;
            renderLogin();
        }
        throw new Error(dados?.erro || `Erro ${resposta.status} ao comunicar com o servidor.`);
    }
    return dados;
}

async function carregarCatalogos() {
    if (estado.instituicoes.length && estado.cursos.length) return;
    [estado.instituicoes, estado.cursos] = await Promise.all([api('/api/instituicoes'), api('/api/cursos')]);
}

/* ------------------------------------------------------------------ Componentes */

function campo(o) {
    const {
        id, label, name = id, type = 'text', value = '', required = true,
        hint = '', erro = '', attrs = '', options = null,
    } = o;
    const req = required ? ' <span class="req" aria-hidden="true">*</span>' : '';
    const descr = hint ? ` aria-describedby="hint-${id}"` : '';
    const errAttr = erro ? ` aria-errormessage="err-${id}"` : '';
    const reqAttr = required ? ' required' : '';
    const comuns = `id="${id}" name="${name}"${reqAttr}${descr}${errAttr} ${attrs}`;

    let controle;
    if (options) {
        controle = `<select ${comuns}><option value="">Selecione...</option>${options.map(op =>
            `<option value="${esc(op.value)}"${String(op.value) === String(value ?? '') ? ' selected' : ''}>${esc(op.label)}</option>`
        ).join('')}</select>`;
    } else if (type === 'textarea') {
        controle = `<textarea ${comuns}>${esc(value)}</textarea>`;
    } else if (type === 'password') {
        controle = `<div class="password-wrapper"><input type="password" ${comuns}>
            <button type="button" class="btn-toggle-pwd" data-target="${id}" aria-pressed="false" aria-label="Mostrar senha">👁️</button></div>`;
    } else if (type === 'file') {
        controle = `<input type="file" ${comuns}>`;
    } else {
        controle = `<input type="${type}" value="${esc(value)}" ${comuns}>`;
    }

    return `<div class="field">
        <label for="${id}">${esc(label)}${req}</label>
        ${hint ? `<span id="hint-${id}" class="hint">${esc(hint)}</span>` : ''}
        ${controle}
        ${erro ? `<div id="err-${id}" class="error-msg"><span aria-hidden="true">❌</span> ${esc(erro)}</div>` : ''}
    </div>`;
}

/** Valida o formulário no navegador e executa o handler, exibindo erros da API no banner. */
function aoEnviar(form, handler) {
    form.addEventListener('submit', async evento => {
        evento.preventDefault();
        form.classList.add('was-validated');
        if (!form.checkValidity()) {
            form.querySelector(':invalid')?.focus();
            return;
        }
        const botao = form.querySelector('[type="submit"]');
        botao.disabled = true;
        try {
            await handler(new FormData(form));
        } catch (erro) {
            mostrarStatus(erro.message, 'error');
        } finally {
            botao.disabled = false;
        }
    });
}

function formObj(fd) {
    return Object.fromEntries(fd.entries());
}

function stat(rotulo, valor, classe = '') {
    return `<div class="stat-card ${classe}">
        <span class="stat-label">${esc(rotulo)}</span>
        <span class="stat-valor">${esc(valor ?? '—')}</span>
    </div>`;
}

function vazio(mensagem) {
    return `<p class="vazio">${esc(mensagem)}</p>`;
}

/** Tabela responsiva. Células podem ser texto (escapado) ou { html }. */
function tabela(cabecalhos, linhas, legenda) {
    const celula = (c, i) => `<td data-label="${esc(cabecalhos[i])}">${c && typeof c === 'object' ? c.html : esc(c)}</td>`;
    return `<div class="table-wrapper" tabindex="0" role="region" aria-label="${esc(legenda)}">
        <table class="data-table">
            <caption class="visually-hidden">${esc(legenda)}</caption>
            <thead><tr>${cabecalhos.map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
            <tbody>${linhas.map(l => `<tr>${l.map(celula).join('')}</tr>`).join('')}</tbody>
        </table>
    </div>`;
}

function cardVantagem(v, acoes) {
    return `<article class="vantagem-card">
        ${v.fotoUrl
            ? `<img src="${esc(v.fotoUrl)}" alt="Foto: ${esc(v.nome)}" loading="lazy">`
            : '<div class="foto-placeholder" aria-hidden="true">🎁</div>'}
        <div class="vantagem-corpo">
            <p class="vantagem-empresa">${esc(v.empresaNome)}</p>
            <h3>${esc(v.nome)}</h3>
            <p class="vantagem-desc">${esc(v.descricao)}</p>
            <div class="vantagem-meta">
                <span class="badge-coins">${fmtMoedas(v.custo)}</span>
                <span class="badge ${v.disponivel ? 'badge-ok' : 'badge-muted'}">
                    ${v.disponivel ? `${v.quantidade} em estoque` : 'Esgotada'}
                </span>
            </div>
            <div class="vantagem-acoes">${acoes}</div>
        </div>
    </article>`;
}

/** Abas acessíveis. Retorna a função para selecionar uma aba pelo id. */
function abas(container, lista, inicial) {
    container.innerHTML = `
        <div class="tabs" role="tablist">
            ${lista.map(a => `<button type="button" role="tab" class="tab-btn" id="tab-${a.id}"
                aria-controls="painel-${container.id}" aria-selected="false">${esc(a.rotulo)}</button>`).join('')}
        </div>
        <div class="tab-panel" id="painel-${container.id}" role="tabpanel"></div>`;
    const painel = container.querySelector('.tab-panel');

    const selecionar = async id => {
        container.querySelectorAll('.tab-btn').forEach(b => {
            const ativo = b.id === `tab-${id}`;
            b.classList.toggle('active', ativo);
            b.setAttribute('aria-selected', String(ativo));
        });
        painel.setAttribute('aria-labelledby', `tab-${id}`);
        painel.innerHTML = '<p class="loading">Carregando...</p>';
        try {
            await lista.find(a => a.id === id).render(painel);
        } catch (erro) {
            painel.innerHTML = `<div class="card">${vazio(erro.message)}</div>`;
        }
    };

    container.querySelectorAll('.tab-btn').forEach(b =>
        b.addEventListener('click', () => selecionar(b.id.replace('tab-', ''))));
    selecionar(inicial || lista[0].id);
    return selecionar;
}

/* ------------------------------------------------------------------ Cabeçalho / sessão */

function atualizarHeader() {
    const u = estado.usuario;
    $userArea.hidden = !u;
    if (u) {
        document.getElementById('user-nome').textContent = u.nome;
        document.getElementById('user-tipo').textContent = TIPO_LABEL[u.tipo] || u.tipo;
    }
}

document.getElementById('btn-logout').addEventListener('click', async () => {
    try { await api('/api/auth/logout', { method: 'POST' }); } catch { /* sessão já encerrada */ }
    estado.usuario = null;
    renderLogin();
    mostrarStatus('Você saiu do sistema.');
});

document.addEventListener('click', evento => {
    const botao = evento.target.closest('.btn-toggle-pwd');
    if (!botao) return;
    const input = document.getElementById(botao.dataset.target);
    const mostrar = input.type === 'password';
    input.type = mostrar ? 'text' : 'password';
    botao.setAttribute('aria-pressed', String(mostrar));
    botao.setAttribute('aria-label', mostrar ? 'Ocultar senha' : 'Mostrar senha');
});

async function excluirConta(url) {
    if (!confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) return;
    try {
        await api(url, { method: 'DELETE' });
        estado.usuario = null;
        renderLogin();
        mostrarStatus('Conta excluída com sucesso.');
    } catch (erro) {
        mostrarStatus(erro.message, 'error');
    }
}

function renderPainel() {
    atualizarHeader();
    const telas = { ALUNO: renderAluno, PROFESSOR: renderProfessor, EMPRESA: renderEmpresa };
    (telas[estado.usuario.tipo] || renderLogin)();
}

/* ------------------------------------------------------------------ Login e cadastros */

function renderLogin() {
    atualizarHeader();
    $app.innerHTML = `
        <section class="auth-layout">
            <div>
                <div class="section-header">
                    <h2>Bem-vindo ao TOKEN</h2>
                    <p>Professores reconhecem o mérito dos alunos com moedas, que podem ser trocadas por vantagens em empresas parceiras.</p>
                </div>
                <div class="card" id="auth-card"></div>
            </div>
            <aside class="card demo-card" aria-labelledby="demo-titulo">
                <h3 id="demo-titulo">Usuários de demonstração</h3>
                <p class="hint">Clique em um usuário para preencher o login.</p>
                <ul class="demo-list">
                    ${DEMO.map(d => `<li><button type="button" class="demo-btn" data-login="${d.login}" data-senha="${d.senha}">
                        <span class="demo-tipo">${esc(d.tipo)}</span>
                        <strong>${esc(d.nome)}</strong>
                        <code>${esc(d.login)} / ${esc(d.senha)}</code>
                    </button></li>`).join('')}
                </ul>
            </aside>
        </section>`;

    const selecionar = abas(document.getElementById('auth-card'), [
        { id: 'entrar', rotulo: 'Entrar', render: renderFormLogin },
        { id: 'cad-aluno', rotulo: 'Sou aluno: criar conta', render: p => renderFormAluno(p, null) },
        { id: 'cad-empresa', rotulo: 'Sou empresa: criar conta', render: p => renderFormEmpresa(p, null) },
    ]);

    $app.querySelectorAll('.demo-btn').forEach(b => b.addEventListener('click', async () => {
        await selecionar('entrar');
        document.getElementById('login-login').value = b.dataset.login;
        document.getElementById('login-senha').value = b.dataset.senha;
        document.querySelector('#form-login [type="submit"]').focus();
    }));
}

async function renderFormLogin(painel) {
    painel.innerHTML = `
        <form id="form-login" novalidate>
            ${campo({ id: 'login-login', name: 'login', label: 'Login', attrs: 'autocomplete="username" autocapitalize="off" spellcheck="false"', erro: 'Informe o login.' })}
            ${campo({ id: 'login-senha', name: 'senha', type: 'password', label: 'Senha', attrs: 'autocomplete="current-password"', erro: 'Informe a senha.' })}
            <div class="form-actions"><button type="submit" class="btn btn-primary">Entrar</button></div>
        </form>`;

    aoEnviar(painel.querySelector('form'), async fd => {
        estado.usuario = await api('/api/auth/login', { method: 'POST', json: formObj(fd) });
        renderPainel();
        mostrarStatus(`Bem-vindo(a), ${estado.usuario.nome}!`);
    });
}

async function renderFormAluno(painel, aluno) {
    await carregarCatalogos();
    const edicao = Boolean(aluno);
    const a = aluno || {};

    painel.innerHTML = `
        <form novalidate>
            <fieldset>
                <legend>${edicao ? 'Meus dados cadastrais' : 'Cadastro de aluno'}</legend>
                ${campo({ id: 'aluno-nome', name: 'nome', label: 'Nome completo', value: a.nome, attrs: 'maxlength="120" autocomplete="name"', erro: 'Informe o nome completo.' })}
                <div class="field-row">
                    ${campo({ id: 'aluno-email', name: 'email', type: 'email', label: 'E-mail', value: a.email, hint: 'Você receberá aqui as moedas e os cupons', attrs: 'autocomplete="email" autocapitalize="off" spellcheck="false"', erro: 'Informe um e-mail válido.' })}
                    ${campo({ id: 'aluno-matricula', name: 'matricula', label: 'Matrícula', required: false, value: a.matricula, hint: 'Opcional, apenas números', attrs: 'inputmode="numeric" pattern="[0-9]*" maxlength="9"', erro: 'Use apenas números.' })}
                </div>
                <div class="field-row">
                    ${campo({ id: 'aluno-cpf', name: 'cpf', label: 'CPF', value: a.cpf, hint: 'Ex.: 123.456.789-09', attrs: 'inputmode="numeric" minlength="11" maxlength="14"', erro: 'Informe um CPF válido.' })}
                    ${campo({ id: 'aluno-rg', name: 'rg', label: 'RG', value: a.rg, hint: 'Ex.: MG-12.345.678', attrs: 'maxlength="20"', erro: 'Informe o RG.' })}
                </div>
                ${campo({ id: 'aluno-endereco', name: 'endereco', type: 'textarea', label: 'Endereço completo', value: a.endereco, attrs: 'rows="2" maxlength="255" autocomplete="street-address"', erro: 'Informe o endereço.' })}
                <div class="field-row">
                    ${campo({ id: 'aluno-instituicao', name: 'instituicaoId', label: 'Instituição de ensino', value: a.instituicaoId, hint: 'Instituições parceiras', options: estado.instituicoes.map(i => ({ value: i.id, label: i.nome })), erro: 'Selecione a instituição.' })}
                    ${campo({ id: 'aluno-curso', name: 'curso', label: 'Curso', value: a.curso, hint: 'Curso de graduação', options: estado.cursos.map(c => ({ value: c.codigo, label: c.nome })), erro: 'Selecione o curso.' })}
                </div>
                <div class="field-row">
                    ${campo({ id: 'aluno-login', name: 'login', label: 'Login de acesso', value: a.login, hint: 'Usado para entrar no sistema', attrs: 'minlength="3" maxlength="50" autocomplete="username" autocapitalize="off" spellcheck="false"', erro: 'O login deve ter pelo menos 3 caracteres.' })}
                    ${campo({ id: 'aluno-senha', name: 'senha', type: 'password', label: edicao ? 'Nova senha' : 'Senha', required: !edicao, hint: edicao ? 'Deixe em branco para manter a atual' : 'Mínimo de 6 caracteres', attrs: 'minlength="6" autocomplete="new-password"', erro: 'A senha deve ter pelo menos 6 caracteres.' })}
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">${edicao ? 'Salvar alterações' : 'Criar minha conta'}</button>
                    ${edicao ? '<button type="button" class="btn btn-delete" data-acao="excluir">Excluir minha conta</button>' : ''}
                </div>
            </fieldset>
        </form>`;

    aoEnviar(painel.querySelector('form'), async fd => {
        const dados = formObj(fd);
        dados.instituicaoId = Number(dados.instituicaoId);
        dados.matricula = dados.matricula ? Number(dados.matricula) : null;
        if (!dados.senha) dados.senha = null;

        if (edicao) {
            const atualizado = await api('/api/alunos/me', { method: 'PUT', json: dados });
            estado.usuario = { ...estado.usuario, nome: atualizado.nome, login: atualizado.login };
            atualizarHeader();
            mostrarStatus('Cadastro atualizado com sucesso.');
            await renderFormAluno(painel, atualizado);
        } else {
            await api('/api/alunos', { method: 'POST', json: dados });
            estado.usuario = await api('/api/auth/login', { method: 'POST', json: { login: dados.login, senha: dados.senha } });
            renderPainel();
            mostrarStatus('Conta criada! Você já está conectado(a).');
        }
    });

    painel.querySelector('[data-acao="excluir"]')?.addEventListener('click', () => excluirConta('/api/alunos/me'));
}

async function renderFormEmpresa(painel, empresa) {
    const edicao = Boolean(empresa);
    const e = empresa || {};

    painel.innerHTML = `
        <form novalidate>
            <fieldset>
                <legend>${edicao ? 'Dados da empresa' : 'Cadastro de empresa parceira'}</legend>
                ${campo({ id: 'empresa-nome', name: 'nome', label: 'Razão social / nome fantasia', value: e.nome, attrs: 'maxlength="120" autocomplete="organization"', erro: 'Informe o nome da empresa.' })}
                <div class="field-row">
                    ${campo({ id: 'empresa-cnpj', name: 'cnpj', label: 'CNPJ', value: e.cnpj, hint: 'Ex.: 12.345.678/0001-95', attrs: 'inputmode="numeric" minlength="14" maxlength="18"', erro: 'Informe um CNPJ válido.' })}
                    ${campo({ id: 'empresa-email', name: 'email', type: 'email', label: 'E-mail corporativo', value: e.email, hint: 'Recebe a confirmação de cada resgate', attrs: 'autocomplete="email" autocapitalize="off" spellcheck="false"', erro: 'Informe um e-mail válido.' })}
                </div>
                ${campo({ id: 'empresa-descricao', name: 'descricao', type: 'textarea', label: 'Descrição da empresa e da parceria', value: e.descricao, attrs: 'rows="3" maxlength="1000"', erro: 'Informe a descrição.' })}
                <div class="field-row">
                    ${campo({ id: 'empresa-login', name: 'login', label: 'Login de acesso', value: e.login, attrs: 'minlength="3" maxlength="50" autocomplete="username" autocapitalize="off" spellcheck="false"', erro: 'O login deve ter pelo menos 3 caracteres.' })}
                    ${campo({ id: 'empresa-senha', name: 'senha', type: 'password', label: edicao ? 'Nova senha' : 'Senha', required: !edicao, hint: edicao ? 'Deixe em branco para manter a atual' : 'Mínimo de 6 caracteres', attrs: 'minlength="6" autocomplete="new-password"', erro: 'A senha deve ter pelo menos 6 caracteres.' })}
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">${edicao ? 'Salvar alterações' : 'Cadastrar empresa'}</button>
                    ${edicao ? '<button type="button" class="btn btn-delete" data-acao="excluir">Excluir cadastro da empresa</button>' : ''}
                </div>
            </fieldset>
        </form>`;

    aoEnviar(painel.querySelector('form'), async fd => {
        const dados = formObj(fd);
        if (!dados.senha) dados.senha = null;

        if (edicao) {
            const atualizada = await api('/api/empresas/me', { method: 'PUT', json: dados });
            estado.usuario = { ...estado.usuario, nome: atualizada.nome, login: atualizada.login };
            atualizarHeader();
            mostrarStatus('Cadastro da empresa atualizado com sucesso.');
            await renderFormEmpresa(painel, atualizada);
        } else {
            await api('/api/empresas', { method: 'POST', json: dados });
            estado.usuario = await api('/api/auth/login', { method: 'POST', json: { login: dados.login, senha: dados.senha } });
            renderPainel();
            mostrarStatus('Empresa cadastrada! Agora cadastre as vantagens que deseja oferecer.');
        }
    });

    painel.querySelector('[data-acao="excluir"]')?.addEventListener('click', () => excluirConta('/api/empresas/me'));
}

/* ------------------------------------------------------------------ Extrato (aluno e professor) */

async function renderExtrato(painel) {
    const extrato = await api('/api/extrato');
    const linhas = extrato.transacoes.map(t => [
        fmtData(t.dataHora),
        TIPO_TRANSACAO[t.tipo] || t.tipo,
        { html: `${esc(t.descricao)}${t.codigoCupom ? `<br><code class="cupom-inline">${esc(t.codigoCupom)}</code>` : ''}` },
        t.contraparte,
        { html: `<span class="${t.valor >= 0 ? 'valor-pos' : 'valor-neg'}">${t.valor > 0 ? '+' : ''}${t.valor.toLocaleString('pt-BR')}</span>` },
    ]);
    painel.innerHTML = `
        <div class="card">
            <div class="list-header">
                <h3>Extrato de moedas</h3>
                <span class="badge-coins">Saldo: ${fmtMoedas(extrato.saldo)}</span>
            </div>
            ${linhas.length
                ? tabela(['Data', 'Tipo', 'Descrição', estado.usuario.tipo === 'PROFESSOR' ? 'Aluno' : 'Origem', 'Moedas'], linhas, 'Extrato de transações')
                : vazio('Nenhuma movimentação até o momento.')}
        </div>`;
}

/* ------------------------------------------------------------------ Painel do aluno */

function renderAluno() {
    $app.innerHTML = `
        <div class="section-header">
            <h2>Painel do aluno</h2>
            <p>Acompanhe suas moedas e troque-as por vantagens das empresas parceiras.</p>
        </div>
        <div class="stats" id="resumo"></div>
        <div id="abas-aluno"></div>`;

    const atualizarResumo = async () => {
        const a = await api('/api/alunos/me');
        document.getElementById('resumo').innerHTML =
            stat('Saldo disponível', fmtMoedas(a.saldo), 'destaque') +
            stat('Instituição', a.instituicaoNome) +
            stat('Curso', a.cursoNome);
    };
    atualizarResumo().catch(e => mostrarStatus(e.message, 'error'));

    abas(document.getElementById('abas-aluno'), [
        { id: 'vantagens', rotulo: '🎁 Trocar moedas', render: p => renderCatalogo(p, atualizarResumo) },
        { id: 'extrato', rotulo: '📄 Extrato', render: renderExtrato },
        { id: 'cupons', rotulo: '🎟️ Meus cupons', render: renderCuponsAluno },
        { id: 'perfil', rotulo: '👤 Meu cadastro', render: async p => renderFormAluno(p, await api('/api/alunos/me')) },
    ]);
}

async function renderCatalogo(painel, atualizarResumo, ultimoResgate = null) {
    const [vantagens, aluno] = await Promise.all([api('/api/vantagens'), api('/api/alunos/me')]);

    const botao = v => {
        const semSaldo = v.custo > aluno.saldo;
        const rotulo = !v.disponivel ? 'Esgotada' : semSaldo ? 'Saldo insuficiente' : 'Resgatar';
        return `<button type="button" class="btn btn-primary btn-sm" data-resgatar="${v.id}"
            ${!v.disponivel || semSaldo ? 'disabled' : ''}>${rotulo}</button>`;
    };

    painel.innerHTML = `
        ${ultimoResgate ? `
            <div class="card cupom-card" id="cupom-gerado" tabindex="-1">
                <h3>🎉 Resgate realizado!</h3>
                <p>Apresente este código na empresa <strong>${esc(ultimoResgate.empresaNome)}</strong>.
                   Ele também foi enviado para o seu e-mail.</p>
                <p class="cupom-code">${esc(ultimoResgate.codigoCupom)}</p>
                <p class="hint">${esc(ultimoResgate.vantagemNome)} · ${fmtMoedas(ultimoResgate.valor)} ·
                   saldo restante: ${fmtMoedas(ultimoResgate.saldoAluno)}</p>
            </div>` : ''}
        ${vantagens.length
            ? `<div class="vantagens-grid">${vantagens.map(v => cardVantagem(v, botao(v))).join('')}</div>`
            : `<div class="card">${vazio('Nenhuma vantagem cadastrada pelas empresas parceiras ainda.')}</div>`}`;

    if (ultimoResgate) document.getElementById('cupom-gerado').focus();

    painel.querySelectorAll('[data-resgatar]').forEach(b => b.addEventListener('click', async () => {
        const v = vantagens.find(x => String(x.id) === b.dataset.resgatar);
        if (!confirm(`Resgatar "${v.nome}" por ${fmtMoedas(v.custo)}?`)) return;
        b.disabled = true;
        try {
            const resgate = await api('/api/resgates', { method: 'POST', json: { vantagemId: v.id } });
            await atualizarResumo();
            await renderCatalogo(painel, atualizarResumo, resgate);
        } catch (erro) {
            mostrarStatus(erro.message, 'error');
            b.disabled = false;
        }
    }));
}

async function renderCuponsAluno(painel) {
    const resgates = await api('/api/resgates');
    const linhas = resgates.map(r => [
        { html: `<code class="cupom-inline">${esc(r.codigoCupom)}</code>` },
        r.vantagemNome,
        r.empresaNome,
        fmtMoedas(r.valor),
        fmtData(r.dataHora),
        { html: r.utilizado
            ? `<span class="badge badge-muted">Utilizado em ${esc(fmtData(r.dataUtilizacao))}</span>`
            : '<span class="badge badge-ok">Disponível</span>' },
    ]);
    painel.innerHTML = `
        <div class="card">
            <div class="list-header"><h3>Meus cupons</h3></div>
            ${linhas.length
                ? tabela(['Código', 'Vantagem', 'Empresa', 'Custo', 'Resgatado em', 'Situação'], linhas, 'Cupons resgatados')
                : vazio('Você ainda não resgatou nenhuma vantagem.')}
        </div>`;
}

/* ------------------------------------------------------------------ Painel do professor */

function renderProfessor() {
    $app.innerHTML = `
        <div class="section-header">
            <h2>Painel do professor</h2>
            <p>Reconheça o mérito dos seus alunos enviando moedas. Você recebe 1.000 moedas por semestre (acumuláveis).</p>
        </div>
        <div class="stats" id="resumo"></div>
        <div id="abas-professor"></div>`;

    const atualizarResumo = async () => {
        const p = await api('/api/professores/me');
        document.getElementById('resumo').innerHTML =
            stat('Saldo disponível', fmtMoedas(p.saldo), 'destaque') +
            stat('Instituição', p.instituicaoNome) +
            stat('Departamento', p.departamentoNome) +
            stat('Último crédito semestral', p.ultimoSemestreCreditado);
    };
    atualizarResumo().catch(e => mostrarStatus(e.message, 'error'));

    abas(document.getElementById('abas-professor'), [
        { id: 'enviar', rotulo: '🪙 Enviar moedas', render: p => renderEnviarMoedas(p, atualizarResumo) },
        { id: 'extrato', rotulo: '📄 Extrato de envios', render: renderExtrato },
    ]);
}

async function renderEnviarMoedas(painel, atualizarResumo) {
    const [alunos, professor] = await Promise.all([api('/api/alunos'), api('/api/professores/me')]);
    const semSaldo = professor.saldo < 1;

    painel.innerHTML = `
        <div class="card narrow">
            <form novalidate>
                <fieldset>
                    <legend>Reconhecer um aluno</legend>
                    ${alunos.length ? '' : vazio('Nenhum aluno da sua instituição está cadastrado ainda.')}
                    ${campo({ id: 'envio-aluno', name: 'alunoId', label: 'Aluno', hint: 'Alunos da sua instituição',
                        options: alunos.map(a => ({ value: a.id, label: `${a.nome} — ${a.cursoNome}${a.matricula ? ` (mat. ${a.matricula})` : ''}` })),
                        erro: 'Selecione o aluno.' })}
                    ${campo({ id: 'envio-valor', name: 'valor', type: 'number', label: 'Quantidade de moedas',
                        hint: `Seu saldo: ${fmtMoedas(professor.saldo)}`,
                        attrs: `min="1" max="${Math.max(professor.saldo, 1)}" step="1" inputmode="numeric"`,
                        erro: `Informe um valor entre 1 e ${professor.saldo}.` })}
                    ${campo({ id: 'envio-motivo', name: 'motivo', type: 'textarea', label: 'Motivo do reconhecimento',
                        hint: 'Obrigatório. O aluno verá esta mensagem no e-mail e no extrato.',
                        attrs: 'rows="3" maxlength="500"', erro: 'Informe o motivo do reconhecimento.' })}
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary" ${semSaldo || !alunos.length ? 'disabled' : ''}>Enviar moedas</button>
                    </div>
                </fieldset>
            </form>
        </div>`;

    aoEnviar(painel.querySelector('form'), async fd => {
        const d = formObj(fd);
        const t = await api('/api/transacoes', {
            method: 'POST',
            json: { alunoId: Number(d.alunoId), valor: Number(d.valor), motivo: d.motivo },
        });
        mostrarStatus(`${fmtMoedas(t.valor)} enviadas para ${t.alunoNome}. O aluno foi notificado por e-mail.`);
        await atualizarResumo();
        await renderEnviarMoedas(painel, atualizarResumo);
    });
}

/* ------------------------------------------------------------------ Painel da empresa */

function renderEmpresa() {
    $app.innerHTML = `
        <div class="section-header">
            <h2>Painel da empresa parceira</h2>
            <p>Cadastre as vantagens oferecidas aos alunos e confira os cupons apresentados na troca presencial.</p>
        </div>
        <div id="abas-empresa"></div>`;

    abas(document.getElementById('abas-empresa'), [
        { id: 'vantagens', rotulo: '🎁 Minhas vantagens', render: p => renderVantagensEmpresa(p) },
        { id: 'cupons', rotulo: '🎟️ Conferir cupons', render: p => renderCuponsEmpresa(p) },
        { id: 'perfil', rotulo: '🏢 Meu cadastro', render: async p => renderFormEmpresa(p, await api('/api/empresas/me')) },
    ]);
}

async function renderVantagensEmpresa(painel, emEdicao = null) {
    const vantagens = await api('/api/vantagens/minhas');
    const v = emEdicao || {};

    painel.innerHTML = `
        <div class="crud-grid">
            <div class="card">
                <form novalidate>
                    <fieldset>
                        <legend>${emEdicao ? 'Editar vantagem' : 'Nova vantagem'}</legend>
                        ${campo({ id: 'vant-nome', name: 'nome', label: 'Nome da vantagem', value: v.nome, attrs: 'maxlength="120"', erro: 'Informe o nome.' })}
                        ${campo({ id: 'vant-descricao', name: 'descricao', type: 'textarea', label: 'Descrição', value: v.descricao, attrs: 'rows="3" maxlength="1000"', erro: 'Informe a descrição.' })}
                        <div class="field-row">
                            ${campo({ id: 'vant-custo', name: 'custo', type: 'number', label: 'Custo (moedas)', value: v.custo, attrs: 'min="1" step="1" inputmode="numeric"', erro: 'Mínimo de 1 moeda.' })}
                            ${campo({ id: 'vant-quantidade', name: 'quantidade', type: 'number', label: 'Quantidade em estoque', value: v.quantidade, attrs: 'min="0" step="1" inputmode="numeric"', erro: 'Informe 0 ou mais.' })}
                        </div>
                        ${emEdicao && v.fotoUrl ? `<img class="foto-atual" src="${esc(v.fotoUrl)}" alt="Foto atual da vantagem">` : ''}
                        ${campo({ id: 'vant-foto', name: 'foto', type: 'file', label: emEdicao ? 'Trocar foto' : 'Foto do produto', required: !emEdicao,
                            hint: emEdicao ? 'Opcional. PNG, JPEG, WEBP ou GIF, até 2 MB' : 'PNG, JPEG, WEBP ou GIF, até 2 MB',
                            attrs: 'accept="image/png,image/jpeg,image/webp,image/gif"', erro: 'Selecione a foto do produto.' })}
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">${emEdicao ? 'Salvar alterações' : 'Cadastrar vantagem'}</button>
                            ${emEdicao ? '<button type="button" class="btn btn-secondary" data-acao="cancelar">Cancelar edição</button>' : ''}
                        </div>
                    </fieldset>
                </form>
            </div>
            <div>
                <div class="list-header"><h3>Vantagens cadastradas (${vantagens.length})</h3></div>
                ${vantagens.length
                    ? `<div class="vantagens-grid compacto">${vantagens.map(x => cardVantagem(x, `
                        <button type="button" class="btn btn-sm btn-edit" data-editar="${x.id}">Editar</button>
                        <button type="button" class="btn btn-sm btn-delete" data-excluir="${x.id}">Excluir</button>`)).join('')}</div>`
                    : `<div class="card">${vazio('Nenhuma vantagem cadastrada. Use o formulário para criar a primeira.')}</div>`}
            </div>
        </div>`;

    const form = painel.querySelector('form');
    if (emEdicao) form.querySelector('#vant-nome').focus();

    aoEnviar(form, async fd => {
        const foto = fd.get('foto');
        if (foto instanceof File && foto.size === 0) fd.delete('foto');
        if (foto instanceof File && foto.size > 2 * 1024 * 1024) throw new Error('A foto deve ter no máximo 2 MB.');

        if (emEdicao) {
            await api(`/api/vantagens/${emEdicao.id}`, { method: 'PUT', form: fd });
            mostrarStatus('Vantagem atualizada.');
        } else {
            await api('/api/vantagens', { method: 'POST', form: fd });
            mostrarStatus('Vantagem cadastrada e disponível no catálogo dos alunos.');
        }
        await renderVantagensEmpresa(painel);
    });

    painel.querySelector('[data-acao="cancelar"]')?.addEventListener('click', () => renderVantagensEmpresa(painel));

    painel.querySelectorAll('[data-editar]').forEach(b => b.addEventListener('click', () =>
        renderVantagensEmpresa(painel, vantagens.find(x => String(x.id) === b.dataset.editar))));

    painel.querySelectorAll('[data-excluir]').forEach(b => b.addEventListener('click', async () => {
        const alvo = vantagens.find(x => String(x.id) === b.dataset.excluir);
        if (!confirm(`Excluir a vantagem "${alvo.nome}"?`)) return;
        try {
            await api(`/api/vantagens/${alvo.id}`, { method: 'DELETE' });
            mostrarStatus('Vantagem excluída.');
            await renderVantagensEmpresa(painel);
        } catch (erro) {
            mostrarStatus(erro.message, 'error');
        }
    }));
}

async function renderCuponsEmpresa(painel, cupomExibido = null) {
    const resgates = await api('/api/resgates');
    const linhas = resgates.map(r => [
        { html: `<code class="cupom-inline">${esc(r.codigoCupom)}</code>` },
        r.vantagemNome,
        r.alunoNome,
        fmtData(r.dataHora),
        { html: r.utilizado
            ? '<span class="badge badge-muted">Utilizado</span>'
            : '<span class="badge badge-ok">Pendente</span>' },
    ]);

    painel.innerHTML = `
        <div class="crud-grid">
            <div class="card">
                <form novalidate>
                    <fieldset>
                        <legend>Conferir cupom</legend>
                        ${campo({ id: 'cupom-codigo', name: 'codigo', label: 'Código apresentado pelo aluno', hint: 'Ex.: TKN-AB12-CD34',
                            attrs: 'maxlength="20" autocapitalize="characters" autocomplete="off" spellcheck="false"', erro: 'Informe o código do cupom.' })}
                        <div class="form-actions"><button type="submit" class="btn btn-primary">Conferir</button></div>
                    </fieldset>
                </form>
                <div id="cupom-resultado" aria-live="polite"></div>
            </div>
            <div class="card">
                <div class="list-header"><h3>Resgates das suas vantagens</h3></div>
                ${linhas.length
                    ? tabela(['Código', 'Vantagem', 'Aluno', 'Resgatado em', 'Situação'], linhas, 'Resgates das vantagens da empresa')
                    : vazio('Nenhum resgate até o momento.')}
            </div>
        </div>`;

    const resultado = painel.querySelector('#cupom-resultado');
    const mostrarCupom = r => {
        resultado.innerHTML = `
            <div class="cupom-detalhe ${r.utilizado ? 'usado' : 'valido'}">
                <p class="cupom-code">${esc(r.codigoCupom)}</p>
                <dl>
                    <dt>Vantagem</dt><dd>${esc(r.vantagemNome)}</dd>
                    <dt>Aluno</dt><dd>${esc(r.alunoNome)} (${esc(r.alunoEmail)})</dd>
                    <dt>Resgatado em</dt><dd>${esc(fmtData(r.dataHora))}</dd>
                </dl>
                ${r.utilizado
                    ? `<p><strong>⚠️ Cupom já utilizado em ${esc(fmtData(r.dataUtilizacao))}.</strong></p>`
                    : '<p><strong>✅ Cupom válido.</strong></p><button type="button" class="btn btn-primary" data-acao="utilizar">Confirmar troca (marcar como utilizado)</button>'}
            </div>`;
        resultado.querySelector('[data-acao="utilizar"]')?.addEventListener('click', async () => {
            try {
                const atualizado = await api(`/api/resgates/cupom/${encodeURIComponent(r.codigoCupom)}/utilizar`, { method: 'POST' });
                mostrarStatus('Troca confirmada. Cupom marcado como utilizado.');
                await renderCuponsEmpresa(painel, atualizado);
            } catch (erro) {
                mostrarStatus(erro.message, 'error');
            }
        });
    };

    aoEnviar(painel.querySelector('form'), async fd => {
        resultado.innerHTML = '';
        mostrarCupom(await api(`/api/resgates/cupom/${encodeURIComponent(fd.get('codigo').trim())}`));
    });

    if (cupomExibido) mostrarCupom(cupomExibido);
}

/* ------------------------------------------------------------------ Inicialização */

(async function iniciar() {
    try {
        estado.usuario = await api('/api/auth/me');
        renderPainel();
    } catch {
        renderLogin();
    }
})();
