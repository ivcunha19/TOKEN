package com.management.model;

import java.time.LocalDate;

/** Utilitário para identificar o semestre letivo (ex.: "2026-1", "2026-2"). */
public final class Semestre {

    private Semestre() {
    }

    public static String atual() {
        return de(LocalDate.now());
    }

    public static String de(LocalDate data) {
        return data.getYear() + "-" + (data.getMonthValue() <= 6 ? 1 : 2);
    }
}
