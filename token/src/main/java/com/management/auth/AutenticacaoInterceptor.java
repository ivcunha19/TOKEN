package com.management.auth;

import com.management.exception.AcessoNegadoException;
import com.management.exception.NaoAutenticadoException;
import com.management.service.AutenticacaoService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;

/**
 * Exige sessão autenticada em todos os endpoints da API, exceto os marcados com {@link Publico},
 * e verifica o perfil exigido por {@link PerfilPermitido}.
 */
@Component
public class AutenticacaoInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!(handler instanceof HandlerMethod metodo) || metodo.hasMethodAnnotation(Publico.class)) {
            return true;
        }

        HttpSession sessao = request.getSession(false);
        Object atributo = sessao == null ? null : sessao.getAttribute(AutenticacaoService.SESSAO_USUARIO);
        if (!(atributo instanceof UsuarioLogado usuario)) {
            throw new NaoAutenticadoException("Faça login para acessar este recurso.");
        }

        PerfilPermitido perfil = metodo.getMethodAnnotation(PerfilPermitido.class);
        if (perfil == null) {
            perfil = metodo.getBeanType().getAnnotation(PerfilPermitido.class);
        }
        if (perfil != null && Arrays.stream(perfil.value()).noneMatch(t -> t == usuario.tipo())) {
            throw new AcessoNegadoException("Seu perfil não tem permissão para realizar esta operação.");
        }
        return true;
    }
}
