package com.management.dto;

import com.management.model.Aluno;
import com.management.model.ECurso;

public record AlunoResponseDTO(
        Long id,
        String nome,
        String email,
        String login,
        String cpf,
        String rg,
        String endereco,
        Long instituicaoId,
        String instituicaoNome,
        ECurso curso,
        String cursoNome,
        Integer matricula,
        int saldo) {

    public static AlunoResponseDTO de(Aluno a) {
        return new AlunoResponseDTO(a.getId(), a.getNome(), a.getEmail(), a.getLogin(), a.getCpf(), a.getRg(),
                a.getEndereco(),
                a.getInstituicao() != null ? a.getInstituicao().getId() : null,
                a.getInstituicao() != null ? a.getInstituicao().getNome() : null,
                a.getCurso(), a.getCurso() != null ? a.getCurso().getNome() : null,
                a.getMatricula(), a.getSaldo());
    }
}
