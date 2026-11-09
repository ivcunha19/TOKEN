package com.management.event;

/** Publicado quando um professor envia moedas a um aluno (dispara e-mail ao aluno). */
public record MoedasEnviadasEvent(
        String emailAluno,
        String nomeAluno,
        String nomeProfessor,
        int valor,
        String motivo,
        int saldoAluno) {
}
