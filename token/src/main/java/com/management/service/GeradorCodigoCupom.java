package com.management.service;

import com.management.repository.ResgateVantagemRepository;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class GeradorCodigoCupom {

    private static final String ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final ResgateVantagemRepository resgateRepository;

    public GeradorCodigoCupom(ResgateVantagemRepository resgateRepository) {
        this.resgateRepository = resgateRepository;
    }

    public String gerarUnico() {
        String codigo;
        do {
            StringBuilder sb = new StringBuilder("TKN-");
            for (int i = 0; i < 8; i++) {
                if (i == 4) {
                    sb.append('-');
                }
                sb.append(ALFABETO.charAt(RANDOM.nextInt(ALFABETO.length())));
            }
            codigo = sb.toString();
        } while (resgateRepository.existsByCodigoCupom(codigo));
        return codigo;
    }
}
