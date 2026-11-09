package com.management.model;

import com.management.exception.RegraNegocioException;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "ALUNO")
@PrimaryKeyJoinColumn(name = "USUARIO_PESSOA_ID")
public class Aluno extends UsuarioPessoa {

    @NotBlank(message = "O RG é obrigatório")
    @Column(name = "RG", nullable = false, length = 20)
    private String rg;

    @NotBlank(message = "O endereço é obrigatório")
    @Column(name = "ENDERECO", nullable = false)
    private String endereco;

    @NotNull(message = "O curso é obrigatório")
    @Enumerated(EnumType.STRING)
    @Column(name = "CURSO", nullable = false)
    private ECurso curso;

    @Column(name = "MATRICULA")
    private Integer matricula;

    public Aluno() {
        super();
    }

    public Aluno(String nome, String senha, String login, String email, String cpf,
                 Instituicao instituicao, String rg, String endereco, ECurso curso, Integer matricula) {
        super(nome, senha, login, email, cpf, instituicao, 0);
        this.rg = rg;
        this.endereco = endereco;
        this.curso = curso;
        this.matricula = matricula;
    }

    /**
     * Troca moedas por uma vantagem: valida estoque e saldo, debita o custo,
     * baixa o estoque e devolve o registro de resgate com o código do cupom.
     */
    public ResgateVantagem resgatarVantagem(Vantagem vantagem, String codigoCupom) {
        if (vantagem == null) {
            throw new RegraNegocioException("Selecione uma vantagem para resgatar.");
        }
        if (!vantagem.verificarDisponibilidade()) {
            throw new RegraNegocioException("A vantagem \"" + vantagem.getNome() + "\" está esgotada.");
        }
        if (!this.debitarMoedas(vantagem.getCusto())) {
            throw new RegraNegocioException("Saldo insuficiente. A vantagem custa " + vantagem.getCusto()
                    + " moedas e seu saldo é de " + this.saldo + " moedas.");
        }
        vantagem.reduzirEstoque();
        return new ResgateVantagem(codigoCupom, this, vantagem, vantagem.getCusto(),
                "Resgate da vantagem: " + vantagem.getNome());
    }

    public String getRg() {
        return rg;
    }

    public void setRg(String rg) {
        this.rg = rg;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public ECurso getCurso() {
        return curso;
    }

    public void setCurso(ECurso curso) {
        this.curso = curso;
    }

    public Integer getMatricula() {
        return matricula;
    }

    public void setMatricula(Integer matricula) {
        this.matricula = matricula;
    }
}
