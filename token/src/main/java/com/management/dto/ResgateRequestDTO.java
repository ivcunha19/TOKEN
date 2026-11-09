package com.management.dto;

import jakarta.validation.constraints.NotNull;

public record ResgateRequestDTO(@NotNull(message = "Selecione a vantagem") Long vantagemId) {
}
