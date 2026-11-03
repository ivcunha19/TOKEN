package com.management.model;

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

    public void resgatarVantagem() {
        // Implementação completa prevista na US07 / Sprint 03
    }

    public void enviarEmail() {
        // Notificação por e-mail prevista nas US05/US07
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
