package com.management.controller;

import com.management.auth.PerfilPermitido;
import com.management.auth.Publico;
import com.management.auth.UsuarioLogado;
import com.management.dto.EmpresaRequestDTO;
import com.management.dto.EmpresaResponseDTO;
import com.management.model.ETipoUsuario;
import com.management.model.Empresa;
import com.management.service.AutenticacaoService;
import com.management.service.EmpresaService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * CRUD de Empresa Parceira (US03): cadastro público; consulta, edição e exclusão
 * do próprio cadastro pela empresa autenticada.
 */
@RestController
@RequestMapping("/api/empresas")
public class EmpresaController {

    private final EmpresaService empresaService;

    public EmpresaController(EmpresaService empresaService) {
        this.empresaService = empresaService;
    }

    @Publico
    @PostMapping
    public ResponseEntity<EmpresaResponseDTO> cadastrar(@Valid @RequestBody EmpresaRequestDTO dto) {
        Empresa criada = empresaService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(EmpresaResponseDTO.de(criada));
    }

    /** Lista pública das empresas parceiras (apenas nome e descrição). */
    @Publico
    @GetMapping
    public ResponseEntity<List<EmpresaResponseDTO>> listarParceiras() {
        return ResponseEntity.ok(empresaService.listarTodas().stream()
                .map(e -> new EmpresaResponseDTO(e.getId(), e.getNome(), null, null, null, e.getDescricao()))
                .toList());
    }

    @GetMapping("/me")
    @PerfilPermitido(ETipoUsuario.EMPRESA)
    public ResponseEntity<EmpresaResponseDTO> meuCadastro(
            @SessionAttribute(AutenticacaoService.SESSAO_USUARIO) UsuarioLogado usuario) {
        return ResponseEntity.ok(EmpresaResponseDTO.de(empresaService.buscarPorId(usuario.id())));
    }

    @PutMapping("/me")
    @PerfilPermitido(ETipoUsuario.EMPRESA)
    public ResponseEntity<EmpresaResponseDTO> atualizarMeuCadastro(
            @SessionAttribute(AutenticacaoService.SESSAO_USUARIO) UsuarioLogado usuario,
            @Valid @RequestBody EmpresaRequestDTO dto,
            HttpSession sessao) {
        Empresa atualizada = empresaService.atualizar(usuario.id(), dto);
        sessao.setAttribute(AutenticacaoService.SESSAO_USUARIO, UsuarioLogado.de(atualizada));
        return ResponseEntity.ok(EmpresaResponseDTO.de(atualizada));
    }

    @DeleteMapping("/me")
    @PerfilPermitido(ETipoUsuario.EMPRESA)
    public ResponseEntity<Void> excluirMeuCadastro(
            @SessionAttribute(AutenticacaoService.SESSAO_USUARIO) UsuarioLogado usuario,
            HttpSession sessao) {
        empresaService.excluir(usuario.id());
        sessao.invalidate();
        return ResponseEntity.noContent().build();
    }
}
