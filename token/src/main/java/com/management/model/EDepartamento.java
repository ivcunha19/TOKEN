package com.management.model;

public enum EDepartamento {
    COMPUTACAO_E_SISTEMAS("Computação e Sistemas"),
    ENGENHARIAS("Engenharias"),
    MATEMATICA_E_ESTATISTICA("Matemática e Estatística"),
    CIENCIAS_SOCIAIS_E_JURIDICAS("Ciências Sociais e Jurídicas"),
    GESTAO_E_NEGOCIOS("Gestão e Negócios");

    private final String nome;

    EDepartamento(String nome) {
        this.nome = nome;
    }

    public String getNome() {
        return nome;
    }
}
