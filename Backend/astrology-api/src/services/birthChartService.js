const { formatDateForVedic, isValidTime24h } = require("../utils/dateTimeHelper");

class BirthChartService {
  formatDate(date) {
    return formatDateForVedic(date);
  }

  isValidTimeFormat(time) {
    return isValidTime24h(time);
  }

  convertTo24Hour(time12h) {
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":");
    if (hours === "12") hours = "00";
    if ((modifier || "").toUpperCase() === "PM") {
      hours = String(parseInt(hours, 10) + 12);
    }
    return `${hours.padStart(2, "0")}:${minutes}`;
  }
}

module.exports = new BirthChartService();
