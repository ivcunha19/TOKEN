package com.management.service.extrato;

import com.management.auth.UsuarioLogado;
import com.management.dto.ExtratoDTO;
import com.management.dto.ItemExtratoDTO;
import com.management.model.ETipoUsuario;
import com.management.model.Professor;
import com.management.repository.TransacaoRepository;
import com.management.service.ProfessorService;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Component
public class ExtratoProfessorGerador implements ExtratoGerador {

    private final ProfessorService professorService;
    private final TransacaoRepository transacaoRepository;

    public ExtratoProfessorGerador(ProfessorService professorService,
                                   TransacaoRepository transacaoRepository) {
        this.professorService = professorService;
        this.transacaoRepository = transacaoRepository;
    }

    @Override
    public boolean suporta(ETipoUsuario tipo) {
        return tipo == ETipoUsuario.PROFESSOR;
    }

    @Override
    public ExtratoDTO gerar(UsuarioLogado usuario) {
        Professor professor = professorService.buscarPorId(usuario.id());
        List<ItemExtratoDTO> itens = new ArrayList<>();

        transacaoRepository.findByProfessorIdOrderByDataHoraDesc(professor.getId()).forEach(t ->
                itens.add(new ItemExtratoDTO("ENVIO", -t.getValor(), t.getDescricaoMotivo(),
                        t.getAluno().getNome(), t.getDataHora(), null)));

        itens.sort(Comparator.comparing(ItemExtratoDTO::dataHora).reversed());
        return new ExtratoDTO(professor.getSaldo(), itens);
    }
}
