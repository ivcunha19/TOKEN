package com.management.controller;

import com.management.exception.AcessoNegadoException;
import com.management.exception.NaoAutenticadoException;
import com.management.exception.RecursoNaoEncontradoException;
import com.management.exception.RegraNegocioException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.ServletRequestBindingException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.LinkedHashMap;
import java.util.Map;

/** Traduz exceções em respostas JSON padronizadas: { "erro": "...", "campos": {...} }. */
@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> naoEncontrado(RecursoNaoEncontradoException ex) {
        return erro(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(RegraNegocioException.class)
    public ResponseEntity<Map<String, Object>> regraNegocio(RegraNegocioException ex) {
        return erro(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage());
    }

    @ExceptionHandler(NaoAutenticadoException.class)
    public ResponseEntity<Map<String, Object>> naoAutenticado(NaoAutenticadoException ex) {
        return erro(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    /** @SessionAttribute ausente (sessão expirada) também resulta em 401. */
    @ExceptionHandler(ServletRequestBindingException.class)
    public ResponseEntity<Map<String, Object>> requisicaoIncompleta(ServletRequestBindingException ex) {
        if (ex instanceof MissingServletRequestParameterException) {
            return erro(HttpStatus.BAD_REQUEST, ex.getMessage());
        }
        return erro(HttpStatus.UNAUTHORIZED, "Faça login para acessar este recurso.");
    }

    @ExceptionHandler(AcessoNegadoException.class)
    public ResponseEntity<Map<String, Object>> acessoNegado(AcessoNegadoException ex) {
        return erro(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> argumentoInvalido(IllegalArgumentException ex) {
        return erro(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    /** Cobre @Valid em @RequestBody (MethodArgumentNotValidException) e em @ModelAttribute. */
    @ExceptionHandler(BindException.class)
    public ResponseEntity<Map<String, Object>> validacao(BindException ex) {
        Map<String, String> campos = new LinkedHashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            campos.putIfAbsent(fieldError.getField(), fieldError.getDefaultMessage());
        }
        String primeiraMensagem = campos.values().stream().findFirst().orElse("Dados inválidos.");
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("erro", primeiraMensagem);
        body.put("campos", campos);
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> corpoInvalido(HttpMessageNotReadableException ex) {
        return erro(HttpStatus.BAD_REQUEST, "Requisição inválida: verifique os dados enviados.");
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> uploadGrande(MaxUploadSizeExceededException ex) {
        return erro(HttpStatus.PAYLOAD_TOO_LARGE, "Arquivo muito grande. A foto deve ter no máximo 2 MB.");
    }

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<Map<String, Object>> concorrencia(ObjectOptimisticLockingFailureException ex) {
        return erro(HttpStatus.CONFLICT, "Os dados foram alterados por outra operação ao mesmo tempo. Tente novamente.");
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> integridade(DataIntegrityViolationException ex) {
        log.warn("Violação de integridade: {}", ex.getMostSpecificCause().getMessage());
        return erro(HttpStatus.CONFLICT, "Operação não permitida: registro duplicado ou vinculado a outros dados.");
    }

    private static ResponseEntity<Map<String, Object>> erro(HttpStatus status, String mensagem) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("erro", mensagem);
        return ResponseEntity.status(status).body(body);
    }
}
