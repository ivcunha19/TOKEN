package com.management.service;

import com.management.exception.RegraNegocioException;
import com.management.repository.UsuarioRepository;
import org.springframework.stereotype.Component;

@Component
public class ValidadorCadastroUsuario {

    private final UsuarioRepository usuarioRepository;

    public ValidadorCadastroUsuario(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public void validarNovo(String login, String email) {
        if (usuarioRepository.existsByLogin(login)) {
            throw new RegraNegocioException("Já existe um usuário cadastrado com o login: " + login);
        }
        if (usuarioRepository.existsByEmail(email)) {
            throw new RegraNegocioException("Já existe um usuário cadastrado com o e-mail: " + email);
        }
    }

    public void validarAlteracao(String loginAtual, String emailAtual,
                                 String novoLogin, String novoEmail) {
        if (!loginAtual.equals(novoLogin) && usuarioRepository.existsByLogin(novoLogin)) {
            throw new RegraNegocioException("Já existe outro usuário com o login: " + novoLogin);
        }
        if (!emailAtual.equalsIgnoreCase(novoEmail) && usuarioRepository.existsByEmail(novoEmail)) {
            throw new RegraNegocioException("Já existe outro usuário com o e-mail: " + novoEmail);
        }
    }
}
