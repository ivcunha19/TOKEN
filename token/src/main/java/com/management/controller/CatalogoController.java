package com.management.controller;

import com.management.model.ECurso;
import com.management.model.Instituicao;
import com.management.service.InstituicaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class CatalogoController {

    private final InstituicaoService instituicaoService;

    public CatalogoController(InstituicaoService instituicaoService) {
        this.instituicaoService = instituicaoService;
    }

    @GetMapping("/instituicoes")
    public ResponseEntity<List<Instituicao>> listarInstituicoes() {
        return ResponseEntity.ok(instituicaoService.listarTodas());
    }

    @GetMapping("/cursos")
    public ResponseEntity<List<Map<String, String>>> listarCursos() {
        List<Map<String, String>> cursos = Arrays.stream(ECurso.values())
                .map(c -> Map.of("codigo", c.name(), "nome", c.getNome()))
                .toList();
        return ResponseEntity.ok(cursos);
    }
}
