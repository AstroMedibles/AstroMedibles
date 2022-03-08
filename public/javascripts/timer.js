startTime();

function startTime()
{
  const today = new Date();
//   console.log('working');
  
  // 9:00pm
  // const targetDate = new Date('2022-03-07T21:00');
    var targetDate = new Date();
    targetDate.setHours(23);
    targetDate.setMinutes(59);
    targetDate.setSeconds(59);


  // calculation of no. of days between two date 

  // To calculate the time difference of two dates
  var Difference_In_Time = targetDate.getTime() - today.getTime();
  
  // To calculate the no. of hours between two dates
  var Difference_In_Hours = parseInt(Difference_In_Time / (1000 * 60 * 60));
  Difference_In_Time -= Difference_In_Hours * (1000 * 60 * 60);

  
  // To calculate the no. of minutes between two dates
  var Difference_In_Minutes = parseInt(Difference_In_Time / (1000 * 60));
  Difference_In_Time -= Difference_In_Minutes * (1000 * 60);

  // To calculate the no. of seconds between two dates
  var Difference_In_Seconds = parseInt(Difference_In_Time / (1000));
  Difference_In_Time -= Difference_In_Seconds * (1000);

  
  let h = Difference_In_Hours;
  let m = Difference_In_Minutes;
  let s = Difference_In_Seconds;
//   h = checkTime(h);
//   m = checkTime(m);
//   s = checkTime(s);
  
  document.getElementById('preorderTimer').innerHTML =  'Pre-Order Sale Event: '+ h + " hrs  " + m + " min  " + s + ' sec';
  setTimeout(startTime, 500);
}

function checkTime(i)
{
  // add zero in front of numbers < 10
  if (i < 10)
  {
  	i = "0" + i;
  };  
  return i;
}