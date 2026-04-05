export const calculateShipping = async (cep: string): Promise<number> => {
  // Simulação de cálculo de frete
  // Em uma implementação real, chamaria uma API de transportadora
  const numericCep = parseInt(cep.replace(/\D/g, ''), 10);
  
  if (isNaN(numericCep)) {
    throw new Error("CEP inválido");
  }

  // Lógica mock: frete baseado no primeiro dígito do CEP
  const basePrice = 15.00;
  const factor = (numericCep % 1000) / 100;
  
  return parseFloat((basePrice + factor).toFixed(2));
};
