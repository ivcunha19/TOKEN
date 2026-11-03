package com.management.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "TRANSACAO")
public class Transacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "VALOR", nullable = false)
    private int valor;

    @Column(name = "DATA_HORA", nullable = false)
    private LocalDateTime dataHora;

    @Column(name = "DESCRICAO", nullable = false, length = 500)
    private String descricaoMotivo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ALUNO_ID", nullable = false)
    private Aluno aluno;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "PROFESSOR_ID", nullable = false)
    private Professor professor;

    public Transacao() {
        this.dataHora = LocalDateTime.now();
    }

    public Transacao(int valor, String descricaoMotivo, Aluno aluno, Professor professor) {
        this.valor = valor;
        this.dataHora = LocalDateTime.now();
        this.descricaoMotivo = descricaoMotivo;
        this.aluno = aluno;
        this.professor = professor;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getValor() {
        return valor;
    }

    public void setValor(int valor) {
        this.valor = valor;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }

    public String getDescricaoMotivo() {
        return descricaoMotivo;
    }

    public void setDescricaoMotivo(String descricaoMotivo) {
        this.descricaoMotivo = descricaoMotivo;
    }

    public Aluno getAluno() {
        return aluno;
    }

    public void setAluno(Aluno aluno) {
        this.aluno = aluno;
    }

    public Professor getProfessor() {
        return professor;
    }

    public void setProfessor(Professor professor) {
        this.professor = professor;
    }
}
