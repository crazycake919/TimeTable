// Automatically load the XLS file when the page loads
let dataForThisWeek = [];
let dates;
window.onload = function () {
    loadXLSFile('urnik.xls');
    for (let index = 0; index < 13; index++) {

        let time = 8 + index < 10 ? "0" + (index + 8) + ":00" : (index + 8) + ":00";
        addTableRow(time, '', '', '', '', '');

    }
    

};

// Function to load and process XLS file
function loadXLSFile(filename) {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                // Successfully loaded the XLS file
                const data = xhr.response;
                const workbook = XLSX.read(data, { type: 'binary' });

                // Assuming you have only one sheet in the workbook
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                // Convert sheet to JSON
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                // Display the JSON data
                console.log(jsonData);
                getDate(jsonData);
                handleAllClasses();
                console.log(dataForThisWeek);
                document.getElementById('output').innerHTML = JSON.stringify(jsonData, null, 2);
            } else {
                console.error('Failed to load XLS file. Status code:', xhr.status);
            }
        }
    };

    xhr.open('GET', filename, true);
    xhr.responseType = 'arraybuffer';
    xhr.send();
}

const skupine = [["RV MREŽNO USMERJENO RAČUNANJE", "RIT 2 UN RV 4"],
["SV LINEARNA ALGEBRA", "RIT 2 UN 2. sk."],
["LV LINEARNA ALGEBRA", "RIT 2 UN RV 2"],
["RV RAZVOJ PROGRAMSKE OPREME", "RIT 2 UN RV 6"],
["RV RAČUNALNIŠKE ARHITEKTURE", "RIT 2 UN RV 7"],
["RV OPERACIJSKI SISTEMI", "RIT 2 UN RV 4"]]
function getDate(jsonData) {

    // Step 1: Get today's date
    let today = new Date();

    dates = getStartOfWeek(today);
    let wholeWeek = getStartOfWeek(today);
    for (let index = 3; index < jsonData.length; index++) {

        //get dates
        let dateString = jsonData[index][2];
        let [day, month, year] = dateString.split('.');
        let stringDate = `${month}.${day}.${year}`;
        //console.log(today+" "+stringDate)
        //for loop misisng
        let isInThisWeek = false;
        for (let k = 0; k < wholeWeek.length; k++) {
            if (stringDate == wholeWeek[k]) isInThisWeek = true;

        }
        if (isInThisWeek) {
            if (jsonData[index][5][0] == 'P') {
                dataForThisWeek.push(jsonData[index]);
            } else {
                for (let j = 0; j < skupine.length; j++) {
                    //console.log(jsonData[index][5] +" "+ skupine[j][0] +" sk. "+ jsonData[index][7] + " "+ skupine[j][1])
                    if (jsonData[index][5] == skupine[j][0] && jsonData[index][7] == skupine[j][1]) {
                        dataForThisWeek.push(jsonData[index]);
                        break;
                    }

                }

            }
            //console.log(jsonData[index]);
        }
    }



}
function getStringFromDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${month}.${day}.${year}`;
}

function getStartOfWeek(date) {
    // Clone the input date to avoid modifying the original
    //const startDate = new Date(date);
    let startDate = new Date(date);
    // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayOfWeek = startDate.getDay();
    let daysUntilMonday
    // Calculate the difference between the current day and Monday
    if (dayOfWeek == 0) daysUntilMonday = 1;
    if (dayOfWeek == 6) daysUntilMonday = 2;
    else daysUntilMonday = 1 - dayOfWeek


    // Adjust the date to the Monday of the current or next week
    startDate.setDate(startDate.getDate() + daysUntilMonday);

    let datesArray = [];
    for (let index = 0; index < 5; index++) {
        let newDate = new Date(startDate);
        newDate.setDate(startDate.getDate() + index);
        datesArray[index] = getStringFromDate(newDate)

    }
    return datesArray;
}

function addTableRow(time, ponedeljek, torek, sreda, cetrttek, petek) {
    // Append a new row to the tbody

    $('#mainTable tbody').append(
        `<tr>
            <td>${time}</td>
            <td>${ponedeljek}</td>
            <td>${torek}</td>
            <td>${sreda}</td>
            <td>${cetrttek}</td>
            <td>${petek}</td>
        </tr>`
    );
}
function calculateDuration(timeRange) {
    // Split the time range into start and end times
    const [startTime, endTime] = timeRange.split('-');
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    const durationInMilliseconds = end - start;
    const durationInHours = durationInMilliseconds / (1000 * 60 * 60);

    return durationInHours;
}
function handleAllClasses(){
    for (let index = 0; index < dataForThisWeek.length; index++) {
        let timeSpan = calculateDuration(dataForThisWeek[index][3]);
        let startTime = getStartHour(dataForThisWeek[index][3]);
        if(dataForThisWeek[index][5]=="RV RAZVOJ PROGRAMSKE OPREME") timeSpan = 1;
        if(dataForThisWeek[index][5]=="RV OPERACIJSKI SISTEMI") startTime -=1
        combineRows(dataForThisWeek[index][1], startTime, timeSpan,dataForThisWeek[index] );

    }
}
function getStartHour(timeRange) {
    // Split the time range into start and end times
    const [startTime] = timeRange.split('-');

    // Extract the hour part and convert it to an integer
    const startHour = parseInt(startTime.split(':')[0], 10);

    return startHour;
}
function combineRows(day, startHours, length, data) {
    // Find the index of the day column
    const dayIndex = ['Ponedeljek', 'Torek', 'Sreda', 'Četrtek', 'Petek'].indexOf(day);

    if (dayIndex === -1) {
        console.error('Invalid day input.');
        return;
    }
    const table = document.getElementById('mainTable');
    const rows = table.rows;
    const currentRow = startHours - 7;
    const currentCell = rows[currentRow].cells[dayIndex + 1];

    const divElement = document.createElement('div');
        divElement.className = 'blockCell'; // You can add a specific class for styling
        divElement.id = convertString(data[5]);
        divElement.innerHTML = formatBlock(data)
        // Append the div to the cell
        currentCell.appendChild(divElement);
    
    // Set rowspan for the time cell
    currentCell.rowSpan = length;

    // Remove unnecessary rows for the combined cells
    for (let i = 1; i < length; i++) {
        rows[startHours - 7 + i].cells[dayIndex+1].style.display = 'none';
    }
    
}
function formatBlock(data){
    let startTime = data[3];
    if(data[5]=="RV OPERACIJSKI SISTEMI" ) startTime = "17.00-20.00";
    let toReturn ="<span class='ime'>"+ data[5]+"</span>  <span class='date'>"+startTime+"</span><span class='place'>"+data[4]+"</span>"

    return toReturn
}
function convertString(inputString) {
    // Replace spaces with hyphens using a regular expression
    return inputString.replace(/ /g, '-');
}
// Example usage:

// Add more rows as needed

//get week

//get skupina