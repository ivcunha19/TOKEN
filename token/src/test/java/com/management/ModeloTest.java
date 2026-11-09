package com.management;

import com.management.exception.RegraNegocioException;
import com.management.model.*;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

/** Testes unitários das regras de negócio implementadas nas classes de domínio. */
class ModeloTest {

    private final Instituicao puc = instituicao(1L);

    @Test
    void senhaDeveSerArmazenadaComHashEAutenticar() {
        Aluno aluno = aluno(puc);
        assertNotEquals("aluno123", aluno.getSenha());
        assertTrue(aluno.getSenha().startsWith("$2"));
        assertTrue(aluno.autenticar("aluno.teste", "aluno123"));
        assertFalse(aluno.autenticar("aluno.teste", "errada"));
        assertFalse(aluno.autenticar("outro", "aluno123"));
    }

    @Test
    void professorRecebeMilMoedasPorSemestreDeFormaAcumulativa() {
        Professor professor = professor(puc);
        assertEquals(1000, professor.getSaldo());
        assertEquals(Semestre.atual(), professor.getUltimoSemestreCreditado());

        assertFalse(professor.receberMoedasSemestrais(Semestre.atual()), "não credita duas vezes no mesmo semestre");
        assertEquals(1000, professor.getSaldo());

        assertTrue(professor.receberMoedasSemestrais("2099-1"));
        assertEquals(2000, professor.getSaldo(), "saldo não distribuído é acumulado");
    }

    @Test
    void semestreDeveSerCalculadoPelaData() {
        assertEquals("2026-1", Semestre.de(LocalDate.of(2026, 6, 30)));
        assertEquals("2026-2", Semestre.de(LocalDate.of(2026, 7, 1)));
    }

    @Test
    void envioDeMoedasDebitaProfessorECreditaAluno() {
        Professor professor = professor(puc);
        Aluno aluno = aluno(puc);

        Transacao t = professor.enviarMoedas(aluno, 250, "  Ótima apresentação  ");

        assertEquals(750, professor.getSaldo());
        assertEquals(250, aluno.getSaldo());
        assertEquals("Ótima apresentação", t.getDescricaoMotivo());
    }

    @Test
    void envioDeMoedasValidaRegras() {
        Professor professor = professor(puc);
        Aluno aluno = aluno(puc);
        Aluno alunoOutraInstituicao = aluno(instituicao(2L));

        assertThrows(RegraNegocioException.class, () -> professor.enviarMoedas(aluno, 10, " "));
        assertThrows(RegraNegocioException.class, () -> professor.enviarMoedas(aluno, 0, "motivo"));
        assertThrows(RegraNegocioException.class, () -> professor.enviarMoedas(aluno, 1001, "motivo"));
        assertThrows(RegraNegocioException.class, () -> professor.enviarMoedas(alunoOutraInstituicao, 10, "motivo"));
        assertEquals(1000, professor.getSaldo());
    }

    @Test
    void resgateDebitaSaldoEBaixaEstoque() {
        Aluno aluno = aluno(puc);
        aluno.adicionarMoedas(100);
        Empresa empresa = new Empresa("Loja", "empresa123", "loja", "loja@x.com", "Desc", "11.222.333/0001-81");
        Vantagem vantagem = empresa.cadastrarVantagem("Brinde", "Desc", 60, new byte[]{1}, "image/png", 1);

        ResgateVantagem resgate = aluno.resgatarVantagem(vantagem, "TKN-AAAA-BBBB");

        assertEquals(40, aluno.getSaldo());
        assertEquals(0, vantagem.getQuantidade());
        assertEquals(60, resgate.getValor());
        assertThrows(RegraNegocioException.class, () -> aluno.resgatarVantagem(vantagem, "TKN-CCCC-DDDD"),
                "vantagem esgotada");
    }

    @Test
    void resgateSemSaldoDeveFalhar() {
        Aluno aluno = aluno(puc);
        Empresa empresa = new Empresa("Loja", "empresa123", "loja", "loja@x.com", "Desc", "11.222.333/0001-81");
        Vantagem vantagem = empresa.cadastrarVantagem("Brinde", "Desc", 60, new byte[]{1}, "image/png", 5);

        assertThrows(RegraNegocioException.class, () -> aluno.resgatarVantagem(vantagem, "TKN-AAAA-BBBB"));
        assertEquals(5, vantagem.getQuantidade());
    }

    private static Instituicao instituicao(Long id) {
        Instituicao i = new Instituicao("Instituição " + id, null);
        i.setId(id);
        return i;
    }

    private static Professor professor(Instituicao instituicao) {
        return new Professor("Prof", "senha123", "prof", "prof@x.com", "123.456.789-09",
                instituicao, EDepartamento.COMPUTACAO_E_SISTEMAS);
    }

    private static Aluno aluno(Instituicao instituicao) {
        return new Aluno("Aluno", "aluno123", "aluno.teste", "aluno@x.com", "529.982.247-25",
                instituicao, "MG-1", "Rua A", ECurso.ENGENHARIA_DE_SOFTWARE, 1);
    }
}
