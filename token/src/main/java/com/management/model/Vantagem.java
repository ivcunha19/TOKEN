package com.management.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "VANTAGEM")
public class Vantagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @NotBlank(message = "O nome da vantagem é obrigatório")
    @Column(name = "NOME", nullable = false)
    private String nome;

    @Min(value = 1, message = "O custo deve ser de pelo menos 1 moeda")
    @Column(name = "CUSTO", nullable = false)
    private int custo;

    @NotBlank(message = "A descrição da vantagem é obrigatória")
    @Column(name = "DESCRICAO", nullable = false, length = 1000)
    private String descricao;

    @Min(value = 0, message = "A quantidade não pode ser negativa")
    @Column(name = "QUANTIDADE", nullable = false)
    private int quantidade;

    @Column(name = "FOTO", length = 1000)
    private String foto;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "EMPRESA_ID", nullable = false)
    private Empresa empresa;

    public Vantagem() {
    }

    public Vantagem(String nome, int custo, String descricao, int quantidade, String foto, Empresa empresa) {
        this.nome = nome;
        this.custo = custo;
        this.descricao = descricao;
        this.quantidade = quantidade;
        this.foto = foto;
        this.empresa = empresa;
    }

    public boolean verificarDisponibilidade() {
        return this.quantidade > 0;
    }

    public void reduzirEstoque() {
        if (this.quantidade > 0) {
            this.quantidade--;
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

    public int getCusto() {
        return custo;
    }

    public void setCusto(int custo) {
        this.custo = custo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public int getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(int quantidade) {
        this.quantidade = quantidade;
    }

    public String getFoto() {
        return foto;
    }

    public void setFoto(String foto) {
        this.foto = foto;
    }

    public Empresa getEmpresa() {
        return empresa;
    }

    public void setEmpresa(Empresa empresa) {
        this.empresa = empresa;
    }
}
