package com.management.dto;

import com.management.model.ResgateVantagem;

import java.time.LocalDateTime;

public record ResgateResponseDTO(
        Long id,
        String codigoCupom,
        int valor,
        LocalDateTime dataHora,
        boolean utilizado,
        LocalDateTime dataUtilizacao,
        Long vantagemId,
        String vantagemNome,
        String empresaNome,
        Long alunoId,
        String alunoNome,
        String alunoEmail,
        int saldoAluno) {

    public static ResgateResponseDTO de(ResgateVantagem r) {
        return new ResgateResponseDTO(r.getId(), r.getCodigoCupom(), r.getValor(), r.getDataHora(),
                r.isUtilizado(), r.getDataUtilizacao(),
                r.getVantagem().getId(), r.getVantagem().getNome(), r.getVantagem().getEmpresa().getNome(),
                r.getAluno().getId(), r.getAluno().getNome(), r.getAluno().getEmail(), r.getAluno().getSaldo());
    }
}
