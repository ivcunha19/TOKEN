package com.management.dto;

import com.management.model.ECurso;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.br.CPF;

/**
 * Dados de cadastro/edição do aluno. A senha é obrigatória no cadastro
 * e opcional na edição (em branco = mantém a senha atual).
 */
public class AlunoRequestDTO {

    @NotBlank(message = "O nome é obrigatório")
    @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres")
    private String nome;

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "Informe um e-mail válido")
    private String email;

    @NotBlank(message = "O login é obrigatório")
    @Size(min = 3, max = 50, message = "O login deve ter entre 3 e 50 caracteres")
    private String login;

    @Pattern(regexp = "^$|.{6,}", message = "A senha deve ter pelo menos 6 caracteres")
    private String senha;

    @NotBlank(message = "O CPF é obrigatório")
    @CPF(message = "Informe um CPF válido")
    private String cpf;

    @NotBlank(message = "O RG é obrigatório")
    @Size(max = 20, message = "O RG deve ter no máximo 20 caracteres")
    private String rg;

    @NotBlank(message = "O endereço é obrigatório")
    @Size(max = 255, message = "O endereço deve ter no máximo 255 caracteres")
    private String endereco;

    @NotNull(message = "A instituição de ensino é obrigatória")
    private Long instituicaoId;

    @NotNull(message = "O curso é obrigatório")
    private ECurso curso;

    @Positive(message = "A matrícula deve ser um número positivo")
    private Integer matricula;

    public AlunoRequestDTO() {
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
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

    public Long getInstituicaoId() {
        return instituicaoId;
    }

    public void setInstituicaoId(Long instituicaoId) {
        this.instituicaoId = instituicaoId;
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
