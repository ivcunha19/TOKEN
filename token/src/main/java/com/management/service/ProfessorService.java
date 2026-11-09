package com.management.service;

import com.management.exception.RecursoNaoEncontradoException;
import com.management.model.Professor;
import com.management.repository.ProfessorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfessorService {

    private final ProfessorRepository professorRepository;

    public ProfessorService(ProfessorRepository professorRepository) {
        this.professorRepository = professorRepository;
    }

    public Professor buscarPorId(Long id) {
        return professorRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Professor não encontrado com ID: " + id));
    }

    /** Credita as 1.000 moedas do semestre atual ao professor, se ainda não recebidas. */
    @Transactional
    public void creditarSemestreSeNecessario(Professor professor) {
        if (professor.receberMoedasSemestrais()) {
            professorRepository.save(professor);
        }
    }

    /** Aplica o crédito semestral a todos os professores; retorna quantos foram creditados. */
    @Transactional
    public int creditarSemestreParaTodos() {
        int creditados = 0;
        for (Professor professor : professorRepository.findAll()) {
            if (professor.receberMoedasSemestrais()) {
                creditados++;
            }
        }
        return creditados;
    }
}
