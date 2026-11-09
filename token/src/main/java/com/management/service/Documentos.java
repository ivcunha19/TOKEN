package com.management.service;

/** Normaliza CPF/CNPJ para o formato com pontuação, evitando duplicidade por formatação. */
final class Documentos {

    private Documentos() {
    }

    static String formatarCpf(String cpf) {
        String d = apenasDigitos(cpf);
        if (d.length() != 11) {
            return cpf == null ? null : cpf.trim();
        }
        return d.substring(0, 3) + "." + d.substring(3, 6) + "." + d.substring(6, 9) + "-" + d.substring(9);
    }

    static String formatarCnpj(String cnpj) {
        String d = apenasDigitos(cnpj);
        if (d.length() != 14) {
            return cnpj == null ? null : cnpj.trim();
        }
        return d.substring(0, 2) + "." + d.substring(2, 5) + "." + d.substring(5, 8) + "/"
                + d.substring(8, 12) + "-" + d.substring(12);
    }

    private static String apenasDigitos(String valor) {
        return valor == null ? "" : valor.replaceAll("[^0-9]", "");
    }
}
