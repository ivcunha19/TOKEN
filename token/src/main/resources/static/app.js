(() => {
    // Sync aria-invalid with native CSS :user-invalid state
    const syncAria = (el) => {
        if (el && typeof el.matches === 'function' && el.form) {
            el.setAttribute('aria-invalid', el.matches(':user-invalid') ? 'true' : 'false');
        }
    };

    document.addEventListener('blur', (e) => syncAria(e.target), true);
    document.addEventListener('input', (e) => {
        if (e.target && e.target.hasAttribute && e.target.hasAttribute('aria-invalid')) {
            syncAria(e.target);
        }
    });

    // Elementos de interface
    const statusBanner = document.getElementById('status-banner');
    const tabAlunos = document.getElementById('tab-alunos');
    const tabEmpresas = document.getElementById('tab-empresas');
    const sectionAlunos = document.getElementById('section-alunos');
    const sectionEmpresas = document.getElementById('section-empresas');

    // Elementos CRUD Aluno
    const formAluno = document.getElementById('form-aluno');
    const formAlunoLegend = document.getElementById('form-aluno-legend');
    const btnSalvarAluno = document.getElementById('btn-salvar-aluno');
    const btnCancelarAluno = document.getElementById('btn-cancelar-aluno');
    const btnRecarregarAlunos = document.getElementById('btn-recarregar-alunos');
    const tbodyAlunos = document.getElementById('tbody-alunos');
    const selectInstituicao = document.getElementById('aluno-instituicao');
    const selectCurso = document.getElementById('aluno-curso');

    // Elementos CRUD Empresa
    const formEmpresa = document.getElementById('form-empresa');
    const formEmpresaLegend = document.getElementById('form-empresa-legend');
    const btnSalvarEmpresa = document.getElementById('btn-salvar-empresa');
    const btnCancelarEmpresa = document.getElementById('btn-cancelar-empresa');
    const btnRecarregarEmpresas = document.getElementById('btn-recarregar-empresas');
    const tbodyEmpresas = document.getElementById('tbody-empresas');

    let mapaCursos = {};

    function exibirMensagem(texto, tipo = 'success') {
        statusBanner.textContent = texto;
        statusBanner.className = `status-banner ${tipo}`;
        statusBanner.hidden = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
            statusBanner.hidden = true;
        }, 5000);
    }

    // Alternância de abas
    function alternarAba(abaAtiva) {
        const isAlunos = abaAtiva === 'alunos';
        tabAlunos.classList.toggle('active', isAlunos);
        tabAlunos.setAttribute('aria-selected', String(isAlunos));
        tabEmpresas.classList.toggle('active', !isAlunos);
        tabEmpresas.setAttribute('aria-selected', String(!isAlunos));
        sectionAlunos.hidden = !isAlunos;
        sectionEmpresas.hidden = isAlunos;
    }

    tabAlunos.addEventListener('click', () => alternarAba('alunos'));
    tabEmpresas.addEventListener('click', () => alternarAba('empresas'));

    // Botões de mostrar/ocultar senha
    document.querySelectorAll('.btn-toggle-pwd').forEach((btn) => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (!input) return;
            const mostrar = input.type === 'password';
            input.type = mostrar ? 'text' : 'password';
            btn.setAttribute('aria-pressed', String(mostrar));
        });
    });

    // Carregar Instituições e Cursos
    async function carregarCatalogos() {
        try {
            const [resInst, resCursos] = await Promise.all([
                fetch('/api/instituicoes'),
                fetch('/api/cursos')
            ]);
            const instituicoes = await resInst.json();
            const cursos = await resCursos.json();

            selectInstituicao.replaceChildren(new Option('Selecione uma instituição...', ''));
            instituicoes.forEach((inst) => {
                selectInstituicao.appendChild(new Option(inst.nome, inst.id));
            });

            selectCurso.replaceChildren(new Option('Selecione um curso...', ''));
            cursos.forEach((c) => {
                mapaCursos[c.codigo] = c.nome;
                selectCurso.appendChild(new Option(c.nome, c.codigo));
            });
        } catch (err) {
            exibirMensagem('Erro ao carregar listas de instituições e cursos.', 'error');
        }
    }

    // ==================== CRUD DE ALUNOS ====================
    async function carregarAlunos() {
        try {
            const res = await fetch('/api/alunos');
            const alunos = await res.json();
            renderizarTabelaAlunos(alunos);
        } catch (err) {
            exibirMensagem('Não foi possível carregar os alunos.', 'error');
        }
    }

    function renderizarTabelaAlunos(alunos) {
        tbodyAlunos.replaceChildren();
        if (!alunos || alunos.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 5;
            td.className = 'empty-row';
            td.textContent = 'Nenhum aluno cadastrado até o momento.';
            tr.appendChild(td);
            tbodyAlunos.appendChild(tr);
            return;
        }

        alunos.forEach((aluno) => {
            const tr = document.createElement('tr');

            const thNome = document.createElement('th');
            thNome.scope = 'row';
            const strongNome = document.createElement('div');
            strongNome.textContent = aluno.nome;
            const smallEmail = document.createElement('div');
            smallEmail.className = 'hint';
            smallEmail.textContent = `${aluno.email} (${aluno.login})`;
            thNome.append(strongNome, smallEmail);

            const tdDoc = document.createElement('td');
            const divCpf = document.createElement('div');
            divCpf.textContent = `CPF: ${aluno.cpf}`;
            const divRg = document.createElement('div');
            divRg.className = 'hint';
            divRg.textContent = `RG: ${aluno.rg}${aluno.matricula ? ' | Mat.: ' + aluno.matricula : ''}`;
            tdDoc.append(divCpf, divRg);

            const tdInst = document.createElement('td');
            const divInst = document.createElement('div');
            divInst.textContent = aluno.instituicao ? aluno.instituicao.nome : '-';
            const divCurso = document.createElement('div');
            divCurso.className = 'hint';
            divCurso.textContent = mapaCursos[aluno.curso] || aluno.curso;
            tdInst.append(divInst, divCurso);

            const tdSaldo = document.createElement('td');
            const spanSaldo = document.createElement('span');
            spanSaldo.className = 'badge-coins';
            spanSaldo.textContent = `🪙 ${aluno.saldo} moedas`;
            tdSaldo.appendChild(spanSaldo);

            const tdAcoes = document.createElement('td');
            const divAcoes = document.createElement('div');
            divAcoes.className = 'row-actions';

            const btnEditar = document.createElement('button');
            btnEditar.type = 'button';
            btnEditar.className = 'btn btn-sm btn-edit';
            btnEditar.textContent = '✏️ Editar';
            btnEditar.addEventListener('click', () => preencherFormularioAluno(aluno));

            const btnExcluir = document.createElement('button');
            btnExcluir.type = 'button';
            btnExcluir.className = 'btn btn-sm btn-delete';
            btnExcluir.textContent = '🗑️ Excluir';
            btnExcluir.addEventListener('click', () => excluirAluno(aluno.id, aluno.nome));

            divAcoes.append(btnEditar, btnExcluir);
            tdAcoes.appendChild(divAcoes);

            tr.append(thNome, tdDoc, tdInst, tdSaldo, tdAcoes);
            tbodyAlunos.appendChild(tr);
        });
    }

    function preencherFormularioAluno(aluno) {
        document.getElementById('aluno-id').value = aluno.id;
        document.getElementById('aluno-nome').value = aluno.nome || '';
        document.getElementById('aluno-email').value = aluno.email || '';
        document.getElementById('aluno-matricula').value = aluno.matricula ?? '';
        document.getElementById('aluno-cpf').value = aluno.cpf || '';
        document.getElementById('aluno-rg').value = aluno.rg || '';
        document.getElementById('aluno-endereco').value = aluno.endereco || '';
        document.getElementById('aluno-instituicao').value = aluno.instituicao ? aluno.instituicao.id : '';
        document.getElementById('aluno-curso').value = aluno.curso || '';
        document.getElementById('aluno-login').value = aluno.login || '';
        document.getElementById('aluno-senha').value = aluno.senha || '';

        formAlunoLegend.textContent = `Editando Aluno #${aluno.id} — ${aluno.nome}`;
        btnSalvarAluno.textContent = 'Atualizar Aluno';
        btnCancelarAluno.hidden = false;
        formAluno.scrollIntoView({ behavior: 'smooth' });
    }

    function resetarFormularioAluno() {
        formAluno.reset();
        document.getElementById('aluno-id').value = '';
        formAlunoLegend.textContent = 'Novo Cadastro de Aluno';
        btnSalvarAluno.textContent = 'Salvar Aluno';
        btnCancelarAluno.hidden = true;
    }

    btnCancelarAluno.addEventListener('click', resetarFormularioAluno);
    btnRecarregarAlunos.addEventListener('click', carregarAlunos);

    formAluno.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!formAluno.checkValidity()) {
            const primeiroInvalido = formAluno.querySelector(':invalid');
            if (primeiroInvalido) primeiroInvalido.focus();
            return;
        }

        const id = document.getElementById('aluno-id').value;
        const matriculaStr = document.getElementById('aluno-matricula').value.trim();
        const payload = {
            nome: document.getElementById('aluno-nome').value.trim(),
            email: document.getElementById('aluno-email').value.trim(),
            login: document.getElementById('aluno-login').value.trim(),
            senha: document.getElementById('aluno-senha').value,
            cpf: document.getElementById('aluno-cpf').value.trim(),
            rg: document.getElementById('aluno-rg').value.trim(),
            endereco: document.getElementById('aluno-endereco').value.trim(),
            instituicaoId: Number(document.getElementById('aluno-instituicao').value),
            curso: document.getElementById('aluno-curso').value,
            matricula: matriculaStr ? Number(matriculaStr) : null
        };

        btnSalvarAluno.disabled = true;
        try {
            const url = id ? `/api/alunos/${id}` : '/api/alunos';
            const method = id ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const erroBody = await res.json().catch(() => ({}));
                throw new Error(erroBody.erro || 'Erro ao salvar cadastro de aluno.');
            }

            exibirMensagem(id ? 'Cadastro do aluno atualizado com sucesso!' : 'Aluno cadastrado com sucesso!');
            resetarFormularioAluno();
            await carregarAlunos();
        } catch (err) {
            exibirMensagem(err.message, 'error');
        } finally {
            btnSalvarAluno.disabled = false;
        }
    });

    async function excluirAluno(id, nome) {
        if (!window.confirm(`Deseja realmente excluir o cadastro do aluno "${nome}"?`)) {
            return;
        }
        try {
            const res = await fetch(`/api/alunos/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                throw new Error('Não foi possível excluir o aluno.');
            }
            exibirMensagem(`Aluno "${nome}" removido com sucesso.`);
            if (document.getElementById('aluno-id').value === String(id)) {
                resetarFormularioAluno();
            }
            await carregarAlunos();
        } catch (err) {
            exibirMensagem(err.message, 'error');
        }
    }

    // ==================== CRUD DE EMPRESAS PARCEIRAS ====================
    async function carregarEmpresas() {
        try {
            const res = await fetch('/api/empresas');
            const empresas = await res.json();
            renderizarTabelaEmpresas(empresas);
        } catch (err) {
            exibirMensagem('Não foi possível carregar as empresas parceiras.', 'error');
        }
    }

    function renderizarTabelaEmpresas(empresas) {
        tbodyEmpresas.replaceChildren();
        if (!empresas || empresas.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 5;
            td.className = 'empty-row';
            td.textContent = 'Nenhuma empresa parceira cadastrada até o momento.';
            tr.appendChild(td);
            tbodyEmpresas.appendChild(tr);
            return;
        }

        empresas.forEach((emp) => {
            const tr = document.createElement('tr');

            const thNome = document.createElement('th');
            thNome.scope = 'row';
            thNome.textContent = emp.nome;

            const tdCnpj = document.createElement('td');
            tdCnpj.textContent = emp.cnpj;

            const tdContato = document.createElement('td');
            const divEmail = document.createElement('div');
            divEmail.textContent = emp.email;
            const divLogin = document.createElement('div');
            divLogin.className = 'hint';
            divLogin.textContent = `Login: ${emp.login}`;
            tdContato.append(divEmail, divLogin);

            const tdDesc = document.createElement('td');
            tdDesc.textContent = emp.descricao;

            const tdAcoes = document.createElement('td');
            const divAcoes = document.createElement('div');
            divAcoes.className = 'row-actions';

            const btnEditar = document.createElement('button');
            btnEditar.type = 'button';
            btnEditar.className = 'btn btn-sm btn-edit';
            btnEditar.textContent = '✏️ Editar';
            btnEditar.addEventListener('click', () => preencherFormularioEmpresa(emp));

            const btnExcluir = document.createElement('button');
            btnExcluir.type = 'button';
            btnExcluir.className = 'btn btn-sm btn-delete';
            btnExcluir.textContent = '🗑️ Excluir';
            btnExcluir.addEventListener('click', () => excluirEmpresa(emp.id, emp.nome));

            divAcoes.append(btnEditar, btnExcluir);
            tdAcoes.appendChild(divAcoes);

            tr.append(thNome, tdCnpj, tdContato, tdDesc, tdAcoes);
            tbodyEmpresas.appendChild(tr);
        });
    }

    function preencherFormularioEmpresa(emp) {
        document.getElementById('empresa-id').value = emp.id;
        document.getElementById('empresa-nome').value = emp.nome || '';
        document.getElementById('empresa-cnpj').value = emp.cnpj || '';
        document.getElementById('empresa-email').value = emp.email || '';
        document.getElementById('empresa-descricao').value = emp.descricao || '';
        document.getElementById('empresa-login').value = emp.login || '';
        document.getElementById('empresa-senha').value = emp.senha || '';

        formEmpresaLegend.textContent = `Editando Empresa #${emp.id} — ${emp.nome}`;
        btnSalvarEmpresa.textContent = 'Atualizar Empresa Parceira';
        btnCancelarEmpresa.hidden = false;
        formEmpresa.scrollIntoView({ behavior: 'smooth' });
    }

    function resetarFormularioEmpresa() {
        formEmpresa.reset();
        document.getElementById('empresa-id').value = '';
        formEmpresaLegend.textContent = 'Novo Cadastro de Empresa Parceira';
        btnSalvarEmpresa.textContent = 'Salvar Empresa Parceira';
        btnCancelarEmpresa.hidden = true;
    }

    btnCancelarEmpresa.addEventListener('click', resetarFormularioEmpresa);
    btnRecarregarEmpresas.addEventListener('click', carregarEmpresas);

    formEmpresa.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!formEmpresa.checkValidity()) {
            const primeiroInvalido = formEmpresa.querySelector(':invalid');
            if (primeiroInvalido) primeiroInvalido.focus();
            return;
        }

        const id = document.getElementById('empresa-id').value;
        const payload = {
            nome: document.getElementById('empresa-nome').value.trim(),
            cnpj: document.getElementById('empresa-cnpj').value.trim(),
            email: document.getElementById('empresa-email').value.trim(),
            descricao: document.getElementById('empresa-descricao').value.trim(),
            login: document.getElementById('empresa-login').value.trim(),
            senha: document.getElementById('empresa-senha').value
        };

        btnSalvarEmpresa.disabled = true;
        try {
            const url = id ? `/api/empresas/${id}` : '/api/empresas';
            const method = id ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const erroBody = await res.json().catch(() => ({}));
                throw new Error(erroBody.erro || 'Erro ao salvar empresa parceira.');
            }

            exibirMensagem(id ? 'Empresa parceira atualizada com sucesso!' : 'Empresa parceira cadastrada com sucesso!');
            resetarFormularioEmpresa();
            await carregarEmpresas();
        } catch (err) {
            exibirMensagem(err.message, 'error');
        } finally {
            btnSalvarEmpresa.disabled = false;
        }
    });

    async function excluirEmpresa(id, nome) {
        if (!window.confirm(`Deseja realmente excluir a empresa parceira "${nome}"?`)) {
            return;
        }
        try {
            const res = await fetch(`/api/empresas/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                throw new Error('Não foi possível excluir a empresa parceira.');
            }
            exibirMensagem(`Empresa "${nome}" removida com sucesso.`);
            if (document.getElementById('empresa-id').value === String(id)) {
                resetarFormularioEmpresa();
            }
            await carregarEmpresas();
        } catch (err) {
            exibirMensagem(err.message, 'error');
        }
    }

    // Inicialização
    (async function init() {
        await carregarCatalogos();
        await Promise.all([carregarAlunos(), carregarEmpresas()]);
    })();
})();
