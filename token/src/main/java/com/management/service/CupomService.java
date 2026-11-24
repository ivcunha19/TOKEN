package com.management.service;

import com.management.exception.RecursoNaoEncontradoException;
import com.management.model.Empresa;
import com.management.model.ResgateVantagem;
import com.management.repository.ResgateVantagemRepository;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class CupomService {

    private final ResgateVantagemRepository resgateRepository;
    private final EmpresaService empresaService;

    public CupomService(ResgateVantagemRepository resgateRepository,
                        EmpresaService empresaService) {
        this.resgateRepository = resgateRepository;
        this.empresaService = empresaService;
    }

    public ResgateVantagem conferir(Long empresaId, String codigo) {
        String normalizado = normalizar(codigo);
        Empresa empresa = empresaService.buscarPorId(empresaId);
        if (!empresa.conferirCupom(normalizado)) {
            throw new RecursoNaoEncontradoException(
                    "Cupom " + normalizado + " não encontrado entre os resgates da sua empresa.");
        }
        return resgateRepository.findByCodigoCupom(normalizado)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Cupom não encontrado: " + normalizado));
    }

    public String normalizar(String codigo) {
        return codigo == null ? "" : codigo.trim().toUpperCase(Locale.ROOT);
    }
}
