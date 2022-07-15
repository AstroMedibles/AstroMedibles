// https://www.timeanddate.com/time/zone/usa

// const date1 = new Date('July 1, 1999');
// new Date(year, monthIndex, day, hours, minutes, seconds, milliseconds)
// const dbDateString = '2022-03-25T17:00:00.000Z';

// var date1 = new Date(new Date(dbDateString).toISOString());
// var date2 = new Date(dbDateString);

// var todayDate = new Date();
var startDate     = new Date('2022-07-15T05:00:00.000Z');
var startDate2    = new Date('2022-07-15T05:00:00.000Z');


// for (var i = 0; i < 26; i++)
// {
//     console.log('i: ' + i + '\n');
//     startDate.setHours(i);
//     startDate2.setUTCHours(i);
//     console.log(startDate.toISOString());
//     console.log(startDate2.toISOString() + '\n\n');

// }

var sale_times = 
{
    sale_start : '1. yyyy/mm/dd',
    sale_end : '2. yyyy/mm/dd'
}

console.log(sale_times.sale_end);
console.log(sale_times.sale_start);


// var date1 = new Date('2022-04-07T00:42:00.000Z');
// var date1 = new Date();

// date1.setHours('5');

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


console.log('\n\n');