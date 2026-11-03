package com.management.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "USUARIO")
@Inheritance(strategy = InheritanceType.JOINED)
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @NotBlank(message = "O nome é obrigatório")
    @Column(name = "NOME", nullable = false)
    protected String nome;

    @NotBlank(message = "A senha é obrigatória")
    @Column(name = "SENHA", nullable = false)
    protected String senha;

    @NotBlank(message = "O login é obrigatório")
    @Column(name = "LOGIN", nullable = false, unique = true)
    protected String login;

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "E-mail inválido")
    @Column(name = "EMAIL", nullable = false, unique = true)
    protected String email;

    public Usuario() {
    }

    public Usuario(String nome, String senha, String login, String email) {
        this.nome = nome;
        this.senha = senha;
        this.login = login;
        this.email = email;
    }

    public boolean autenticar(String loginInformado, String senhaInformada) {
        return this.login != null
                && this.senha != null
                && this.login.equals(loginInformado)
                && this.senha.equals(senhaInformada);
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

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
