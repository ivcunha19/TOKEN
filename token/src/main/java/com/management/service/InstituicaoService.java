package com.management.service;

import com.management.model.Instituicao;
import com.management.repository.InstituicaoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InstituicaoService {

    private final InstituicaoRepository instituicaoRepository;

    public InstituicaoService(InstituicaoRepository instituicaoRepository) {
        this.instituicaoRepository = instituicaoRepository;
    }

    public List<Instituicao> listarTodas() {
        return instituicaoRepository.findAll();
    }
}
