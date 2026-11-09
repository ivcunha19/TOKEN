package com.management.dto;

import com.management.model.Aluno;

/** Visão reduzida do aluno exibida ao professor (sem documentos, endereço ou saldo). */
public record AlunoResumoDTO(Long id, String nome, String email, String cursoNome, Integer matricula) {

    public static AlunoResumoDTO de(Aluno a) {
        return new AlunoResumoDTO(a.getId(), a.getNome(), a.getEmail(),
                a.getCurso() != null ? a.getCurso().getNome() : null, a.getMatricula());
    }
}
