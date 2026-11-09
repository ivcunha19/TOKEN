package com.management.controller;

import com.management.auth.Publico;
import com.management.auth.UsuarioLogado;
import com.management.dto.LoginRequestDTO;
import com.management.service.AutenticacaoService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Autenticação por login e senha com sessão HTTP (US01). */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AutenticacaoService autenticacaoService;

    public AuthController(AutenticacaoService autenticacaoService) {
        this.autenticacaoService = autenticacaoService;
    }

    @Publico
    @PostMapping("/login")
    public ResponseEntity<UsuarioLogado> login(@Valid @RequestBody LoginRequestDTO dto, HttpServletRequest request) {
        UsuarioLogado usuario = autenticacaoService.autenticar(dto.login(), dto.senha());

        // Nova sessão a cada login (evita fixação de sessão)
        HttpSession antiga = request.getSession(false);
        if (antiga != null) {
            antiga.invalidate();
        }
        request.getSession(true).setAttribute(AutenticacaoService.SESSAO_USUARIO, usuario);
        return ResponseEntity.ok(usuario);
    }

    @Publico
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        HttpSession sessao = request.getSession(false);
        if (sessao != null) {
            sessao.invalidate();
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioLogado> usuarioAtual(
            @SessionAttribute(AutenticacaoService.SESSAO_USUARIO) UsuarioLogado usuario) {
        return ResponseEntity.ok(usuario);
    }
}
