package com.management.controller;

import com.management.auth.PerfilPermitido;
import com.management.auth.Publico;
import com.management.auth.UsuarioLogado;
import com.management.dto.AlunoRequestDTO;
import com.management.dto.AlunoResponseDTO;
import com.management.dto.AlunoResumoDTO;
import com.management.model.Aluno;
import com.management.model.ETipoUsuario;
import com.management.model.Professor;
import com.management.service.AlunoService;
import com.management.service.AutenticacaoService;
import com.management.service.ProfessorService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * CRUD de Aluno (US02): cadastro público; consulta, edição e exclusão do próprio cadastro
 * pelo aluno autenticado. O professor consulta os alunos da sua instituição.
 */
@RestController
@RequestMapping("/api/alunos")
public class AlunoController {

    private final AlunoService alunoService;
    private final ProfessorService professorService;

    public AlunoController(AlunoService alunoService, ProfessorService professorService) {
        this.alunoService = alunoService;
        this.professorService = professorService;
    }

    @Publico
    @PostMapping
    public ResponseEntity<AlunoResponseDTO> cadastrar(@Valid @RequestBody AlunoRequestDTO dto) {
        Aluno criado = alunoService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(AlunoResponseDTO.de(criado));
    }

    @GetMapping
    @PerfilPermitido(ETipoUsuario.PROFESSOR)
    public ResponseEntity<List<AlunoResumoDTO>> listarDaMinhaInstituicao(
            @SessionAttribute(AutenticacaoService.SESSAO_USUARIO) UsuarioLogado usuario) {
        Professor professor = professorService.buscarPorId(usuario.id());
        List<AlunoResumoDTO> alunos = alunoService.listarPorInstituicao(professor.getInstituicao().getId())
                .stream().map(AlunoResumoDTO::de).toList();
        return ResponseEntity.ok(alunos);
    }

    @GetMapping("/me")
    @PerfilPermitido(ETipoUsuario.ALUNO)
    public ResponseEntity<AlunoResponseDTO> meuCadastro(
            @SessionAttribute(AutenticacaoService.SESSAO_USUARIO) UsuarioLogado usuario) {
        return ResponseEntity.ok(AlunoResponseDTO.de(alunoService.buscarPorId(usuario.id())));
    }

    @PutMapping("/me")
    @PerfilPermitido(ETipoUsuario.ALUNO)
    public ResponseEntity<AlunoResponseDTO> atualizarMeuCadastro(
            @SessionAttribute(AutenticacaoService.SESSAO_USUARIO) UsuarioLogado usuario,
            @Valid @RequestBody AlunoRequestDTO dto,
            HttpSession sessao) {
        Aluno atualizado = alunoService.atualizar(usuario.id(), dto);
        sessao.setAttribute(AutenticacaoService.SESSAO_USUARIO, UsuarioLogado.de(atualizado));
        return ResponseEntity.ok(AlunoResponseDTO.de(atualizado));
    }

    @DeleteMapping("/me")
    @PerfilPermitido(ETipoUsuario.ALUNO)
    public ResponseEntity<Void> excluirMeuCadastro(
            @SessionAttribute(AutenticacaoService.SESSAO_USUARIO) UsuarioLogado usuario,
            HttpSession sessao) {
        alunoService.excluir(usuario.id());
        sessao.invalidate();
        return ResponseEntity.noContent().build();
    }
}
