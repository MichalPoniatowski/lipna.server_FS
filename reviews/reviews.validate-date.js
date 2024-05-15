const relativeDateToAbsolute = (relativeDate) => {
  let newDate = new Date();

  let hour = newDate.getHours();
  let year = newDate.getFullYear();
  let month = newDate.getMonth();
  let day = newDate.getDate();

  if (relativeDate instanceof Date) {
    return (newDate = relativeDate);
  }

  const numbersFromDate = relativeDate.match(/\d+/g);

  const firstNumber = numbersFromDate ? parseInt(numbersFromDate[0], 10) : null;
  const secondNumber =
    numbersFromDate && numbersFromDate.length > 1
      ? parseInt(numbersFromDate[1], 10)
      : null;

  const getDateWord = (relativeDate) => {
    let typeOfDate = "";

    if (relativeDate.includes("lat") && relativeDate.includes("mies")) {
      return "yearAndMonthType";
    }

    if (relativeDate.includes("godzin")) {
      typeOfDate = "hourType";
    } else if (relativeDate.includes("tyg") && relativeDate.includes("dni")) {
      typeOfDate = "weekType";
    } else if (relativeDate.includes("dni") || relativeDate.includes("dzień")) {
      typeOfDate = "dayType";
    } else if (relativeDate.includes("mies")) {
      typeOfDate = "mothType";
    } else if (relativeDate.includes("lat")) {
      typeOfDate = "yearType";
    } else {
      typeOfDate = "differentType";
    }

    return typeOfDate;
  };

  if (!firstNumber) {
    switch (relativeDate.toLowerCase()) {
      case "godzinę temu":
        newDate.setHours(hour - 1);
        break;
      case "dzisiaj":
        newDate;
        break;
      case "wczoraj" || "dzień temu":
        newDate.setDate(day - 1);
        break;
      case "tydzień temu":
        newDate.setDate(day - 7);
        break;
      case "miesiąc temu":
        newDate.setMonth(month - 1);
        break;
      case "rok temu":
        newDate.setFullYear(year - 1);
        break;
      default:
        newDate = relativeDate;
    }
  }

  if (firstNumber) {
    const word = getDateWord(relativeDate);
    switch (word) {
      case "hourType":
        newDate.setHours(hour - firstNumber);
        break;
      case "dayType":
        newDate.setDate(day - firstNumber);
        break;
      case "weekType":
        const daysInWeeks = 7 * firstNumber;
        newDate.setDate(day - daysInWeeks);
        break;
      case "mothType":
        newDate.setMonth(month - firstNumber);
        break;
      case "yearType":
        newDate.setFullYear(year - firstNumber);
        break;
      case "yearAndMonthType":
        newDate.setFullYear(year - firstNumber);
        newDate.setMonth(month - secondNumber);
        break;
      default:
        newDate = relativeDate;
    }
  }

  return newDate;
};

module.exports = { relativeDateToAbsolute };
