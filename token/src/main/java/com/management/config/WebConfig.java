package com.management.config;

import com.management.auth.AutenticacaoInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private static final String INDEX = "static/index.html";

    private final AutenticacaoInterceptor autenticacaoInterceptor;

    public WebConfig(AutenticacaoInterceptor autenticacaoInterceptor) {
        this.autenticacaoInterceptor = autenticacaoInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(autenticacaoInterceptor).addPathPatterns("/api/**");
    }

    /**
     * Serve o build do front-end React (copiado para classpath:/static no build do Docker).
     * Rotas do React Router (ex.: /aluno/extrato) não são arquivos: devolvemos o index.html
     * para o roteamento acontecer no navegador. Caminhos /api nunca caem nesse fallback.
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource solicitado = location.createRelative(resourcePath);
                        if (solicitado.exists() && solicitado.isReadable()) {
                            return solicitado;
                        }
                        if (resourcePath.startsWith("api/") || resourcePath.contains(".")) {
                            return null; // 404 para API inexistente e arquivos ausentes (ex.: .js, .png)
                        }
                        Resource index = new ClassPathResource(INDEX);
                        return index.exists() ? index : null;
                    }
                });
    }
}
