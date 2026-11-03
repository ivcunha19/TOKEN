package com.management.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "RESGATE_VANTAGEM")
public class ResgateVantagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "COD_CUPOM", nullable = false, unique = true)
    private String codigoCupom;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ALUNO_ID", nullable = false)
    private Aluno aluno;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "VANTAGEM_ID", nullable = false)
    private Vantagem vantagem;

    @Column(name = "VALOR", nullable = false)
    private int valor;

    @Column(name = "DATA_HORA", nullable = false)
    private LocalDateTime dataHora;

    @Column(name = "DESCRICAO_MOTIVO", length = 500)
    private String descricaoMotivo;

    public ResgateVantagem() {
        this.dataHora = LocalDateTime.now();
    }

    public ResgateVantagem(String codigoCupom, Aluno aluno, Vantagem vantagem, int valor, String descricaoMotivo) {
        this.codigoCupom = codigoCupom;
        this.aluno = aluno;
        this.vantagem = vantagem;
        this.valor = valor;
        this.dataHora = LocalDateTime.now();
        this.descricaoMotivo = descricaoMotivo;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigoCupom() {
        return codigoCupom;
    }

    public void setCodigoCupom(String codigoCupom) {
        this.codigoCupom = codigoCupom;
    }

    public Aluno getAluno() {
        return aluno;
    }

    public void setAluno(Aluno aluno) {
        this.aluno = aluno;
    }

    public Vantagem getVantagem() {
        return vantagem;
    }

    public void setVantagem(Vantagem vantagem) {
        this.vantagem = vantagem;
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
}
