// const event2 = new Date('July 1, 1999');
// new Date(year, monthIndex, day, hours, minutes, seconds, milliseconds)
const dbDateString = '2022-02-18T02:24';
// dbDateString

const event2 = new Date(dbDateString);

console.log('event2');
console.log(event2);
console.log(event2.toLocaleString());
// console.log(event2.toLocaleDateString());
// console.log(event2.toLocaleTimeString());
console.log(event2.toString());
// console.log(event2.toTimeString());
// console.log(event2.toUTCString());
// console.log(event2.valueOf());

var dateIntger  = event2.getFullYear().toString() + (event2.getMonth() + 1).toString() + event2.getDate().toString();
var timeHour    = event2.getHours().toString();
var timeMinutes = event2.getMinutes().toString();

var timeInteger = timeHour + timeMinutes;

// console.log("dateIntger: " + dateIntger);
// console.log("timeInteger:" + timeInteger);

// console.log('event1');
// console.log(event1);
// expected output: Thu Jul 01 1999 00:00:00 GMT+0200 (CEST)

// event2.setTime(event1.getTime());
// console.log('event2');
// console.log(event2);
// expected output: Thu Jul 01 1999 00:00:00 GMT+0200 (CEST)
// (note: your timezone may vary)


console.log("dateIntger: " + dateIntger);
console.log("timeInteger:" + timeInteger);

console.log("Day:" + event2.getDay());

console.log("Day:" + new Date().getDay());


if(Date.parse(event2)-Date.parse(new Date())<0)
{
   console.log('DATE HAS PASSED');
}
else
{
    console.log('DATE NOT PASSED');
}


for (let index = 0; index < 15; index++)
{
    var suggestedDate = new Date(event2.getFullYear(), event2.getMonth(), event2.getDate() + index);

    // console.log(`${index}. ${suggestedDate.toString().substring(0, 16)} day[${suggestedDate.getDay()}]`);

}


for (let index = 0; index < 24; index++)
{
    var suggestedTime = new Date(0, 0, 0, index);
    var localeString = suggestedTime.toLocaleString();
    // console.log(`${index}. ${localeString.substring(localeString.indexOf(' ') + 1)}`);

}

var dateObject = '2021-10-25T19:55:28.607Z'
dateObject = '';

if (dateObject.length > 1)
{
    console.log('PASS: ' + dateObject);
}
else
{
    console.log('FAIL: ' + dateObject);
}

console.log('\n\n');