package com.management.service;

import com.management.dto.EmpresaRequestDTO;
import com.management.exception.RecursoNaoEncontradoException;
import com.management.exception.RegraNegocioException;
import com.management.model.Empresa;
import com.management.repository.EmpresaRepository;
import com.management.repository.ResgateVantagemRepository;
import com.management.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EmpresaService {

    private final EmpresaRepository empresaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ResgateVantagemRepository resgateRepository;

    public EmpresaService(EmpresaRepository empresaRepository,
                          UsuarioRepository usuarioRepository,
                          ResgateVantagemRepository resgateRepository) {
        this.empresaRepository = empresaRepository;
        this.usuarioRepository = usuarioRepository;
        this.resgateRepository = resgateRepository;
    }

    public List<Empresa> listarTodas() {
        return empresaRepository.findAll();
    }

    public Empresa buscarPorId(Long id) {
        return empresaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Empresa parceira não encontrada com ID: " + id));
    }

    @Transactional
    public Empresa criar(EmpresaRequestDTO dto) {
        if (dto.getSenha() == null || dto.getSenha().isBlank()) {
            throw new RegraNegocioException("A senha é obrigatória no cadastro.");
        }
        String login = dto.getLogin().trim();
        String email = dto.getEmail().trim().toLowerCase();
        String cnpj = Documentos.formatarCnpj(dto.getCnpj());

        if (usuarioRepository.existsByLogin(login)) {
            throw new RegraNegocioException("Já existe um usuário cadastrado com o login: " + login);
        }
        if (usuarioRepository.existsByEmail(email)) {
            throw new RegraNegocioException("Já existe um usuário cadastrado com o e-mail: " + email);
        }
        if (empresaRepository.existsByCnpj(cnpj)) {
            throw new RegraNegocioException("Já existe uma empresa cadastrada com o CNPJ: " + cnpj);
        }

        Empresa empresa = new Empresa(dto.getNome().trim(), dto.getSenha(), login, email,
                dto.getDescricao().trim(), cnpj);
        return empresaRepository.save(empresa);
    }

    @Transactional
    public Empresa atualizar(Long id, EmpresaRequestDTO dto) {
        Empresa existente = buscarPorId(id);
        String login = dto.getLogin().trim();
        String email = dto.getEmail().trim().toLowerCase();
        String cnpj = Documentos.formatarCnpj(dto.getCnpj());

        if (!existente.getLogin().equals(login) && usuarioRepository.existsByLogin(login)) {
            throw new RegraNegocioException("Já existe outro usuário com o login: " + login);
        }
        if (!existente.getEmail().equalsIgnoreCase(email) && usuarioRepository.existsByEmail(email)) {
            throw new RegraNegocioException("Já existe outro usuário com o e-mail: " + email);
        }
        if (!existente.getCnpj().equals(cnpj) && empresaRepository.existsByCnpj(cnpj)) {
            throw new RegraNegocioException("Já existe outra empresa com o CNPJ: " + cnpj);
        }

        existente.setNome(dto.getNome().trim());
        existente.setEmail(email);
        existente.setLogin(login);
        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            existente.alterarSenha(dto.getSenha());
        }
        existente.setCnpj(cnpj);
        existente.setDescricao(dto.getDescricao().trim());

        return empresaRepository.save(existente);
    }

    @Transactional
    public void excluir(Long id) {
        Empresa existente = buscarPorId(id);
        if (resgateRepository.existsByVantagemEmpresaId(id)) {
            throw new RegraNegocioException("Não é possível excluir a empresa: há cupons de vantagens já resgatados "
                    + "por alunos. Zere o estoque das vantagens para retirá-las do catálogo.");
        }
        empresaRepository.delete(existente);
    }
}
