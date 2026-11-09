package com.management.model;

import com.management.exception.RegraNegocioException;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.util.Objects;

@Entity
@Table(name = "PROFESSOR")
@PrimaryKeyJoinColumn(name = "USUARIO_PESSOA_ID")
public class Professor extends UsuarioPessoa {

    /** Moedas recebidas pelo professor a cada semestre (acumuláveis). */
    public static final int VALORMENSAL_PADRAO = 1000;

    @NotNull(message = "O departamento é obrigatório")
    @Enumerated(EnumType.STRING)
    @Column(name = "DEPARTAMENTO", nullable = false)
    private EDepartamento departamento;

    @Column(name = "VALOR_MENSAL", nullable = false)
    private int valorMensal = VALORMENSAL_PADRAO;

    /** Último semestre (ex.: "2026-2") em que o crédito de moedas foi aplicado. */
    @Column(name = "ULTIMO_SEMESTRE_CREDITADO", length = 6)
    private String ultimoSemestreCreditado;

    public Professor() {
        super();
    }

    public Professor(String nome, String senha, String login, String email, String cpf,
                     Instituicao instituicao, EDepartamento departamento) {
        super(nome, senha, login, email, cpf, instituicao, VALORMENSAL_PADRAO);
        this.departamento = departamento;
        this.valorMensal = VALORMENSAL_PADRAO;
        this.ultimoSemestreCreditado = Semestre.atual();
    }

    /**
     * Envia moedas a um aluno da mesma instituição, debitando do saldo do professor.
     * O motivo do reconhecimento é obrigatório.
     */
    public Transacao enviarMoedas(Aluno aluno, int valor, String motivo) {
        if (aluno == null) {
            throw new RegraNegocioException("Selecione o aluno que receberá as moedas.");
        }
        if (valor <= 0) {
            throw new RegraNegocioException("A quantidade de moedas deve ser maior que zero.");
        }
        if (motivo == null || motivo.isBlank()) {
            throw new RegraNegocioException("O motivo do reconhecimento é obrigatório.");
        }
        if (this.instituicao == null || aluno.getInstituicao() == null
                || !Objects.equals(this.instituicao.getId(), aluno.getInstituicao().getId())) {
            throw new RegraNegocioException("Só é possível enviar moedas para alunos da sua instituição.");
        }
        if (!this.debitarMoedas(valor)) {
            throw new RegraNegocioException("Saldo insuficiente. Seu saldo atual é de " + this.saldo + " moedas.");
        }
        aluno.adicionarMoedas(valor);
        return new Transacao(valor, motivo.trim(), aluno, this);
    }

    /** Credita as moedas do semestre atual, caso ainda não tenham sido creditadas. */
    public boolean receberMoedasSemestrais() {
        return receberMoedasSemestrais(Semestre.atual());
    }

    public boolean receberMoedasSemestrais(String semestre) {
        if (semestre == null || semestre.equals(this.ultimoSemestreCreditado)) {
            return false;
        }
        this.adicionarMoedas(this.valorMensal);
        this.ultimoSemestreCreditado = semestre;
        return true;
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

    public String getUltimoSemestreCreditado() {
        return ultimoSemestreCreditado;
    }

    public void setUltimoSemestreCreditado(String ultimoSemestreCreditado) {
        this.ultimoSemestreCreditado = ultimoSemestreCreditado;
    }
}
