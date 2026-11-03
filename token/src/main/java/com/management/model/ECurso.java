package com.management.model;

public enum ECurso {
    ENGENHARIA_DE_SOFTWARE("Engenharia de Software"),
    CIENCIA_DA_COMPUTACAO("Ciência da Computação"),
    SISTEMAS_DE_INFORMACAO("Sistemas de Informação"),
    ENGENHARIA_DA_COMPUTACAO("Engenharia da Computação"),
    ANALISE_E_DESENVOLVIMENTO_DE_SISTEMAS("Análise e Desenvolvimento de Sistemas"),
    DIREITO("Direito"),
    ADMINISTRACAO("Administração"),
    ARQUITETURA_E_URBANISMO("Arquitetura e Urbanismo");

    private final String nome;

    ECurso(String nome) {
        this.nome = nome;
    }

    public String getNome() {
        return nome;
    }
}
