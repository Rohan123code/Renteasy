// Validation helper functions
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

const isValidPrice = (price) => {
  return !isNaN(price) && price >= 0;
};

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidPrice,
};