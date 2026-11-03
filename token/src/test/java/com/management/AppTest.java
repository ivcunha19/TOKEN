package com.management;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.management.dto.AlunoRequestDTO;
import com.management.dto.EmpresaRequestDTO;
import com.management.model.ECurso;
import com.management.model.Instituicao;
import com.management.repository.InstituicaoRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class AppTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private InstituicaoRepository instituicaoRepository;

    @Test
    void deveExecutarCrudCompletoDeAluno() throws Exception {
        Instituicao inst = instituicaoRepository.findAll().getFirst();

        // 1. CREATE
        AlunoRequestDTO novoAluno = new AlunoRequestDTO();
        novoAluno.setNome("Mariana Costa");
        novoAluno.setEmail("mariana.costa@pucminas.br");
        novoAluno.setLogin("mariana.costa");
        novoAluno.setSenha("senhaSegura123");
        novoAluno.setCpf("987.654.321-99");
        novoAluno.setRg("MG-99.888.777");
        novoAluno.setEndereco("Rua da Bahia, 1200 - Centro, BH");
        novoAluno.setInstituicaoId(inst.getId());
        novoAluno.setCurso(ECurso.CIENCIA_DA_COMPUTACAO);
        novoAluno.setMatricula(765432);

        MvcResult createResult = mockMvc.perform(post("/api/alunos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(novoAluno)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.nome", is("Mariana Costa")))
                .andExpect(jsonPath("$.saldo", is(0)))
                .andReturn();

        Long idCriado = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asLong();

        // 2. READ
        mockMvc.perform(get("/api/alunos/" + idCriado))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cpf", is("987.654.321-99")));

        // 3. UPDATE
        novoAluno.setNome("Mariana Costa Atualizada");
        novoAluno.setCurso(ECurso.ENGENHARIA_DE_SOFTWARE);

        mockMvc.perform(put("/api/alunos/" + idCriado)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(novoAluno)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome", is("Mariana Costa Atualizada")))
                .andExpect(jsonPath("$.curso", is("ENGENHARIA_DE_SOFTWARE")));

        // 4. DELETE
        mockMvc.perform(delete("/api/alunos/" + idCriado))
                .andExpect(status().isNoContent());
    }

    @Test
    void deveExecutarCrudCompletoDeEmpresaParceira() throws Exception {
        // 1. CREATE
        EmpresaRequestDTO novaEmpresa = new EmpresaRequestDTO();
        novaEmpresa.setNome("Restaurante Universitário Gourmet");
        novaEmpresa.setCnpj("98.765.432/0001-10");
        novaEmpresa.setEmail("parceria@rugourmet.com.br");
        novaEmpresa.setLogin("ru.gourmet");
        novaEmpresa.setSenha("empresa456");
        novaEmpresa.setDescricao("Descontos em refeições e lanches para estudantes universitários.");

        MvcResult createResult = mockMvc.perform(post("/api/empresas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(novaEmpresa)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.nome", is("Restaurante Universitário Gourmet")))
                .andReturn();

        Long idCriado = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asLong();

        // 2. READ
        mockMvc.perform(get("/api/empresas/" + idCriado))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cnpj", is("98.765.432/0001-10")));

        // 3. UPDATE
        novaEmpresa.setDescricao("Descontos de até 50% em refeições executivas e lanches.");

        mockMvc.perform(put("/api/empresas/" + idCriado)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(novaEmpresa)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.descricao", containsString("50%")));

        // 4. DELETE
        mockMvc.perform(delete("/api/empresas/" + idCriado))
                .andExpect(status().isNoContent());
    }
}
