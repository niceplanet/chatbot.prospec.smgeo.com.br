export function validarCpf(cpf: string): string | null {
  const cpfLimpo = cpf.replace(/[^\d]+/g, "");

  if (cpfLimpo.length !== 11) {
    return null;
  }

  const cpfFormatado = cpfLimpo.replace(
    /(\d{3})(\d{3})(\d{3})(\d{2})/,
    "$1.$2.$3-$4"
  );

  return cpfFormatado;
}
