package com.management.exception;

/** Usuário autenticado sem permissão para o recurso (HTTP 403). */
public class AcessoNegadoException extends RuntimeException {

    public AcessoNegadoException(String mensagem) {
        super(mensagem);
    }
}
