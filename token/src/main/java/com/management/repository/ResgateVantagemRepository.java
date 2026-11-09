package com.management.repository;

import com.management.model.ResgateVantagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResgateVantagemRepository extends JpaRepository<ResgateVantagem, Long> {
    List<ResgateVantagem> findByAlunoIdOrderByDataHoraDesc(Long alunoId);
    List<ResgateVantagem> findByVantagemEmpresaIdOrderByDataHoraDesc(Long empresaId);
    Optional<ResgateVantagem> findByCodigoCupom(String codigoCupom);
    boolean existsByCodigoCupom(String codigoCupom);
    boolean existsByAlunoId(Long alunoId);
    boolean existsByVantagemId(Long vantagemId);
    boolean existsByVantagemEmpresaId(Long empresaId);
}
