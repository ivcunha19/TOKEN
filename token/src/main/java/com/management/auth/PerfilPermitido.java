package com.management.auth;

import com.management.model.ETipoUsuario;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** Restringe um endpoint (ou controller inteiro) aos perfis de usuário informados. */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.TYPE})
public @interface PerfilPermitido {
    ETipoUsuario[] value();
}
