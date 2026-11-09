/** Formatação para exibição (pt-BR). Funções puras, cobertas por testes. */

const numero = new Intl.NumberFormat('pt-BR');

export function fmtNumero(n) {
  return numero.format(Number(n) || 0);
}

export function fmtMoedas(n) {
  const v = Number(n) || 0;
  return `${numero.format(v)} ${Math.abs(v) === 1 ? 'moeda' : 'moedas'}`;
}

/** Valor com sinal explícito: +200 / −40 (usa o sinal de menos tipográfico). */
export function fmtValorComSinal(n) {
  const v = Number(n) || 0;
  if (v > 0) return `+${numero.format(v)}`;
  if (v < 0) return `−${numero.format(Math.abs(v))}`;
  return '0';
}

export function fmtData(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export function fmtDataLonga(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

/** "agora", "há 5 min", "há 3 h", "ontem", "há 4 dias" ou a data curta. */
export function fmtRelativo(iso, agora = new Date()) {
  if (!iso) return '—';
  const d = new Date(iso);
  const seg = Math.round((agora.getTime() - d.getTime()) / 1000);
  if (Number.isNaN(seg)) return '—';
  if (seg < 60) return 'agora';
  const min = Math.floor(seg / 60);
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const dias = Math.floor(h / 24);
  if (dias === 1) return 'ontem';
  if (dias < 7) return `há ${dias} dias`;
  return d.toLocaleDateString('pt-BR');
}

/** Iniciais para avatar: "Lucas Oliveira Santos" → "LS"; ignora títulos como "Prof." e "Profa.". */
export function iniciais(nome) {
  const partes = String(nome || '')
    .split(/\s+/)
    .filter((p) => p && !/^(prof|profa|dr|dra)\.?$/i.test(p));
  if (!partes.length) return '?';
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

export function primeiroNome(nome) {
  const partes = String(nome || '')
    .split(/\s+/)
    .filter((p) => p && !/^(prof|profa|dr|dra)\.?$/i.test(p));
  return partes[0] || '';
}

/** "2026-2" → "2º semestre de 2026". */
export function fmtSemestre(codigo) {
  const m = /^(\d{4})-([12])$/.exec(codigo || '');
  return m ? `${m[2]}º semestre de ${m[1]}` : '—';
}

export function saudacao(hora = new Date().getHours()) {
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

export const TIPO_USUARIO = { ALUNO: 'Aluno', PROFESSOR: 'Professor', EMPRESA: 'Empresa parceira' };

export const TIPO_TRANSACAO = { ENVIO: 'Envio', RECEBIMENTO: 'Recebimento', RESGATE: 'Resgate' };
