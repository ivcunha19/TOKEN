package com.management.dto;

import com.management.model.Vantagem;

public record VantagemResponseDTO(
        Long id,
        String nome,
        String descricao,
        int custo,
        int quantidade,
        boolean disponivel,
        String fotoUrl,
        Long empresaId,
        String empresaNome) {

    public static VantagemResponseDTO de(Vantagem v) {
        String fotoUrl = v.possuiFoto()
                ? "/api/vantagens/" + v.getId() + "/foto?v=" + (v.getVersao() != null ? v.getVersao() : 0)
                : null;
        return new VantagemResponseDTO(v.getId(), v.getNome(), v.getDescricao(), v.getCusto(), v.getQuantidade(),
                v.verificarDisponibilidade(), fotoUrl, v.getEmpresa().getId(), v.getEmpresa().getNome());
    }
}
