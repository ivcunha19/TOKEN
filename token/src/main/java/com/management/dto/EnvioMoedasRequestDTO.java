package com.management.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record EnvioMoedasRequestDTO(
        @NotNull(message = "Selecione o aluno") Long alunoId,
        @NotNull(message = "Informe a quantidade de moedas")
        @Min(value = 1, message = "A quantidade de moedas deve ser maior que zero") Integer valor,
        @NotBlank(message = "O motivo do reconhecimento é obrigatório")
        @Size(max = 500, message = "O motivo deve ter no máximo 500 caracteres") String motivo) {
}
