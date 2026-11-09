package com.management.config;

import com.management.service.ProfessorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

/**
 * Habilita tarefas assíncronas (envio de e-mails) e agendadas
 * (crédito semestral de 1.000 moedas aos professores, acumulável).
 */
@Configuration
@EnableAsync
@EnableScheduling
public class AgendamentoConfig {

    private static final Logger log = LoggerFactory.getLogger(AgendamentoConfig.class);

    private final ProfessorService professorService;

    public AgendamentoConfig(ProfessorService professorService) {
        this.professorService = professorService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void creditarAoIniciar() {
        creditarSemestre();
    }

    /** Executa diariamente às 00:05; só credita quando o semestre muda. */
    @Scheduled(cron = "0 5 0 * * *")
    public void creditarSemestre() {
        int creditados = professorService.creditarSemestreParaTodos();
        if (creditados > 0) {
            log.info("Crédito semestral aplicado a {} professor(es).", creditados);
        }
    }
}
