package com.management.repository;

import com.management.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByLogin(String login);
    Optional<Usuario> findByEmail(String email);
    boolean existsByLogin(String login);
    boolean existsByEmail(String email);

    /** CPF é único entre todas as pessoas (alunos e professores). */
    @Query("select count(p) > 0 from UsuarioPessoa p where p.cpf = :cpf")
    boolean existsPessoaByCpf(@Param("cpf") String cpf);
}
