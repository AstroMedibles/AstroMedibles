// const event2 = new Date('July 1, 1999');
const event2 = new Date();

// console.log('event2');
// console.log(event2);
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

    console.log(`${index}. ${suggestedDate.toString().substring(0, 16)}`);

}


console.log('\n\n');