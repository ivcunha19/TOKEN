package com.management.dto;

import com.management.model.Transacao;

import java.time.LocalDateTime;

public record TransacaoResponseDTO(
        Long id,
        int valor,
        String motivo,
        LocalDateTime dataHora,
        Long alunoId,
        String alunoNome,
        Long professorId,
        String professorNome,
        int saldoProfessor) {

    public static TransacaoResponseDTO de(Transacao t) {
        return new TransacaoResponseDTO(t.getId(), t.getValor(), t.getDescricaoMotivo(), t.getDataHora(),
                t.getAluno().getId(), t.getAluno().getNome(),
                t.getProfessor().getId(), t.getProfessor().getNome(), t.getProfessor().getSaldo());
    }
}
