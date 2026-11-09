import { describe, expect, it } from 'vitest';
import { fmtMoedas, fmtRelativo, fmtSemestre, fmtValorComSinal, iniciais, primeiroNome, saudacao } from './format';

describe('format', () => {
  it('formata moedas no singular e no plural com separador de milhar', () => {
    expect(fmtMoedas(1)).toBe('1 moeda');
    expect(fmtMoedas(0)).toBe('0 moedas');
    expect(fmtMoedas(1500)).toBe('1.500 moedas');
    expect(fmtMoedas(undefined)).toBe('0 moedas');
  });

  it('mostra o sinal do valor', () => {
    expect(fmtValorComSinal(200)).toBe('+200');
    expect(fmtValorComSinal(-40)).toBe('−40');
    expect(fmtValorComSinal(0)).toBe('0');
  });

  it('gera iniciais ignorando títulos', () => {
    expect(iniciais('Lucas Oliveira Santos')).toBe('LS');
    expect(iniciais('Profa. Milena Menezes Adão')).toBe('MA');
    expect(iniciais('Ana')).toBe('A');
    expect(iniciais('')).toBe('?');
    expect(primeiroNome('Prof. Carlos Eduardo Silva')).toBe('Carlos');
  });

  it('descreve datas relativas', () => {
    const agora = new Date('2026-11-09T12:00:00');
    expect(fmtRelativo('2026-11-09T11:59:30', agora)).toBe('agora');
    expect(fmtRelativo('2026-11-09T11:30:00', agora)).toBe('há 30 min');
    expect(fmtRelativo('2026-11-09T09:00:00', agora)).toBe('há 3 h');
    expect(fmtRelativo('2026-11-08T10:00:00', agora)).toBe('ontem');
    expect(fmtRelativo('2026-11-05T10:00:00', agora)).toBe('há 4 dias');
    expect(fmtRelativo(null, agora)).toBe('—');
  });

  it('formata o código do semestre e a saudação', () => {
    expect(fmtSemestre('2026-2')).toBe('2º semestre de 2026');
    expect(fmtSemestre('inválido')).toBe('—');
    expect(saudacao(9)).toBe('Bom dia');
    expect(saudacao(15)).toBe('Boa tarde');
    expect(saudacao(20)).toBe('Boa noite');
  });
});
