package com.management;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** O Spring Boot serve o build do React e devolve o index.html nas rotas do React Router. */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:spadb;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "token.email.habilitado=false"
})
class SpaFallbackTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void deveServirOIndexNasRotasDoFrontEnd() throws Exception {
        for (String rota : new String[]{"/index.html", "/login", "/aluno/extrato", "/empresa/cupons"}) {
            mockMvc.perform(get(rota))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString("SPA-TOKEN")));
        }
    }

    @Test
    void naoDeveMascararRotasDaApiNemArquivosInexistentes() throws Exception {
        mockMvc.perform(get("/api/rota-inexistente")).andExpect(status().isNotFound());
        mockMvc.perform(get("/assets/inexistente.js")).andExpect(status().isNotFound());
    }
}
