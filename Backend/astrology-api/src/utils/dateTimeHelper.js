const formatDateForVedic = (dateInput) => {
  const date = new Date(dateInput);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const isValidTime24h = (time) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);

module.exports = {
  formatDateForVedic,
  isValidTime24h,
};
