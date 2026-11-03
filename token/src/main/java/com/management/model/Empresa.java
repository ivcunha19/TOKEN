package com.management.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "EMPRESA")
@PrimaryKeyJoinColumn(name = "USUARIO_ID")
public class Empresa extends Usuario {

    @NotBlank(message = "A descrição da empresa é obrigatória")
    @Column(name = "DESCRICAO", nullable = false, length = 1000)
    private String descricao;

    @NotBlank(message = "O CNPJ é obrigatório")
    @Column(name = "CNPJ", nullable = false, unique = true, length = 18)
    private String cnpj;

    @JsonIgnore
    @OneToMany(mappedBy = "empresa", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Vantagem> listaVantagem = new ArrayList<>();

    public Empresa() {
        super();
    }

    public Empresa(String nome, String senha, String login, String email, String descricao, String cnpj) {
        super(nome, senha, login, email);
        this.descricao = descricao;
        this.cnpj = cnpj;
    }

    public Vantagem cadastrarVantagem(String nome, String descricao, int custo, String foto, int quantidade) {
        Vantagem vantagem = new Vantagem(nome, custo, descricao, quantidade, foto, this);
        this.listaVantagem.add(vantagem);
        return vantagem;
    }

    public boolean conferirCupom(String codigo) {
        return codigo != null && !codigo.isBlank();
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public List<Vantagem> getListaVantagem() {
        return listaVantagem;
    }

    public void setListaVantagem(List<Vantagem> listaVantagem) {
        this.listaVantagem = listaVantagem;
    }
}
