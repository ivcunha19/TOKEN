package com.management.service;

import com.management.event.VantagemResgatadaEvent;
import com.management.exception.RecursoNaoEncontradoException;
import com.management.model.Aluno;
import com.management.model.Empresa;
import com.management.model.ResgateVantagem;
import com.management.model.Vantagem;
import com.management.repository.ResgateVantagemRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.Locale;

/** Resgate de vantagens e conferência de cupons (componente VantagemResgateService). */
@Service
public class VantagemResgateService {

    private static final String ALFABETO_CUPOM = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem 0/O/1/I
    private static final SecureRandom RANDOM = new SecureRandom();

    private final ResgateVantagemRepository resgateRepository;
    private final AlunoService alunoService;
    private final VantagemService vantagemService;
    private final EmpresaService empresaService;
    private final ApplicationEventPublisher eventos;

    public VantagemResgateService(ResgateVantagemRepository resgateRepository,
                                  AlunoService alunoService,
                                  VantagemService vantagemService,
                                  EmpresaService empresaService,
                                  ApplicationEventPublisher eventos) {
        this.resgateRepository = resgateRepository;
        this.alunoService = alunoService;
        this.vantagemService = vantagemService;
        this.empresaService = empresaService;
        this.eventos = eventos;
    }

    @Transactional
    public ResgateVantagem resgatar(Long alunoId, Long vantagemId) {
        Aluno aluno = alunoService.buscarPorId(alunoId);
        Vantagem vantagem = vantagemService.buscarPorId(vantagemId);

        ResgateVantagem resgate = aluno.resgatarVantagem(vantagem, gerarCodigoCupomUnico());
        resgateRepository.save(resgate);

        Empresa empresa = vantagem.getEmpresa();
        eventos.publishEvent(new VantagemResgatadaEvent(resgate.getCodigoCupom(), vantagem.getNome(),
                resgate.getValor(), resgate.getDataHora(), aluno.getNome(), aluno.getEmail(), aluno.getSaldo(),
                empresa.getNome(), empresa.getEmail()));
        return resgate;
    }

    public List<ResgateVantagem> listarDoAluno(Long alunoId) {
        return resgateRepository.findByAlunoIdOrderByDataHoraDesc(alunoId);
    }

    public List<ResgateVantagem> listarDaEmpresa(Long empresaId) {
        return resgateRepository.findByVantagemEmpresaIdOrderByDataHoraDesc(empresaId);
    }

    /** A empresa confere se o código apresentado pelo aluno corresponde a um resgate de suas vantagens. */
    @Transactional(readOnly = true)
    public ResgateVantagem conferirCupom(Long empresaId, String codigo) {
        String normalizado = normalizar(codigo);
        Empresa empresa = empresaService.buscarPorId(empresaId);
        if (!empresa.conferirCupom(normalizado)) {
            throw new RecursoNaoEncontradoException("Cupom " + normalizado + " não encontrado entre os resgates da sua empresa.");
        }
        return resgateRepository.findByCodigoCupom(normalizado)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cupom não encontrado: " + normalizado));
    }

    @Transactional
    public ResgateVantagem registrarUtilizacao(Long empresaId, String codigo) {
        ResgateVantagem resgate = conferirCupom(empresaId, codigo);
        resgate.registrarUtilizacao();
        return resgateRepository.save(resgate);
    }

    private String gerarCodigoCupomUnico() {
        String codigo;
        do {
            StringBuilder sb = new StringBuilder("TKN-");
            for (int i = 0; i < 8; i++) {
                if (i == 4) {
                    sb.append('-');
                }
                sb.append(ALFABETO_CUPOM.charAt(RANDOM.nextInt(ALFABETO_CUPOM.length())));
            }
            codigo = sb.toString();
        } while (resgateRepository.existsByCodigoCupom(codigo));
        return codigo;
    }

    private static String normalizar(String codigo) {
        return codigo == null ? "" : codigo.trim().toUpperCase(Locale.ROOT);
    }
}
