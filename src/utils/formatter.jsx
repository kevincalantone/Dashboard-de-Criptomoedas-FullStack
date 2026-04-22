

export const currencyFormatter = (value) => {
  if (typeof value !== 'number') return '$ 0.00'; 
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

export const percentFormatter = (value) => {
  return `${value.toFixed(2)}%`;
};