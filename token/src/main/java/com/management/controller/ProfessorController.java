package com.management.controller;

import com.management.auth.PerfilPermitido;
import com.management.auth.UsuarioLogado;
import com.management.dto.ProfessorResponseDTO;
import com.management.model.ETipoUsuario;
import com.management.service.AutenticacaoService;
import com.management.service.ProfessorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.SessionAttribute;

/** Professores são pré-cadastrados pela instituição; aqui apenas consultam seus dados e saldo. */
@RestController
@RequestMapping("/api/professores")
@PerfilPermitido(ETipoUsuario.PROFESSOR)
public class ProfessorController {

    private final ProfessorService professorService;

    public ProfessorController(ProfessorService professorService) {
        this.professorService = professorService;
    }

    @GetMapping("/me")
    public ResponseEntity<ProfessorResponseDTO> meusDados(
            @SessionAttribute(AutenticacaoService.SESSAO_USUARIO) UsuarioLogado usuario) {
        return ResponseEntity.ok(ProfessorResponseDTO.de(professorService.buscarPorId(usuario.id())));
    }
}
