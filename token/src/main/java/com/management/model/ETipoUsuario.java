package com.management.model;

public enum ETipoUsuario {
    ALUNO,
    PROFESSOR,
    EMPRESA;

    public static ETipoUsuario de(Usuario usuario) {
        if (usuario instanceof Aluno) {
            return ALUNO;
        }
        if (usuario instanceof Professor) {
            return PROFESSOR;
        }
        if (usuario instanceof Empresa) {
            return EMPRESA;
        }
        throw new IllegalStateException("Tipo de usuário desconhecido: " + usuario.getClass().getSimpleName());
    }
}
