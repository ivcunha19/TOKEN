package com.management.config;

import com.management.model.*;
import com.management.repository.AlunoRepository;
import com.management.repository.EmpresaRepository;
import com.management.repository.InstituicaoRepository;
import com.management.repository.ProfessorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner carregarDadosIniciais(
            InstituicaoRepository instituicaoRepository,
            ProfessorRepository professorRepository,
            AlunoRepository alunoRepository,
            EmpresaRepository empresaRepository) {
        return args -> {
            if (instituicaoRepository.count() == 0) {
                Instituicao pucMinas = instituicaoRepository.save(
                        new Instituicao("Pontifícia Universidade Católica de Minas Gerais (PUC Minas)", "17.178.195/0001-67")
                );
                Instituicao ufmg = instituicaoRepository.save(
                        new Instituicao("Universidade Federal de Minas Gerais (UFMG)", "17.217.985/0001-04")
                );
                Instituicao cefet = instituicaoRepository.save(
                        new Instituicao("Centro Federal de Educação Tecnológica de Minas Gerais (CEFET-MG)", "17.220.203/0001-96")
                );

                if (professorRepository.count() == 0) {
                    professorRepository.save(new Professor(
                            "Profa. Milena Menezes Adão",
                            "senha123",
                            "milena.adao",
                            "milena.adao@pucminas.br",
                            "111.222.333-44",
                            pucMinas,
                            EDepartamento.COMPUTACAO_E_SISTEMAS
                    ));
                    professorRepository.save(new Professor(
                            "Prof. Carlos Eduardo Silva",
                            "senha123",
                            "carlos.silva",
                            "carlos.silva@ufmg.br",
                            "222.333.444-55",
                            ufmg,
                            EDepartamento.ENGENHARIAS
                    ));
                }

                if (alunoRepository.count() == 0) {
                    alunoRepository.save(new Aluno(
                            "Lucas Oliveira Santos",
                            "aluno123",
                            "lucas.santos",
                            "lucas.santos@sga.pucminas.br",
                            "123.456.789-01",
                            pucMinas,
                            "MG-18.234.567",
                            "Av. Dom José Gaspar, 500 - Coração Eucarístico, Belo Horizonte - MG",
                            ECurso.ENGENHARIA_DE_SOFTWARE,
                            812345
                    ));
                }

                if (empresaRepository.count() == 0) {
                    empresaRepository.save(new Empresa(
                            "Livraria e Papelaria Universitária",
                            "empresa123",
                            "livraria.univ",
                            "contato@livrariauniversitaria.com.br",
                            "Parceira oficial para descontos em livros técnicos, materiais acadêmicos e papelaria.",
                            "12.345.678/0001-90"
                    ));
                }
            }
        };
    }
}
