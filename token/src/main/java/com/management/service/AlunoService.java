package com.management.service;

import com.management.dto.AlunoRequestDTO;
import com.management.exception.RecursoNaoEncontradoException;
import com.management.exception.RegraNegocioException;
import com.management.model.Aluno;
import com.management.model.Instituicao;
import com.management.repository.AlunoRepository;
import com.management.repository.ResgateVantagemRepository;
import com.management.repository.TransacaoRepository;
import com.management.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AlunoService {

    private final AlunoRepository alunoRepository;
    private final UsuarioRepository usuarioRepository;
    private final InstituicaoService instituicaoService;
    private final TransacaoRepository transacaoRepository;
    private final ResgateVantagemRepository resgateRepository;

    public AlunoService(AlunoRepository alunoRepository,
                        UsuarioRepository usuarioRepository,
                        InstituicaoService instituicaoService,
                        TransacaoRepository transacaoRepository,
                        ResgateVantagemRepository resgateRepository) {
        this.alunoRepository = alunoRepository;
        this.usuarioRepository = usuarioRepository;
        this.instituicaoService = instituicaoService;
        this.transacaoRepository = transacaoRepository;
        this.resgateRepository = resgateRepository;
    }

    public Aluno buscarPorId(Long id) {
        return alunoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Aluno não encontrado com ID: " + id));
    }

    /** Alunos de uma instituição (usado pelo professor para escolher quem recebe moedas). */
    public List<Aluno> listarPorInstituicao(Long instituicaoId) {
        return alunoRepository.findByInstituicaoIdOrderByNomeAsc(instituicaoId);
    }

    @Transactional
    public Aluno criar(AlunoRequestDTO dto) {
        if (dto.getSenha() == null || dto.getSenha().isBlank()) {
            throw new RegraNegocioException("A senha é obrigatória no cadastro.");
        }
        String login = dto.getLogin().trim();
        String email = dto.getEmail().trim().toLowerCase();
        String cpf = Documentos.formatarCpf(dto.getCpf());

        if (usuarioRepository.existsByLogin(login)) {
            throw new RegraNegocioException("Já existe um usuário cadastrado com o login: " + login);
        }
        if (usuarioRepository.existsByEmail(email)) {
            throw new RegraNegocioException("Já existe um usuário cadastrado com o e-mail: " + email);
        }
        if (usuarioRepository.existsPessoaByCpf(cpf)) {
            throw new RegraNegocioException("Já existe uma pessoa cadastrada com o CPF: " + cpf);
        }

        Instituicao instituicao = instituicaoService.buscarPorId(dto.getInstituicaoId());

        Aluno aluno = new Aluno(dto.getNome().trim(), dto.getSenha(), login, email, cpf, instituicao,
                dto.getRg().trim(), dto.getEndereco().trim(), dto.getCurso(), dto.getMatricula());
        instituicao.vincularAluno(aluno);
        return alunoRepository.save(aluno);
    }

    @Transactional
    public Aluno atualizar(Long id, AlunoRequestDTO dto) {
        Aluno existente = buscarPorId(id);
        String login = dto.getLogin().trim();
        String email = dto.getEmail().trim().toLowerCase();
        String cpf = Documentos.formatarCpf(dto.getCpf());

        if (!existente.getLogin().equals(login) && usuarioRepository.existsByLogin(login)) {
            throw new RegraNegocioException("Já existe outro usuário com o login: " + login);
        }
        if (!existente.getEmail().equalsIgnoreCase(email) && usuarioRepository.existsByEmail(email)) {
            throw new RegraNegocioException("Já existe outro usuário com o e-mail: " + email);
        }
        if (!existente.getCpf().equals(cpf) && usuarioRepository.existsPessoaByCpf(cpf)) {
            throw new RegraNegocioException("Já existe outra pessoa com o CPF: " + cpf);
        }

        existente.setNome(dto.getNome().trim());
        existente.setEmail(email);
        existente.setLogin(login);
        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            existente.alterarSenha(dto.getSenha());
        }
        existente.setCpf(cpf);
        existente.setRg(dto.getRg().trim());
        existente.setEndereco(dto.getEndereco().trim());
        existente.setInstituicao(instituicaoService.buscarPorId(dto.getInstituicaoId()));
        existente.setCurso(dto.getCurso());
        existente.setMatricula(dto.getMatricula());

        return alunoRepository.save(existente);
    }

    @Transactional
    public void excluir(Long id) {
        Aluno existente = buscarPorId(id);
        if (transacaoRepository.existsByAlunoId(id) || resgateRepository.existsByAlunoId(id)) {
            throw new RegraNegocioException("Não é possível excluir a conta: já existem moedas recebidas ou "
                    + "vantagens resgatadas registradas para este aluno (histórico preservado para auditoria).");
        }
        alunoRepository.delete(existente);
    }
}
