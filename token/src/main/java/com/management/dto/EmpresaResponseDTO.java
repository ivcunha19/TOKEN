package com.management.dto;

import com.management.model.Empresa;

public record EmpresaResponseDTO(Long id, String nome, String email, String login, String cnpj, String descricao) {

    public static EmpresaResponseDTO de(Empresa e) {
        return new EmpresaResponseDTO(e.getId(), e.getNome(), e.getEmail(), e.getLogin(), e.getCnpj(), e.getDescricao());
    }
}
