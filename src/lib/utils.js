const EXCHANGE_RATES = {
  INR: 1,
  USD: 0.012,
  GBP: 0.0094,
  AED: 0.044
};

export const formatCurrency = (amount, country = { locale: 'en-IN', currency: 'INR' }) => {
  const rate = EXCHANGE_RATES[country.currency] || 1;
  const convertedAmount = amount * rate;
  
  return new Intl.NumberFormat(country.locale, {
    style: 'currency',
    currency: country.currency,
    maximumFractionDigits: 0
  }).format(convertedAmount);
};

export const formatNumber = (num, locale = 'en-IN') => {
  return new Intl.NumberFormat(locale).format(num);
};
