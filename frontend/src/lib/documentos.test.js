import { describe, expect, it } from 'vitest';
import { cnpjValido, cpfValido, mascararCnpj, mascararCpf, normalizarCupom } from './documentos';

describe('documentos', () => {
  it('aplica a máscara de CPF progressivamente', () => {
    expect(mascararCpf('935')).toBe('935');
    expect(mascararCpf('9354113')).toBe('935.411.3');
    expect(mascararCpf('93541134780')).toBe('935.411.347-80');
    expect(mascararCpf('935.411.347-80999')).toBe('935.411.347-80');
  });

  it('aplica a máscara de CNPJ', () => {
    expect(mascararCnpj('12345678000195')).toBe('12.345.678/0001-95');
    expect(mascararCnpj('12345')).toBe('12.345');
  });

  it('valida os dígitos verificadores do CPF (mesmos CPFs do seed)', () => {
    expect(cpfValido('935.411.347-80')).toBe(true);
    expect(cpfValido('123.456.789-09')).toBe(true);
    expect(cpfValido('123.456.789-00')).toBe(false);
    expect(cpfValido('111.111.111-11')).toBe(false);
    expect(cpfValido('123')).toBe(false);
  });

  it('valida os dígitos verificadores do CNPJ', () => {
    expect(cnpjValido('12.345.678/0001-95')).toBe(true);
    expect(cnpjValido('98.765.432/0001-98')).toBe(true);
    expect(cnpjValido('12.345.678/0001-00')).toBe(false);
    expect(cnpjValido('00.000.000/0000-00')).toBe(false);
  });

  it('normaliza o código do cupom digitado', () => {
    expect(normalizarCupom(' tkn-w23n-f7e6 ')).toBe('TKN-W23N-F7E6');
    expect(normalizarCupom('tknw23nf7e6')).toBe('TKN-W23N-F7E6');
    expect(normalizarCupom('abc')).toBe('ABC');
  });
});
