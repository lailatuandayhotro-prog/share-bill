export const formatCurrencyInput = (value: string | number): string => {
  const stringValue = typeof value === 'number' ? value.toString() : value;
  const cleanedValue = stringValue.replace(/\D/g, '');
  if (!cleanedValue) return '';
  return cleanedValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const parseFormattedCurrency = (formattedString: string): number => {
  const cleanedString = formattedString.replace(/\./g, '');
  return parseFloat(cleanedString) || 0;
};