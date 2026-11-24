package com.management.service;

import com.management.auth.UsuarioLogado;
import com.management.dto.EnvioMoedasRequestDTO;
import com.management.dto.ExtratoDTO;
import com.management.event.MoedasEnviadasEvent;
import com.management.exception.AcessoNegadoException;
import com.management.model.Aluno;
import com.management.model.Professor;
import com.management.model.Transacao;
import com.management.repository.TransacaoRepository;
import com.management.service.extrato.ExtratoGerador;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Envio de moedas, saldo e extrato (componente TransacaoMoedaService). */
@Service
public class TransacaoMoedaService {

    private final TransacaoRepository transacaoRepository;
    private final ProfessorService professorService;
    private final AlunoService alunoService;
    private final ApplicationEventPublisher eventos;
    private final List<ExtratoGerador> extratoGeradores;

    public TransacaoMoedaService(TransacaoRepository transacaoRepository,
                                 ProfessorService professorService,
                                 AlunoService alunoService,
                                 ApplicationEventPublisher eventos,
                                 List<ExtratoGerador> extratoGeradores) {
        this.transacaoRepository = transacaoRepository;
        this.professorService = professorService;
        this.alunoService = alunoService;
        this.eventos = eventos;
        this.extratoGeradores = extratoGeradores;
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
        return extratoGeradores.stream()
                .filter(gerador -> gerador.suporta(usuario.tipo()))
                .findFirst()
                .orElseThrow(() -> new AcessoNegadoException(
                        "Extrato disponível apenas para alunos e professores."))
                .gerar(usuario);
    }
}
