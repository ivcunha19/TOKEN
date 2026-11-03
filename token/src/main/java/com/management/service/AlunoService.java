package com.management.service;

import com.management.dto.AlunoRequestDTO;
import com.management.model.Aluno;
import com.management.model.Instituicao;
import com.management.repository.AlunoRepository;
import com.management.repository.InstituicaoRepository;
import com.management.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AlunoService {

    private final AlunoRepository alunoRepository;
    private final InstituicaoRepository instituicaoRepository;
    private final UsuarioRepository usuarioRepository;

    public AlunoService(AlunoRepository alunoRepository,
                        InstituicaoRepository instituicaoRepository,
                        UsuarioRepository usuarioRepository) {
        this.alunoRepository = alunoRepository;
        this.instituicaoRepository = instituicaoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<Aluno> listarTodos() {
        return alunoRepository.findAll();
    }

    public Aluno buscarPorId(Long id) {
        return alunoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Aluno não encontrado com ID: " + id));
    }

    @Transactional
    public Aluno criar(AlunoRequestDTO dto) {
        if (usuarioRepository.existsByLogin(dto.getLogin())) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com o login: " + dto.getLogin());
        }
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com o e-mail: " + dto.getEmail());
        }
        if (alunoRepository.existsByCpf(dto.getCpf())) {
            throw new IllegalArgumentException("Já existe um aluno cadastrado com o CPF: " + dto.getCpf());
        }

        Instituicao instituicao = instituicaoRepository.findById(dto.getInstituicaoId())
                .orElseThrow(() -> new IllegalArgumentException("Instituição de ensino não encontrada com ID: " + dto.getInstituicaoId()));

        Aluno aluno = new Aluno(
                dto.getNome(),
                dto.getSenha(),
                dto.getLogin(),
                dto.getEmail(),
                dto.getCpf(),
                instituicao,
                dto.getRg(),
                dto.getEndereco(),
                dto.getCurso(),
                dto.getMatricula()
        );

        return alunoRepository.save(aluno);
    }

    @Transactional
    public Aluno atualizar(Long id, AlunoRequestDTO dto) {
        Aluno existente = buscarPorId(id);

        if (!existente.getLogin().equals(dto.getLogin()) && usuarioRepository.existsByLogin(dto.getLogin())) {
            throw new IllegalArgumentException("Já existe outro usuário com o login: " + dto.getLogin());
        }
        if (!existente.getEmail().equals(dto.getEmail()) && usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Já existe outro usuário com o e-mail: " + dto.getEmail());
        }
        if (!existente.getCpf().equals(dto.getCpf()) && alunoRepository.existsByCpf(dto.getCpf())) {
            throw new IllegalArgumentException("Já existe outro aluno com o CPF: " + dto.getCpf());
        }

        Instituicao instituicao = instituicaoRepository.findById(dto.getInstituicaoId())
                .orElseThrow(() -> new IllegalArgumentException("Instituição de ensino não encontrada com ID: " + dto.getInstituicaoId()));

        existente.setNome(dto.getNome());
        existente.setEmail(dto.getEmail());
        existente.setLogin(dto.getLogin());
        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            existente.setSenha(dto.getSenha());
        }
        existente.setCpf(dto.getCpf());
        existente.setRg(dto.getRg());
        existente.setEndereco(dto.getEndereco());
        existente.setInstituicao(instituicao);
        existente.setCurso(dto.getCurso());
        existente.setMatricula(dto.getMatricula());

        return alunoRepository.save(existente);
    }

    @Transactional
    public void excluir(Long id) {
        Aluno existente = buscarPorId(id);
        alunoRepository.delete(existente);
    }
}
