package com.management.exception;

/** Usuário não autenticado ou credenciais inválidas (HTTP 401). */
public class NaoAutenticadoException extends RuntimeException {

    public NaoAutenticadoException(String mensagem) {
        super(mensagem);
    }
}
