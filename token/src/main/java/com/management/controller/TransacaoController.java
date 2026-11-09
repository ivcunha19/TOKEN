package com.management.controller;

import com.management.auth.PerfilPermitido;
import com.management.auth.UsuarioLogado;
import com.management.dto.EnvioMoedasRequestDTO;
import com.management.dto.ExtratoDTO;
import com.management.dto.TransacaoResponseDTO;
import com.management.model.ETipoUsuario;
import com.management.service.AutenticacaoService;
import com.management.service.TransacaoMoedaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Envio de moedas (US05) e consulta de extrato (US06). */
@RestController
@RequestMapping("/api")
public class TransacaoController {

    private final TransacaoMoedaService transacaoMoedaService;

    public TransacaoController(TransacaoMoedaService transacaoMoedaService) {
        this.transacaoMoedaService = transacaoMoedaService;
    }

    @PostMapping("/transacoes")
    @PerfilPermitido(ETipoUsuario.PROFESSOR)
    public ResponseEntity<TransacaoResponseDTO> enviarMoedas(
            @SessionAttribute(AutenticacaoService.SESSAO_USUARIO) UsuarioLogado usuario,
            @Valid @RequestBody EnvioMoedasRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(TransacaoResponseDTO.de(transacaoMoedaService.enviarMoedas(usuario.id(), dto)));
    }

    @GetMapping("/extrato")
    @PerfilPermitido({ETipoUsuario.ALUNO, ETipoUsuario.PROFESSOR})
    public ResponseEntity<ExtratoDTO> extrato(
            @SessionAttribute(AutenticacaoService.SESSAO_USUARIO) UsuarioLogado usuario) {
        return ResponseEntity.ok(transacaoMoedaService.gerarExtrato(usuario));
    }
}
