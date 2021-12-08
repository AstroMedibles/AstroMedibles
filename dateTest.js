// const event2 = new Date('July 1, 1999');
const event2 = new Date(2021, 12 - 1, 6, 1, 17);

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

console.log('\n\n');

// Schedule Object
// 
/*
    [
        [Nov. 15th, 2:00pm, 3 Pickups]
        [Nov. 15th, 2:30pm, 5 Pickups]
    ]
*/