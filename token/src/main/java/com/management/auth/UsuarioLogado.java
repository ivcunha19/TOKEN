package com.management.auth;

import com.management.model.ETipoUsuario;
import com.management.model.Usuario;

import java.io.Serializable;

/** Dados do usuário autenticado guardados na sessão HTTP. */
public record UsuarioLogado(Long id, String nome, String login, ETipoUsuario tipo) implements Serializable {

    public static UsuarioLogado de(Usuario usuario) {
        return new UsuarioLogado(usuario.getId(), usuario.getNome(), usuario.getLogin(), ETipoUsuario.de(usuario));
    }
}
