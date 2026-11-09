package com.management.service;

import com.management.auth.UsuarioLogado;
import com.management.dto.EnvioMoedasRequestDTO;
import com.management.dto.ExtratoDTO;
import com.management.dto.ItemExtratoDTO;
import com.management.event.MoedasEnviadasEvent;
import com.management.exception.AcessoNegadoException;
import com.management.model.Aluno;
import com.management.model.ETipoUsuario;
import com.management.model.Professor;
import com.management.model.Transacao;
import com.management.repository.ResgateVantagemRepository;
import com.management.repository.TransacaoRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/** Envio de moedas, saldo e extrato (componente TransacaoMoedaService). */
@Service
public class TransacaoMoedaService {

    private final TransacaoRepository transacaoRepository;
    private final ResgateVantagemRepository resgateRepository;
    private final ProfessorService professorService;
    private final AlunoService alunoService;
    private final ApplicationEventPublisher eventos;

    public TransacaoMoedaService(TransacaoRepository transacaoRepository,
                                 ResgateVantagemRepository resgateRepository,
                                 ProfessorService professorService,
                                 AlunoService alunoService,
                                 ApplicationEventPublisher eventos) {
        this.transacaoRepository = transacaoRepository;
        this.resgateRepository = resgateRepository;
        this.professorService = professorService;
        this.alunoService = alunoService;
        this.eventos = eventos;
    }

    @Transactional
    public Transacao enviarMoedas(Long professorId, EnvioMoedasRequestDTO dto) {
        Professor professor = professorService.buscarPorId(professorId);
        Aluno aluno = alunoService.buscarPorId(dto.alunoId());

        Transacao transacao = professor.enviarMoedas(aluno, dto.valor(), dto.motivo());
        transacaoRepository.save(transacao);

        eventos.publishEvent(new MoedasEnviadasEvent(aluno.getEmail(), aluno.getNome(), professor.getNome(),
                transacao.getValor(), transacao.getDescricaoMotivo(), aluno.getSaldo()));
        return transacao;
    }

    @Transactional(readOnly = true)
    public ExtratoDTO gerarExtrato(UsuarioLogado usuario) {
        List<ItemExtratoDTO> itens = new ArrayList<>();
        int saldo;

        if (usuario.tipo() == ETipoUsuario.PROFESSOR) {
            Professor professor = professorService.buscarPorId(usuario.id());
            saldo = professor.getSaldo();
            transacaoRepository.findByProfessorIdOrderByDataHoraDesc(professor.getId()).forEach(t ->
                    itens.add(new ItemExtratoDTO("ENVIO", -t.getValor(), t.getDescricaoMotivo(),
                            t.getAluno().getNome(), t.getDataHora(), null)));
        } else if (usuario.tipo() == ETipoUsuario.ALUNO) {
            Aluno aluno = alunoService.buscarPorId(usuario.id());
            saldo = aluno.getSaldo();
            transacaoRepository.findByAlunoIdOrderByDataHoraDesc(aluno.getId()).forEach(t ->
                    itens.add(new ItemExtratoDTO("RECEBIMENTO", t.getValor(), t.getDescricaoMotivo(),
                            t.getProfessor().getNome(), t.getDataHora(), null)));
            resgateRepository.findByAlunoIdOrderByDataHoraDesc(aluno.getId()).forEach(r ->
                    itens.add(new ItemExtratoDTO("RESGATE", -r.getValor(), r.getDescricaoMotivo(),
                            r.getVantagem().getEmpresa().getNome(), r.getDataHora(), r.getCodigoCupom())));
        } else {
            throw new AcessoNegadoException("Extrato disponível apenas para alunos e professores.");
        }

        itens.sort(Comparator.comparing(ItemExtratoDTO::dataHora).reversed());
        return new ExtratoDTO(saldo, itens);
    }
}
