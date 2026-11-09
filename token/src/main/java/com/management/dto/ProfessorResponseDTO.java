package com.management.dto;

import com.management.model.Professor;

public record ProfessorResponseDTO(
        Long id,
        String nome,
        String email,
        String login,
        String cpf,
        String departamentoNome,
        Long instituicaoId,
        String instituicaoNome,
        int saldo,
        int valorSemestral,
        String ultimoSemestreCreditado) {

    public static ProfessorResponseDTO de(Professor p) {
        return new ProfessorResponseDTO(p.getId(), p.getNome(), p.getEmail(), p.getLogin(), p.getCpf(),
                p.getDepartamento() != null ? p.getDepartamento().getNome() : null,
                p.getInstituicao() != null ? p.getInstituicao().getId() : null,
                p.getInstituicao() != null ? p.getInstituicao().getNome() : null,
                p.getSaldo(), p.getValorMensal(), p.getUltimoSemestreCreditado());
    }
}
