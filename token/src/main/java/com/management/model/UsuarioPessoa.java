package com.management.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "USUARIO_PESSOA")
@PrimaryKeyJoinColumn(name = "USUARIO_ID")
public abstract class UsuarioPessoa extends Usuario {

    @NotBlank(message = "O CPF é obrigatório")
    @Column(name = "CPF", nullable = false, unique = true, length = 14)
    protected String cpf;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "INSTITUICAO_ID")
    protected Instituicao instituicao;

    @Column(name = "HISTORICO", length = 2000)
    protected String historico = "";

    @Column(name = "SALDO", nullable = false)
    protected int saldo = 0;

    public UsuarioPessoa() {
        super();
    }

    public UsuarioPessoa(String nome, String senha, String login, String email, String cpf, Instituicao instituicao, int saldoInicial) {
        super(nome, senha, login, email);
        this.cpf = cpf;
        this.instituicao = instituicao;
        this.saldo = saldoInicial;
        this.historico = "";
    }

    public String consultarExtrato() {
        return "Saldo atual: " + this.saldo + " moedas | Histórico: " + (this.historico != null ? this.historico : "");
    }

    public String consultaHistorico() {
        return this.historico != null ? this.historico : "";
    }

    public void adicionarMoedas(int quantidade) {
        if (quantidade > 0) {
            this.saldo += quantidade;
        }
    }

    public boolean debitarMoedas(int quantidade) {
        if (quantidade > 0 && this.saldo >= quantidade) {
            this.saldo -= quantidade;
            return true;
        }
        return false;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public Instituicao getInstituicao() {
        return instituicao;
    }

    public void setInstituicao(Instituicao instituicao) {
        this.instituicao = instituicao;
    }

    public String getHistorico() {
        return historico;
    }

    public void setHistorico(String historico) {
        this.historico = historico;
    }

    public int getSaldo() {
        return saldo;
    }

    public void setSaldo(int saldo) {
        this.saldo = saldo;
    }
}
