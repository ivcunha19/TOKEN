package com.management.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "PROFESSOR")
@PrimaryKeyJoinColumn(name = "USUARIO_PESSOA_ID")
public class Professor extends UsuarioPessoa {

    public static final int VALORMENSAL_PADRAO = 1000;

    @NotNull(message = "O departamento é obrigatório")
    @Enumerated(EnumType.STRING)
    @Column(name = "DEPARTAMENTO", nullable = false)
    private EDepartamento departamento;

    @Column(name = "VALOR_MENSAL", nullable = false)
    private int valorMensal = VALORMENSAL_PADRAO;

    public Professor() {
        super();
        this.saldo = VALORMENSAL_PADRAO;
        this.valorMensal = VALORMENSAL_PADRAO;
    }

    public Professor(String nome, String senha, String login, String email, String cpf,
                     Instituicao instituicao, EDepartamento departamento) {
        super(nome, senha, login, email, cpf, instituicao, VALORMENSAL_PADRAO);
        this.departamento = departamento;
        this.valorMensal = VALORMENSAL_PADRAO;
    }

    public String enviarMoedas() {
        return "Transferência de moedas realizada.";
    }

    public void receberMoedasSemestrais() {
        this.adicionarMoedas(this.valorMensal);
    }

    public EDepartamento getDepartamento() {
        return departamento;
    }

    public void setDepartamento(EDepartamento departamento) {
        this.departamento = departamento;
    }

    public int getValorMensal() {
        return valorMensal;
    }

    public void setValorMensal(int valorMensal) {
        this.valorMensal = valorMensal;
    }
}
