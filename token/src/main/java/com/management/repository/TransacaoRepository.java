package com.management.repository;

import com.management.model.Transacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransacaoRepository extends JpaRepository<Transacao, Long> {
    List<Transacao> findByAlunoIdOrderByDataHoraDesc(Long alunoId);
    List<Transacao> findByProfessorIdOrderByDataHoraDesc(Long professorId);
}
