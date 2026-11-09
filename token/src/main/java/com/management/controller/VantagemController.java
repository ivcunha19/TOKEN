package com.management.controller;

import com.management.auth.PerfilPermitido;
import com.management.auth.Publico;
import com.management.auth.UsuarioLogado;
import com.management.dto.VantagemRequestDTO;
import com.management.dto.VantagemResponseDTO;
import com.management.exception.RecursoNaoEncontradoException;
import com.management.model.ETipoUsuario;
import com.management.model.Vantagem;
import com.management.service.AutenticacaoService;
import com.management.service.VantagemService;
import jakarta.validation.Valid;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.List;

/** Catálogo e cadastro de vantagens (US04). */
@RestController
@RequestMapping("/api/vantagens")
public class VantagemController {

    private final VantagemService vantagemService;

    public VantagemController(VantagemService vantagemService) {
        this.vantagemService = vantagemService;
    }

    /** Catálogo completo de vantagens (para o aluno escolher o que resgatar). */
    @GetMapping
    public ResponseEntity<List<VantagemResponseDTO>> catalogo() {
        return ResponseEntity.ok(vantagemService.listarCatalogo().stream().map(VantagemResponseDTO::de).toList());
    }

    @GetMapping("/minhas")
    @PerfilPermitido(ETipoUsuario.EMPRESA)
    public ResponseEntity<List<VantagemResponseDTO>> minhasVantagens(
            @SessionAttribute(AutenticacaoService.SESSAO_USUARIO) UsuarioLogado usuario) {
        return ResponseEntity.ok(vantagemService.listarDaEmpresa(usuario.id()).stream()
                .map(VantagemResponseDTO::de).toList());
    }

    @Publico
    @GetMapping("/{id}/foto")
    public ResponseEntity<byte[]> foto(@PathVariable Long id) {
        Vantagem vantagem = vantagemService.buscarPorId(id);
        if (!vantagem.possuiFoto()) {
            throw new RecursoNaoEncontradoException("Vantagem sem foto cadastrada.");
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(vantagem.getFotoTipo()))
                .cacheControl(CacheControl.maxAge(Duration.ofDays(7)))
                .header("X-Content-Type-Options", "nosniff")
                .body(vantagem.getFoto());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PerfilPermitido(ETipoUsuario.EMPRESA)
    public ResponseEntity<VantagemResponseDTO> cadastrar(
            @SessionAttribute(AutenticacaoService.SESSAO_USUARIO) UsuarioLogado usuario,
            @Valid @ModelAttribute VantagemRequestDTO dto) {
        Vantagem criada = vantagemService.criar(usuario.id(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(VantagemResponseDTO.de(criada));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PerfilPermitido(ETipoUsuario.EMPRESA)
    public ResponseEntity<VantagemResponseDTO> atualizar(
            @SessionAttribute(AutenticacaoService.SESSAO_USUARIO) UsuarioLogado usuario,
            @PathVariable Long id,
            @Valid @ModelAttribute VantagemRequestDTO dto) {
        return ResponseEntity.ok(VantagemResponseDTO.de(vantagemService.atualizar(usuario.id(), id, dto)));
    }

    @DeleteMapping("/{id}")
    @PerfilPermitido(ETipoUsuario.EMPRESA)
    public ResponseEntity<Void> excluir(
            @SessionAttribute(AutenticacaoService.SESSAO_USUARIO) UsuarioLogado usuario,
            @PathVariable Long id) {
        vantagemService.excluir(usuario.id(), id);
        return ResponseEntity.noContent().build();
    }
}
