package com.management.service;

import com.management.event.MoedasEnviadasEvent;
import com.management.event.VantagemResgatadaEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.format.DateTimeFormatter;

/**
 * Envia as notificações por e-mail (componente NotificacaoEmailService).
 * Os e-mails só saem depois que a transação é confirmada no banco (AFTER_COMMIT)
 * e são enviados de forma assíncrona para não travar a requisição.
 */
@Service
public class NotificacaoEmailService {

    private static final Logger log = LoggerFactory.getLogger(NotificacaoEmailService.class);
    private static final DateTimeFormatter FORMATO_DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final ObjectProvider<JavaMailSender> mailSender;
    private final boolean habilitado;
    private final String remetente;

    public NotificacaoEmailService(ObjectProvider<JavaMailSender> mailSender,
                                   @Value("${token.email.habilitado:true}") boolean habilitado,
                                   @Value("${token.email.remetente:nao-responda@token.edu.br}") String remetente) {
        this.mailSender = mailSender;
        this.habilitado = habilitado;
        this.remetente = remetente;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void notificarRecebimentoMoedas(MoedasEnviadasEvent e) {
        String corpo = """
                Olá, %s!

                Você recebeu %d moeda(s) do(a) professor(a) %s.

                Motivo do reconhecimento:
                "%s"

                Seu saldo atual é de %d moeda(s).
                Acesse o TOKEN para consultar seu extrato e trocar suas moedas por vantagens.

                — Equipe TOKEN · Sistema de Moeda Estudantil
                """.formatted(e.nomeAluno(), e.valor(), e.nomeProfessor(), e.motivo(), e.saldoAluno());
        enviar(e.emailAluno(), "[TOKEN] Você recebeu " + e.valor() + " moeda(s)!", corpo);
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void notificarResgate(VantagemResgatadaEvent e) {
        String data = e.dataHora().format(FORMATO_DATA);

        String corpoAluno = """
                Olá, %s!

                Seu resgate foi realizado com sucesso. Apresente o cupom abaixo na empresa parceira.

                CÓDIGO DO CUPOM: %s

                Vantagem: %s
                Empresa parceira: %s
                Custo: %d moeda(s)
                Data do resgate: %s
                Saldo restante: %d moeda(s)

                — Equipe TOKEN · Sistema de Moeda Estudantil
                """.formatted(e.nomeAluno(), e.codigoCupom(), e.nomeVantagem(), e.nomeEmpresa(), e.custo(), data,
                e.saldoAluno());
        enviar(e.emailAluno(), "[TOKEN] Seu cupom " + e.codigoCupom() + " - " + e.nomeVantagem(), corpoAluno);

        String corpoEmpresa = """
                Olá, %s!

                Um aluno resgatou uma vantagem oferecida pela sua empresa no TOKEN.
                Confira o código abaixo no momento da troca presencial.

                CÓDIGO DO CUPOM: %s

                Vantagem: %s
                Aluno: %s (%s)
                Data do resgate: %s

                Você também pode conferir e marcar o cupom como utilizado no painel da empresa.

                — Equipe TOKEN · Sistema de Moeda Estudantil
                """.formatted(e.nomeEmpresa(), e.codigoCupom(), e.nomeVantagem(), e.nomeAluno(), e.emailAluno(), data);
        enviar(e.emailEmpresa(), "[TOKEN] Novo resgate: cupom " + e.codigoCupom(), corpoEmpresa);
    }

    private void enviar(String para, String assunto, String corpo) {
        JavaMailSender sender = mailSender.getIfAvailable();
        if (!habilitado || sender == null) {
            log.info("[E-mail desabilitado] Para: {} | Assunto: {}", para, assunto);
            return;
        }
        try {
            SimpleMailMessage mensagem = new SimpleMailMessage();
            mensagem.setFrom(remetente);
            mensagem.setTo(para);
            mensagem.setSubject(assunto);
            mensagem.setText(corpo);
            sender.send(mensagem);
            log.info("E-mail enviado para {}: {}", para, assunto);
        } catch (MailException ex) {
            log.warn("Falha ao enviar e-mail para {} ({}): {}", para, assunto, ex.getMessage());
        }
    }
}
