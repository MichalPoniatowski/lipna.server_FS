const { relativeDateToAbsolute } = require("../reviews.validate-date");

const check = () => {
  const dates = [
    "2 lata 1 miesiące temu",
    "1 rok temu",
    "rok temu",
    "2 lata temu",
    "20 lat temu",
    "dzisiaj",
    "wczoraj",
    "miesiąc temu",
    "rok temu",
    "1 dzień temu",
    "2 dni temu",
    "22 dni temu",
    "52 dni temu",
    "22212 dni temu",
    "2 miesiące temu",
    "4 miesiące temu",
    "52 miesiące temu",
    "22212 miesiące temu",
    "2 lata temu",
    "22 lata temu",
    "52 lata temu",
    "dawno dawno temu",
    "2004.12.01",
    "12.08.1992",
    new Date("2029-06-25T07:01:24.400Z"),
    "2002-12-01",
    "godzinę temu",
    "24 godziny temu",
    "19 godzin temu",
    "199 godzin temu",
    // "2 godziny temu",
    "tydzień temu",
    "2 tygodnie temu",
    "12 tygodni temu",
    "54 tygodni temu",
    "24 godziny temu",
    "19 godzin temu",
    "199 godzin temu",
    "2 godziny temu",
    "22 lata temu",
    "52 lata temu",
    "2 miesiące temu",
    "4 miesiące temu",
    "52 miesiące temu",
    "2 lata 1 miesiące temu",
  ];

  dates.map((date) => {
    const formatedDate = relativeDateToAbsolute(date);
    console.log(date, "/", formatedDate);
  });
};

check();

module.exports = { check };
