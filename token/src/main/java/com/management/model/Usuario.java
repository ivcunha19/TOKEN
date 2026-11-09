package com.management.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.crypto.bcrypt.BCrypt;

@Entity
@Table(name = "USUARIO")
@Inheritance(strategy = InheritanceType.JOINED)
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    /** Controle de concorrência otimista (evita gasto duplo de saldo). */
    @Version
    @Column(name = "VERSAO")
    private Long versao;

    @NotBlank(message = "O nome é obrigatório")
    @Column(name = "NOME", nullable = false)
    protected String nome;

    /** Armazenada sempre como hash BCrypt; nunca serializada no JSON. */
    @JsonIgnore
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
        this.senha = gerarHash(senha);
        this.login = login;
        this.email = email;
    }

    public boolean autenticar(String loginInformado, String senhaInformada) {
        if (this.login == null || this.senha == null || senhaInformada == null) {
            return false;
        }
        if (!this.login.equals(loginInformado)) {
            return false;
        }
        try {
            return BCrypt.checkpw(senhaInformada, this.senha);
        } catch (IllegalArgumentException e) {
            // senha armazenada fora do formato BCrypt (ex.: base antiga em texto puro)
            return false;
        }
    }

    public void alterarSenha(String novaSenha) {
        this.senha = gerarHash(novaSenha);
    }

    private static String gerarHash(String senhaPura) {
        if (senhaPura == null || senhaPura.isBlank()) {
            throw new IllegalArgumentException("A senha é obrigatória.");
        }
        return BCrypt.hashpw(senhaPura, BCrypt.gensalt());
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

    @JsonIgnore
    public String getSenha() {
        return senha;
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
