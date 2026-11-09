package com.management.service;

import com.management.auth.UsuarioLogado;
import com.management.exception.NaoAutenticadoException;
import com.management.model.Professor;
import com.management.model.Usuario;
import com.management.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AutenticacaoService {

    /** Nome do atributo de sessão que guarda o {@link UsuarioLogado}. */
    public static final String SESSAO_USUARIO = "usuarioLogado";

    private final UsuarioRepository usuarioRepository;
    private final ProfessorService professorService;

    public AutenticacaoService(UsuarioRepository usuarioRepository, ProfessorService professorService) {
        this.usuarioRepository = usuarioRepository;
        this.professorService = professorService;
    }

    @Transactional
    public UsuarioLogado autenticar(String login, String senha) {
        String loginNormalizado = login == null ? "" : login.trim();
        Usuario usuario = usuarioRepository.findByLogin(loginNormalizado)
                .filter(u -> u.autenticar(loginNormalizado, senha))
                .orElseThrow(() -> new NaoAutenticadoException("Login ou senha inválidos."));

        if (usuario instanceof Professor professor) {
            professorService.creditarSemestreSeNecessario(professor);
        }
        return UsuarioLogado.de(usuario);
    }
}
