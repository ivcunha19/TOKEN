package com.management.controller;

import com.management.auth.PerfilPermitido;
import com.management.auth.UsuarioLogado;
import com.management.dto.ResgateRequestDTO;
import com.management.dto.ResgateResponseDTO;
import com.management.model.ETipoUsuario;
import com.management.model.ResgateVantagem;
import com.management.service.AutenticacaoService;
import com.management.service.VantagemResgateService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Resgate de vantagens pelo aluno e conferência de cupons pela empresa (US07). */
@RestController
@RequestMapping("/api/resgates")
public class ResgateController {

    private final VantagemResgateService resgateService;

    public ResgateController(VantagemResgateService resgateService) {
        this.resgateService = resgateService;
    }

    @PostMapping
    @PerfilPermitido(ETipoUsuario.ALUNO)
    public ResponseEntity<ResgateResponseDTO> resgatar(
            @SessionAttribute(AutenticacaoService.SESSAO_USUARIO) UsuarioLogado usuario,
            @Valid @RequestBody ResgateRequestDTO dto) {
        ResgateVantagem resgate = resgateService.resgatar(usuario.id(), dto.vantagemId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ResgateResponseDTO.de(resgate));
    }

    /** Aluno: seus cupons. Empresa: resgates das suas vantagens. */
    @GetMapping
    @PerfilPermitido({ETipoUsuario.ALUNO, ETipoUsuario.EMPRESA})
    public ResponseEntity<List<ResgateResponseDTO>> listar(
            @SessionAttribute(AutenticacaoService.SESSAO_USUARIO) UsuarioLogado usuario) {
        List<ResgateVantagem> resgates = usuario.tipo() == ETipoUsuario.ALUNO
                ? resgateService.listarDoAluno(usuario.id())
                : resgateService.listarDaEmpresa(usuario.id());
        return ResponseEntity.ok(resgates.stream().map(ResgateResponseDTO::de).toList());
    }

    @GetMapping("/cupom/{codigo}")
    @PerfilPermitido(ETipoUsuario.EMPRESA)
    public ResponseEntity<ResgateResponseDTO> conferirCupom(
            @SessionAttribute(AutenticacaoService.SESSAO_USUARIO) UsuarioLogado usuario,
            @PathVariable String codigo) {
        return ResponseEntity.ok(ResgateResponseDTO.de(resgateService.conferirCupom(usuario.id(), codigo)));
    }

    @PostMapping("/cupom/{codigo}/utilizar")
    @PerfilPermitido(ETipoUsuario.EMPRESA)
    public ResponseEntity<ResgateResponseDTO> registrarUtilizacao(
            @SessionAttribute(AutenticacaoService.SESSAO_USUARIO) UsuarioLogado usuario,
            @PathVariable String codigo) {
        return ResponseEntity.ok(ResgateResponseDTO.de(resgateService.registrarUtilizacao(usuario.id(), codigo)));
    }
}
