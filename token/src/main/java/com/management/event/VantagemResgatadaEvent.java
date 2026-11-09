package com.management.event;

import java.time.LocalDateTime;

/** Publicado quando um aluno resgata uma vantagem (dispara e-mails ao aluno e à empresa). */
public record VantagemResgatadaEvent(
        String codigoCupom,
        String nomeVantagem,
        int custo,
        LocalDateTime dataHora,
        String nomeAluno,
        String emailAluno,
        int saldoAluno,
        String nomeEmpresa,
        String emailEmpresa) {
}
