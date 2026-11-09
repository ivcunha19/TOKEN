package com.management;

import com.fasterxml.jackson.databind.JsonNode;
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
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "token.email.habilitado=false"
})
class AppTest {

    private static final byte[] PNG_1X1 = {
            (byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0x0D, 'I', 'H', 'D', 'R',
            0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 0x1F, 0x15, (byte) 0xC4, (byte) 0x89
    };

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private InstituicaoRepository instituicaoRepository;

    // ---------------------------------------------------------------- CRUD Aluno (US02)

    @Test
    void deveExecutarCrudCompletoDeAlunoComAutenticacao() throws Exception {
        AlunoRequestDTO aluno = novoAluno("Mariana Costa", "mariana.costa", "529.982.247-25");

        mockMvc.perform(post("/api/alunos").contentType(MediaType.APPLICATION_JSON).content(json(aluno)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.saldo", is(0)))
                .andExpect(jsonPath("$.senha").doesNotExist());

        // sem login -> 401
        mockMvc.perform(get("/api/alunos/me")).andExpect(status().isUnauthorized());

        MockHttpSession sessao = login("mariana.costa", "senhaSegura123");

        mockMvc.perform(get("/api/alunos/me").session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cpf", is("529.982.247-25")))
                .andExpect(jsonPath("$.senha").doesNotExist());

        // edição sem informar senha mantém a senha atual
        aluno.setNome("Mariana Costa Atualizada");
        aluno.setCurso(ECurso.ENGENHARIA_DE_SOFTWARE);
        aluno.setSenha(null);
        mockMvc.perform(put("/api/alunos/me").session(sessao)
                        .contentType(MediaType.APPLICATION_JSON).content(json(aluno)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome", is("Mariana Costa Atualizada")))
                .andExpect(jsonPath("$.curso", is("ENGENHARIA_DE_SOFTWARE")));
        login("mariana.costa", "senhaSegura123");

        mockMvc.perform(delete("/api/alunos/me").session(sessao)).andExpect(status().isNoContent());

        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("login", "mariana.costa", "senha", "senhaSegura123"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deveRejeitarCadastroDeAlunoComCpfInvalidoOuDuplicado() throws Exception {
        AlunoRequestDTO invalido = novoAluno("Fulano", "fulano.cpf", "111.111.111-11");
        mockMvc.perform(post("/api/alunos").contentType(MediaType.APPLICATION_JSON).content(json(invalido)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.cpf", notNullValue()));

        // CPF de um aluno do seed, sem pontuação
        AlunoRequestDTO duplicado = novoAluno("Fulano", "fulano.dup", "93541134780");
        mockMvc.perform(post("/api/alunos").contentType(MediaType.APPLICATION_JSON).content(json(duplicado)))
                .andExpect(status().isUnprocessableEntity());
    }

    // ---------------------------------------------------------------- CRUD Empresa (US03) + Vantagens (US04)

    @Test
    void deveExecutarCrudDeEmpresaParceiraEDeVantagens() throws Exception {
        EmpresaRequestDTO empresa = new EmpresaRequestDTO();
        empresa.setNome("Restaurante Universitário Gourmet");
        empresa.setCnpj("11.222.333/0001-81");
        empresa.setEmail("parceria@rugourmet.com.br");
        empresa.setLogin("ru.gourmet");
        empresa.setSenha("empresa456");
        empresa.setDescricao("Descontos em refeições e lanches para estudantes universitários.");

        mockMvc.perform(post("/api/empresas").contentType(MediaType.APPLICATION_JSON).content(json(empresa)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.senha").doesNotExist());

        MockHttpSession sessao = login("ru.gourmet", "empresa456");

        empresa.setDescricao("Descontos de até 50% em refeições executivas e lanches.");
        empresa.setSenha("");
        mockMvc.perform(put("/api/empresas/me").session(sessao)
                        .contentType(MediaType.APPLICATION_JSON).content(json(empresa)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.descricao", containsString("50%")));

        // Cadastro de vantagem sem foto -> 422
        mockMvc.perform(multipart("/api/vantagens").session(sessao)
                        .param("nome", "Sobremesa grátis").param("descricao", "Uma sobremesa do dia")
                        .param("custo", "30").param("quantidade", "10"))
                .andExpect(status().isUnprocessableEntity());

        // Cadastro com foto
        MockMultipartFile foto = new MockMultipartFile("foto", "foto.png", "image/png", PNG_1X1);
        MvcResult criada = mockMvc.perform(multipart("/api/vantagens").file(foto).session(sessao)
                        .param("nome", "Sobremesa grátis").param("descricao", "Uma sobremesa do dia")
                        .param("custo", "30").param("quantidade", "10"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fotoUrl", notNullValue()))
                .andExpect(jsonPath("$.disponivel", is(true)))
                .andReturn();
        long vantagemId = lerJson(criada).get("id").asLong();

        mockMvc.perform(get("/api/vantagens/" + vantagemId + "/foto"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("image/png"));

        // Edição sem trocar a foto
        mockMvc.perform(multipart(HttpMethod.PUT, "/api/vantagens/" + vantagemId).session(sessao)
                        .param("nome", "Sobremesa grátis").param("descricao", "Pudim ou mousse")
                        .param("custo", "35").param("quantidade", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.custo", is(35)))
                .andExpect(jsonPath("$.disponivel", is(false)))
                .andExpect(jsonPath("$.fotoUrl", notNullValue()));

        mockMvc.perform(get("/api/vantagens/minhas").session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        mockMvc.perform(delete("/api/vantagens/" + vantagemId).session(sessao)).andExpect(status().isNoContent());
        mockMvc.perform(delete("/api/empresas/me").session(sessao)).andExpect(status().isNoContent());
    }

    // ---------------------------------------------------------------- Fluxo completo (US05, US06, US07)

    @Test
    void deveEnviarMoedasConsultarExtratoResgatarEConferirCupom() throws Exception {
        AlunoRequestDTO dto = novoAluno("Pedro Henrique", "pedro.henrique", "246.813.579-28");
        MvcResult criado = mockMvc.perform(post("/api/alunos")
                        .contentType(MediaType.APPLICATION_JSON).content(json(dto)))
                .andExpect(status().isCreated()).andReturn();
        long alunoId = lerJson(criado).get("id").asLong();

        // Professor da mesma instituição envia moedas
        MockHttpSession professor = login("milena.adao", "senha123");
        int saldoInicial = lerJson(mockMvc.perform(get("/api/professores/me").session(professor))
                .andExpect(status().isOk()).andReturn()).get("saldo").asInt();

        mockMvc.perform(get("/api/alunos").session(professor))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", hasItem((int) alunoId)))
                .andExpect(jsonPath("$[0].cpf").doesNotExist());

        mockMvc.perform(post("/api/transacoes").session(professor).contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("alunoId", alunoId, "valor", 100, "motivo", "Excelente participação"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.saldoProfessor", is(saldoInicial - 100)));

        // Motivo obrigatório e saldo suficiente
        mockMvc.perform(post("/api/transacoes").session(professor).contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("alunoId", alunoId, "valor", 10, "motivo", " "))))
                .andExpect(status().isBadRequest());
        mockMvc.perform(post("/api/transacoes").session(professor).contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("alunoId", alunoId, "valor", 999_999, "motivo", "Muito"))))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.erro", containsString("Saldo insuficiente")));

        // Professor de outra instituição não pode enviar
        MockHttpSession professorUfmg = login("carlos.silva", "senha123");
        mockMvc.perform(post("/api/transacoes").session(professorUfmg).contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("alunoId", alunoId, "valor", 10, "motivo", "Teste"))))
                .andExpect(status().isUnprocessableEntity());

        mockMvc.perform(get("/api/extrato").session(professor))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.transacoes[0].tipo", is("ENVIO")))
                .andExpect(jsonPath("$.transacoes[0].valor", is(-100)));

        // Aluno consulta extrato e resgata vantagem
        MockHttpSession aluno = login("pedro.henrique", "senhaSegura123");
        mockMvc.perform(get("/api/extrato").session(aluno))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.saldo", is(100)))
                .andExpect(jsonPath("$.transacoes[0].tipo", is("RECEBIMENTO")));

        mockMvc.perform(post("/api/transacoes").session(aluno).contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("alunoId", alunoId, "valor", 10, "motivo", "x"))))
                .andExpect(status().isForbidden());

        JsonNode catalogo = lerJson(mockMvc.perform(get("/api/vantagens").session(aluno))
                .andExpect(status().isOk()).andReturn());
        long cafeId = -1;
        for (JsonNode v : catalogo) {
            if (v.get("nome").asText().startsWith("Café")) {
                cafeId = v.get("id").asLong();
            }
        }

        MvcResult resgate = mockMvc.perform(post("/api/resgates").session(aluno)
                        .contentType(MediaType.APPLICATION_JSON).content(json(Map.of("vantagemId", cafeId))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.codigoCupom", matchesPattern("TKN-[A-Z0-9]{4}-[A-Z0-9]{4}")))
                .andExpect(jsonPath("$.saldoAluno", is(60)))
                .andReturn();
        String cupom = lerJson(resgate).get("codigoCupom").asText();

        mockMvc.perform(get("/api/extrato").session(aluno))
                .andExpect(jsonPath("$.saldo", is(60)))
                .andExpect(jsonPath("$.transacoes[0].tipo", is("RESGATE")))
                .andExpect(jsonPath("$.transacoes[0].codigoCupom", is(cupom)));

        mockMvc.perform(get("/api/resgates").session(aluno))
                .andExpect(jsonPath("$", hasSize(1)));

        // Conta com histórico não pode ser excluída
        mockMvc.perform(delete("/api/alunos/me").session(aluno)).andExpect(status().isUnprocessableEntity());

        // Empresa confere e utiliza o cupom
        MockHttpSession empresa = login("restaurante.campus", "empresa123");
        mockMvc.perform(get("/api/resgates/cupom/" + cupom.toLowerCase()).session(empresa))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.alunoNome", is("Pedro Henrique")))
                .andExpect(jsonPath("$.utilizado", is(false)));
        mockMvc.perform(post("/api/resgates/cupom/" + cupom + "/utilizar").session(empresa))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.utilizado", is(true)));
        mockMvc.perform(post("/api/resgates/cupom/" + cupom + "/utilizar").session(empresa))
                .andExpect(status().isUnprocessableEntity());

        // Outra empresa não encontra o cupom
        MockHttpSession outraEmpresa = login("livraria.univ", "empresa123");
        mockMvc.perform(get("/api/resgates/cupom/" + cupom).session(outraEmpresa))
                .andExpect(status().isNotFound());
    }

    // ---------------------------------------------------------------- Helpers

    private AlunoRequestDTO novoAluno(String nome, String login, String cpf) {
        Instituicao puc = instituicaoRepository.findAll().stream()
                .filter(i -> i.getNome().contains("PUC")).findFirst().orElseThrow();
        AlunoRequestDTO dto = new AlunoRequestDTO();
        dto.setNome(nome);
        dto.setEmail(login + "@sga.pucminas.br");
        dto.setLogin(login);
        dto.setSenha("senhaSegura123");
        dto.setCpf(cpf);
        dto.setRg("MG-99.888.777");
        dto.setEndereco("Rua da Bahia, 1200 - Centro, BH");
        dto.setInstituicaoId(puc.getId());
        dto.setCurso(ECurso.CIENCIA_DA_COMPUTACAO);
        dto.setMatricula(765432);
        return dto;
    }

    private MockHttpSession login(String login, String senha) throws Exception {
        MvcResult resultado = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("login", login, "senha", senha))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.login", is(login)))
                .andReturn();
        return (MockHttpSession) resultado.getRequest().getSession(false);
    }

    private String json(Object objeto) throws Exception {
        return objectMapper.writeValueAsString(objeto);
    }

    private JsonNode lerJson(MvcResult resultado) throws Exception {
        return objectMapper.readTree(resultado.getResponse().getContentAsString());
    }
}
