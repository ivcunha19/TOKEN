package com.management.service;

import com.management.dto.EmpresaRequestDTO;
import com.management.model.Empresa;
import com.management.repository.EmpresaRepository;
import com.management.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EmpresaService {

    private final EmpresaRepository empresaRepository;
    private final UsuarioRepository usuarioRepository;

    public EmpresaService(EmpresaRepository empresaRepository, UsuarioRepository usuarioRepository) {
        this.empresaRepository = empresaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<Empresa> listarTodas() {
        return empresaRepository.findAll();
    }

    public Empresa buscarPorId(Long id) {
        return empresaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Empresa parceira não encontrada com ID: " + id));
    }

    @Transactional
    public Empresa criar(EmpresaRequestDTO dto) {
        if (usuarioRepository.existsByLogin(dto.getLogin())) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com o login: " + dto.getLogin());
        }
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com o e-mail: " + dto.getEmail());
        }
        if (empresaRepository.existsByCnpj(dto.getCnpj())) {
            throw new IllegalArgumentException("Já existe uma empresa cadastrada com o CNPJ: " + dto.getCnpj());
        }

        Empresa empresa = new Empresa(
                dto.getNome(),
                dto.getSenha(),
                dto.getLogin(),
                dto.getEmail(),
                dto.getDescricao(),
                dto.getCnpj()
        );

        return empresaRepository.save(empresa);
    }

    @Transactional
    public Empresa atualizar(Long id, EmpresaRequestDTO dto) {
        Empresa existente = buscarPorId(id);

        if (!existente.getLogin().equals(dto.getLogin()) && usuarioRepository.existsByLogin(dto.getLogin())) {
            throw new IllegalArgumentException("Já existe outro usuário com o login: " + dto.getLogin());
        }
        if (!existente.getEmail().equals(dto.getEmail()) && usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Já existe outro usuário com o e-mail: " + dto.getEmail());
        }
        if (!existente.getCnpj().equals(dto.getCnpj()) && empresaRepository.existsByCnpj(dto.getCnpj())) {
            throw new IllegalArgumentException("Já existe outra empresa com o CNPJ: " + dto.getCnpj());
        }

        existente.setNome(dto.getNome());
        existente.setEmail(dto.getEmail());
        existente.setLogin(dto.getLogin());
        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            existente.setSenha(dto.getSenha());
        }
        existente.setCnpj(dto.getCnpj());
        existente.setDescricao(dto.getDescricao());

        return empresaRepository.save(existente);
    }

    @Transactional
    public void excluir(Long id) {
        Empresa existente = buscarPorId(id);
        empresaRepository.delete(existente);
    }
}
