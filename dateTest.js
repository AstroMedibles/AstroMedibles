// https://www.timeanddate.com/time/zone/usa

// const date1 = new Date('July 1, 1999');
// new Date(year, monthIndex, day, hours, minutes, seconds, milliseconds)
// const dbDateString = '2022-03-25T17:00:00.000Z';

// var date1 = new Date(new Date(dbDateString).toISOString());
// var date2 = new Date(dbDateString);

// var todayDate = new Date();
var startDate    = new Date('2022-03-30T05:00:00.000Z');
var endDate      = new Date('2022-04-01T05:00:00.000Z');

var dlop         = new Date('2022-03-28T05:00:00.000Z');

var Difference_In_Time1 = startDate.getTime() - dlop.getTime();


console.log('Difference_In_Time1: ' + Difference_In_Time1);
console.log();
if (Difference_In_Time1 > 259200000)
{
    console.log('Purchase is old enough, new one valid');
}
else
{
    console.log('Purchase too recent, cannot place additional one')
}

// var Difference_In_Time1 = startDate.getTime() - todayDate.getTime();
// var Difference_In_Time2 = endDate.getTime() - todayDate.getTime();

// // var Difference_In_Time3 = endDate.getTime() - startDate.getTime();



// console.log('Difference_In_Time1: ' + Difference_In_Time1);
// console.log('Difference_In_Time2: ' + Difference_In_Time2);

// // console.log('Difference_In_Time3: ' + Difference_In_Time3);

// // case 1 today date is before start date 
// if (Difference_In_Time1 > 0)
// {
//     console.log('case 1 today date is before start date ');
// }
// // case 2 today date is after start date && today date is before end date
// else if (Difference_In_Time1 <= 0 && Difference_In_Time2 >= 0)
// {
//     console.log('case 2 today date is after start date && today date is before end date');
// }

// // case 3 today date is after start date && today date is after end date
// else if (Difference_In_Time1 <= 0 && Difference_In_Time2 <= 0)
// {
//     console.log('case 3 today date is after start date && today date is after end date');
// }



// console.log('date1');
// console.log('ISO: \t\t\t' + date1.toISOString());
// console.log('Locale String: \t\t' + date1.toLocaleString("en-US", {timeZone: "America/Chicago"}));
// console.log('toLocaleDateString: \t' + date1.toLocaleDateString("en-US", {timeZone: "America/Chicago"}));
// console.log('toLocaleTimeString: \t' + date1.toLocaleTimeString("en-US", {timeZone: "America/Chicago"}));

// console.log('Locale String: \t\t' + date1.toLocaleString());
// console.log('toLocaleDateString: \t' + date1.toLocaleDateString());
// console.log('toLocaleTimeString: \t' + date1.toLocaleTimeString());

// console.log('toString: \t\t\t\t' + date1.toString());
// console.log('toTimeString: \t\t\t' + date1.toTimeString());
// console.log('toUTCString: \t\t\t' + date1.toUTCString());
// console.log('valueOf: \t\t\t\t' + date1.valueOf());

console.log('\n');

// console.log('date2');
// console.log('ISO: \t\t\t\t\t' + date2.toISOString());
// console.log('Locale String: \t\t\t' + date2.toLocaleString("en-US", {timeZone: "America/Chicago"}));
// console.log('toLocaleDateString: \t' + date2.toLocaleDateString("en-US", {timeZone: "America/Chicago"}));
// console.log('toLocaleTimeString: \t' + date2.toLocaleTimeString("en-US", {timeZone: "America/Chicago"}));
// console.log('toString: \t\t\t\t' + date2.toString());
// console.log('toTimeString: \t\t\t' + date2.toTimeString());
// console.log('toUTCString: \t\t\t' + date2.toUTCString());
// console.log('valueOf: \t\t\t\t' + date2.valueOf());


// var dateIntger  = date1.getFullYear().toString() + (date1.getMonth() + 1).toString() + date1.getDate().toString();
// var timeHour    = date1.getHours().toString();
// var timeMinutes = date1.getMinutes().toString();

// var timeInteger = timeHour + timeMinutes;

// console.log("dateIntger: " + dateIntger);
// console.log("timeInteger:" + timeInteger);

// console.log('event1');
// console.log(event1);
// expected output: Thu Jul 01 1999 00:00:00 GMT+0200 (CEST)

// date1.setTime(event1.getTime());
// console.log('date1');
// console.log(date1);
// expected output: Thu Jul 01 1999 00:00:00 GMT+0200 (CEST)
// (note: your timezone may vary)




// console.log("dateIntger: " + dateIntger);
// console.log("timeInteger:" + timeInteger);

// console.log("Day:" + date1.getDate());

// console.log("Day:" + new Date().getDate());

// console.log(`Event 2: ${date1.toISOString()}`);
// console.log(date1.toLocaleString());

// date1.setHours(23);

// console.log(`Event 2: ${date1.toISOString()}`);
// console.log(date1.toLocaleString());


// if(Date.parse(date1)-Date.parse(new Date())<0)
// {
//    console.log('DATE HAS PASSED');
// }
// else
// {
//     console.log('DATE NOT PASSED');
// }


// for (let index = 0; index < 15; index++)
// {
//     var suggestedDate = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate() + index);

    // console.log(`${index}. ${suggestedDate.toString().substring(0, 16)} day[${suggestedDate.getDay()}]`);

// }


// for (let index = 0; index < 24; index++)
// {
//     var suggestedTime = new Date(0, 0, 0, index);
//     var localeString = suggestedTime.toLocaleString();
//     // console.log(`${index}. ${localeString.substring(localeString.indexOf(' ') + 1)}`);

// }


console.log('\n\n');