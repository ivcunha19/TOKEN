package com.management.config;

import com.management.model.*;
import com.management.repository.AlunoRepository;
import com.management.repository.EmpresaRepository;
import com.management.repository.InstituicaoRepository;
import com.management.repository.ProfessorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.charset.StandardCharsets;

/**
 * Carga inicial: instituições e professores (pré-cadastrados, conforme o enunciado),
 * além de alunos, empresas e vantagens de demonstração.
 */
@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner carregarDadosIniciais(
            InstituicaoRepository instituicaoRepository,
            ProfessorRepository professorRepository,
            AlunoRepository alunoRepository,
            EmpresaRepository empresaRepository) {
        return args -> {
            if (instituicaoRepository.count() > 0) {
                return;
            }

            Instituicao pucMinas = instituicaoRepository.save(
                    new Instituicao("Pontifícia Universidade Católica de Minas Gerais (PUC Minas)", "17.178.195/0001-67"));
            Instituicao ufmg = instituicaoRepository.save(
                    new Instituicao("Universidade Federal de Minas Gerais (UFMG)", "17.217.985/0001-04"));
            instituicaoRepository.save(
                    new Instituicao("Centro Federal de Educação Tecnológica de Minas Gerais (CEFET-MG)", "17.220.203/0001-96"));

            // Professores (enviados pela instituição no momento da parceria)
            professorRepository.save(new Professor("Profa. Milena Menezes Adão", "senha123", "milena.adao",
                    "milena.adao@pucminas.br", "123.456.789-09", pucMinas, EDepartamento.COMPUTACAO_E_SISTEMAS));
            professorRepository.save(new Professor("Prof. Ricardo Almeida", "senha123", "ricardo.almeida",
                    "ricardo.almeida@pucminas.br", "987.654.321-00", pucMinas, EDepartamento.ENGENHARIAS));
            professorRepository.save(new Professor("Prof. Carlos Eduardo Silva", "senha123", "carlos.silva",
                    "carlos.silva@ufmg.br", "111.444.777-35", ufmg, EDepartamento.ENGENHARIAS));

            // Alunos de demonstração
            alunoRepository.save(new Aluno("Lucas Oliveira Santos", "aluno123", "lucas.santos",
                    "lucas.santos@sga.pucminas.br", "935.411.347-80", pucMinas, "MG-18.234.567",
                    "Av. Dom José Gaspar, 500 - Coração Eucarístico, Belo Horizonte - MG",
                    ECurso.ENGENHARIA_DE_SOFTWARE, 812345));
            alunoRepository.save(new Aluno("Mariana Alves Pereira", "aluno123", "mariana.alves",
                    "mariana.alves@sga.pucminas.br", "453.178.287-91", pucMinas, "MG-20.111.222",
                    "Rua Padre Eustáquio, 1200 - Padre Eustáquio, Belo Horizonte - MG",
                    ECurso.CIENCIA_DA_COMPUTACAO, 823456));

            // Empresas parceiras e vantagens de demonstração
            Empresa livraria = new Empresa("Livraria e Papelaria Universitária", "empresa123", "livraria.univ",
                    "contato@livrariauniversitaria.com.br",
                    "Parceira oficial para descontos em livros técnicos, materiais acadêmicos e papelaria.",
                    "12.345.678/0001-95");
            livraria.cadastrarVantagem("20% de desconto em livros técnicos",
                    "Cupom válido para um livro técnico de qualquer área na loja do campus.",
                    80, svg("Livros", "#1a56db"), "image/svg+xml", 50);
            livraria.cadastrarVantagem("Kit papelaria completo",
                    "Caderno universitário, canetas, marca-texto e pasta organizadora.",
                    150, svg("Papelaria", "#7c3aed"), "image/svg+xml", 20);
            empresaRepository.save(livraria);

            Empresa restaurante = new Empresa("Restaurante Sabor do Campus", "empresa123", "restaurante.campus",
                    "parcerias@sabordocampus.com.br",
                    "Restaurante universitário com refeições executivas, lanches e cafés.",
                    "98.765.432/0001-98");
            restaurante.cadastrarVantagem("Almoço executivo grátis",
                    "Prato executivo do dia + suco natural, válido de segunda a sexta.",
                    120, svg("Almoço", "#047857"), "image/svg+xml", 30);
            restaurante.cadastrarVantagem("Café com pão de queijo",
                    "Um café coado e duas unidades de pão de queijo.",
                    40, svg("Café", "#b45309"), "image/svg+xml", 100);
            empresaRepository.save(restaurante);
        };
    }

    /** Gera uma imagem SVG simples para ilustrar as vantagens de demonstração. */
    private static byte[] svg(String texto, String cor) {
        String conteudo = """
                <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
                  <rect width="400" height="300" fill="%s"/>
                  <circle cx="330" cy="60" r="90" fill="#ffffff" fill-opacity="0.12"/>
                  <circle cx="60" cy="270" r="70" fill="#ffffff" fill-opacity="0.10"/>
                  <text x="200" y="165" font-family="Segoe UI, Arial, sans-serif" font-size="44" font-weight="700"
                        fill="#ffffff" text-anchor="middle">%s</text>
                </svg>
                """.formatted(cor, texto);
        return conteudo.getBytes(StandardCharsets.UTF_8);
    }
}
