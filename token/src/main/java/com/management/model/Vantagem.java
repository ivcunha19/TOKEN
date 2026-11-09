package com.management.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "VANTAGEM")
public class Vantagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Version
    @Column(name = "VERSAO")
    private Long versao;

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

    /** Foto do produto (bytes da imagem). */
    @JsonIgnore
    @Lob
    @Column(name = "FOTO")
    private byte[] foto;

    /** Content-Type da foto (image/png, image/jpeg...). */
    @Column(name = "FOTO_TIPO", length = 50)
    private String fotoTipo;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "EMPRESA_ID", nullable = false)
    private Empresa empresa;

    @JsonIgnore
    @OneToMany(mappedBy = "vantagem")
    private List<ResgateVantagem> resgates = new ArrayList<>();

    public Vantagem() {
    }

    public Vantagem(String nome, int custo, String descricao, int quantidade,
                    byte[] foto, String fotoTipo, Empresa empresa) {
        this.nome = nome;
        this.custo = custo;
        this.descricao = descricao;
        this.quantidade = quantidade;
        this.foto = foto;
        this.fotoTipo = fotoTipo;
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

    public boolean possuiFoto() {
        return this.foto != null && this.foto.length > 0;
    }

    public void atualizarFoto(byte[] foto, String fotoTipo) {
        this.foto = foto;
        this.fotoTipo = fotoTipo;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getVersao() {
        return versao;
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

    public byte[] getFoto() {
        return foto;
    }

    public String getFotoTipo() {
        return fotoTipo;
    }

    public Empresa getEmpresa() {
        return empresa;
    }

    public void setEmpresa(Empresa empresa) {
        this.empresa = empresa;
    }

    public List<ResgateVantagem> getResgates() {
        return resgates;
    }
}
