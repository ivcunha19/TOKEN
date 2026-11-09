package com.management.dto;

import java.time.LocalDateTime;

/**
 * Linha do extrato.
 * tipo: ENVIO (professor), RECEBIMENTO ou RESGATE (aluno).
 * valor: positivo para entradas, negativo para saídas.
 */
public record ItemExtratoDTO(
        String tipo,
        int valor,
        String descricao,
        String contraparte,
        LocalDateTime dataHora,
        String codigoCupom) {
}
