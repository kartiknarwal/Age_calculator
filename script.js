const months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function ageCalculate() {
    let today = new Date();
    let inputData = new Date(document.getElementById("date-input").value);
    let birthMonth, birthDate, birthYear;

    let birthDetails = {
        date: inputData.getDate(),
        month: inputData.getMonth() + 1,
        year: inputData.getFullYear()
    }
    let currentYear = today.getFullYear();
    let currentMonth = today.getMonth() + 1;
    let currentDate = today.getDate();

    leapChecker(currentYear);

    if (
        birthDetails.year > currentYear ||
        (birthDetails.month > currentMonth &&
            birthDetails.year === currentYear) ||
        (birthDetails.date > currentDate && birthDetails.month === currentMonth && birthDetails.year === currentYear)
    ) {
        alert("Not Born Yet");
        displayResult("-","-","-");
        return;
    }

    birthYear = birthDetails.year;

    if (currentMonth > birthDetails.month || (currentMonth === birthDetails.month && currentDate >= birthDetails.date)) {
        birthYear = currentYear - birthDetails.year;
    } else {
        birthYear = currentYear - 1 - birthDetails.year;
    }

    if (currentMonth >= birthDetails.month) {
        birthMonth = currentMonth - birthDetails.month;
    } else {
        birthYear--;
        birthMonth = 12 + currentMonth - birthDetails.month;
    }

    if (currentDate >= birthDetails.date) {
        birthDate = currentDate - birthDetails.date;
    } else {
        birthMonth--;
        let days = months[currentMonth - 2];
        birthDate = days + currentDate - birthDetails.date;
        if (birthMonth < 0) {
            birthMonth = 11;
            birthYear--;
        }
    }

    displayResult(birthDate, birthMonth, birthYear);
}

function displayResult(bdate, bmonth, byear) {
    document.getElementById("years").textContent = byear;
    document.getElementById("months").textContent = bmonth;
    document.getElementById("days").textContent = bdate;
}

function leapChecker(year) {
    if (year % 4 === 0 || (year % 100 === 0 && year % 400 === 0)) {
        months[1] = 29;
    } else {
        months[1] = 28;
    }
}
