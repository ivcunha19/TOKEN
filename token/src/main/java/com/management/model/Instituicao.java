package com.management.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "INSTITUICAO")
public class Instituicao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @NotBlank(message = "O nome da instituição é obrigatório")
    @Column(name = "NOME", nullable = false)
    private String nome;

    @Column(name = "CNPJ", unique = true)
    private String cnpj;

    @JsonIgnore
    @OneToMany(mappedBy = "instituicao", cascade = CascadeType.ALL)
    private List<Aluno> listaAlunos = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "instituicao", cascade = CascadeType.ALL)
    private List<Professor> listaProfessores = new ArrayList<>();

    public Instituicao() {
    }

    public Instituicao(String nome, String cnpj) {
        this.nome = nome;
        this.cnpj = cnpj;
    }

    public void adicionarProfessor(Professor professor) {
        if (professor != null) {
            professor.setInstituicao(this);
            this.listaProfessores.add(professor);
        }
    }

    public void vincularAluno(Aluno aluno) {
        if (aluno != null) {
            aluno.setInstituicao(this);
            this.listaAlunos.add(aluno);
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public List<Aluno> getListaAlunos() {
        return listaAlunos;
    }

    public void setListaAlunos(List<Aluno> listaAlunos) {
        this.listaAlunos = listaAlunos;
    }

    public List<Professor> getListaProfessores() {
        return listaProfessores;
    }

    public void setListaProfessores(List<Professor> listaProfessores) {
        this.listaProfessores = listaProfessores;
    }
}
