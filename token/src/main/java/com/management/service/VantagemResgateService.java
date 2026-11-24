package com.management.service;

import com.management.event.VantagemResgatadaEvent;
import com.management.model.Aluno;
import com.management.model.Empresa;
import com.management.model.ResgateVantagem;
import com.management.model.Vantagem;
import com.management.repository.ResgateVantagemRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/** Resgate de vantagens e conferência de cupons (componente VantagemResgateService). */
@Service
public class VantagemResgateService {

    private final ResgateVantagemRepository resgateRepository;
    private final AlunoService alunoService;
    private final VantagemService vantagemService;
    private final ApplicationEventPublisher eventos;
    private final GeradorCodigoCupom geradorCodigoCupom;
    private final CupomService cupomService;

    public VantagemResgateService(ResgateVantagemRepository resgateRepository,
                                  AlunoService alunoService,
                                  VantagemService vantagemService,
                                  ApplicationEventPublisher eventos,
                                  GeradorCodigoCupom geradorCodigoCupom,
                                  CupomService cupomService) {
        this.resgateRepository = resgateRepository;
        this.alunoService = alunoService;
        this.vantagemService = vantagemService;
        this.eventos = eventos;
        this.geradorCodigoCupom = geradorCodigoCupom;
        this.cupomService = cupomService;
    }

    @Transactional
    public ResgateVantagem resgatar(Long alunoId, Long vantagemId) {
        Aluno aluno = alunoService.buscarPorId(alunoId);
        Vantagem vantagem = vantagemService.buscarPorId(vantagemId);

        ResgateVantagem resgate = aluno.resgatarVantagem(
                vantagem, geradorCodigoCupom.gerarUnico());
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
        return cupomService.conferir(empresaId, codigo);
    }

    @Transactional
    public ResgateVantagem registrarUtilizacao(Long empresaId, String codigo) {
        ResgateVantagem resgate = conferirCupom(empresaId, codigo);
        resgate.registrarUtilizacao();
        return resgateRepository.save(resgate);
    }

}
