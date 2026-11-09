package com.management.dto;

import java.util.List;

public record ExtratoDTO(int saldo, List<ItemExtratoDTO> transacoes) {
}
