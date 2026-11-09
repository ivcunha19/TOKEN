package com.management.repository;

import com.management.model.Vantagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VantagemRepository extends JpaRepository<Vantagem, Long> {
    List<Vantagem> findByEmpresaIdOrderByNomeAsc(Long empresaId);
    List<Vantagem> findAllByOrderByNomeAsc();
}
