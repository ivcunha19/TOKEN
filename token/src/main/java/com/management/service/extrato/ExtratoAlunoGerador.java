package com.management.service.extrato;

import com.management.auth.UsuarioLogado;
import com.management.dto.ExtratoDTO;
import com.management.dto.ItemExtratoDTO;
import com.management.model.Aluno;
import com.management.model.ETipoUsuario;
import com.management.repository.ResgateVantagemRepository;
import com.management.repository.TransacaoRepository;
import com.management.service.AlunoService;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Component
public class ExtratoAlunoGerador implements ExtratoGerador {

    private final AlunoService alunoService;
    private final TransacaoRepository transacaoRepository;
    private final ResgateVantagemRepository resgateRepository;

    public ExtratoAlunoGerador(AlunoService alunoService,
                               TransacaoRepository transacaoRepository,
                               ResgateVantagemRepository resgateRepository) {
        this.alunoService = alunoService;
        this.transacaoRepository = transacaoRepository;
        this.resgateRepository = resgateRepository;
    }

    @Override
    public boolean suporta(ETipoUsuario tipo) {
        return tipo == ETipoUsuario.ALUNO;
    }

    @Override
    public ExtratoDTO gerar(UsuarioLogado usuario) {
        Aluno aluno = alunoService.buscarPorId(usuario.id());
        List<ItemExtratoDTO> itens = new ArrayList<>();

        transacaoRepository.findByAlunoIdOrderByDataHoraDesc(aluno.getId()).forEach(t ->
                itens.add(new ItemExtratoDTO("RECEBIMENTO", t.getValor(), t.getDescricaoMotivo(),
                        t.getProfessor().getNome(), t.getDataHora(), null)));
        resgateRepository.findByAlunoIdOrderByDataHoraDesc(aluno.getId()).forEach(r ->
                itens.add(new ItemExtratoDTO("RESGATE", -r.getValor(), r.getDescricaoMotivo(),
                        r.getVantagem().getEmpresa().getNome(), r.getDataHora(), r.getCodigoCupom())));

        itens.sort(Comparator.comparing(ItemExtratoDTO::dataHora).reversed());
        return new ExtratoDTO(aluno.getSaldo(), itens);
    }
}
