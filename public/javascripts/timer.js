var address = 'https://www.astromedibles.com'; 
// var address = 'http://localhost:8080';

var preorderTimer, preorderNavbar;
var preorderTimer2, preorderNavbar2;

var notifcationOrderPlacedSentAlready = false;

var start_date, end_date;

var dlop, dlov, date_dlop, date_dlov;

document.addEventListener('DOMContentLoaded', function () 
{
  // get sale info
  fetch(address + '/get_sale_times')
  .then(response => response.json())
  .then(data => 
  {
    start_date = new Date(String(data.sale_start));
    end_date   = new Date(String(data.sale_end));

    // grab UI elements
    preorderTimer  = document.getElementById('preorderTimer');
    preorderNavbar = document.getElementById('preorderNavbar');

    preorderTimer2  = document.getElementById('preorderTimer2');
    preorderNavbar2 = document.getElementById('preorderNavbar2');

    // get account attributes
    var div_account_attributes  = document.getElementById('div_account_attributes');
    var account_attributes      = JSON.parse(div_account_attributes.getAttribute('data-account_attributes'));
    var email_verified          = account_attributes.email_verified;

    dlop = String(account_attributes.date_lastOrderPlaced);
    dlov = String(account_attributes.date_last_visited);
    // console.table(account_attributes);
    // console.log(account_attributes.email_verified);

    // if email delivery failure is true
    if (email_verified == 0)
    {
      $('#errorNavbar').removeAttr('hidden'); 
    }

    date_dlop = new Date(dlop);

    // if user possibly has old items in cart from previous sale, remove them
    try
    {

      date_dlov = new Date(dlov);
    
      console.table(['date_dlov', date_dlov.toISOString()]);

      var start_date_dlov_difference = start_date.getTime() - date_dlov.getTime();

      // if the last time the user visited was before the current sale, reset their cart
      if (start_date_dlov_difference > 0)
      {
        // console.log('Reseting cart');
        cartRemoveAllItems();
        // update dlov to now
        update_date_of_last_visit();
      }
      else
      {
        // console.log('Cart good');
      }
    } catch (error)
    {
      console.log(error + "(DLOV)");
      // update dlov to now
      update_date_of_last_visit();
      cartRemoveAllItems();
    }
    startTime();
    check_sale_times();
  })
  .catch((error) =>
  {
    console.log(error);
  });
});

function check_sale_times()
{
  // get sale info
  fetch(address + '/get_sale_times')
  .then(response => response.json())
  .then(data => 
  {
    start_date = new Date(String(data.sale_start));
    end_date   = new Date(String(data.sale_end));

    // check every 30 seconds (30,000 ms)
    setTimeout(check_sale_times, 30000);
  });
}

function startTime()
{
  $('#preorderNavbar').removeAttr('hidden'); 

  var todayDate = new Date();

  var Difference_In_Time1 = start_date.getTime() - todayDate.getTime();
  var Difference_In_Time2 = end_date.getTime() - todayDate.getTime();
  
  var Difference_In_Time3 = end_date.getTime() - start_date.getTime();

  // var Difference_In_Time3 = end_date.getTime() - start_date.getTime();
  // console.log('Difference_In_Time3: ' + Difference_In_Time3);
  


  // case 1 today date is before start date 
  if (Difference_In_Time1 > 0)
  {
    // console.log('case 1 today date is before start date ');
    preorderNavbar.classList.remove('bg-primary');
    preorderNavbar.classList.add('bg-dark');

    // To calculate the no. of hours between two dates
    var Difference_In_Days1 = parseInt(Difference_In_Time1 / (1000 * 60 * 60 * 24));
    Difference_In_Time1 -= Difference_In_Days1 * (1000 * 60 * 60 * 24);

    // To calculate the no. of hours between two dates
    var Difference_In_Hours1 = parseInt(Difference_In_Time1 / (1000 * 60 * 60));
    Difference_In_Time1 -= Difference_In_Hours1 * (1000 * 60 * 60);

    // To calculate the no. of minutes between two dates
    var Difference_In_Minutes1 = parseInt(Difference_In_Time1 / (1000 * 60));
    Difference_In_Time1 -= Difference_In_Minutes1 * (1000 * 60);

    // To calculate the no. of seconds between two dates
    var Difference_In_Seconds1 = parseInt(Difference_In_Time1 / (1000));
    Difference_In_Time1 -= Difference_In_Seconds1 * (1000);

    var d1 = Difference_In_Days1;
    var h1 = Difference_In_Hours1;
    var m1 = Difference_In_Minutes1;
    var s1 = Difference_In_Seconds1;


    // Calculate how long the sale will go on for in total
    var Difference_In_Days3 = parseInt(Difference_In_Time3 / (1000 * 60 * 60 * 24));
    Difference_In_Time3 -= Difference_In_Days3 * (1000 * 60 * 60 * 24);

    // To calculate the no. of hours between two dates
    var Difference_In_Hours3 = parseInt(Difference_In_Time3 / (1000 * 60 * 60));
    Difference_In_Time3 -= Difference_In_Hours3 * (1000 * 60 * 60);

    // To calculate the no. of minutes between two dates
    var Difference_In_Minutes3 = parseInt(Difference_In_Time3 / (1000 * 60));
    Difference_In_Time3 -= Difference_In_Minutes3 * (1000 * 60);

    // To calculate the no. of seconds between two dates
    var Difference_In_Seconds3 = parseInt(Difference_In_Time3 / (1000));
    Difference_In_Time3 -= Difference_In_Seconds3 * (1000);

    var d3 = Difference_In_Days3;
    var h3 = Difference_In_Hours3;
    // var m3 = Difference_In_Minutes3;
    // var s3 = Difference_In_Seconds3;

    var openForText = 'Open for 🚀';
    if (d3 > 0)
    {
      openForText += ` ${d3} days`;
    }
    if (h3 > 0)
    {
      openForText += `, ${h3} hrs`;
    }
    // if (m3 > 0)
    // {
    //   openForText += `, ${m3} min`;
    // }
    // if (s3 > 0)
    // {
    //   openForText += s3 + ' sec';
    // }
    openForText += ' 🚀';

    preorderTimer.innerHTML =  `Next Sale 🚀 ${d1} days, ${h1} hrs, ${m1} min, ${s1} sec 🚀`;

    $('#preorderNavbar2').removeAttr('hidden');
    preorderTimer2.innerHTML =  openForText;
    
    setTimeout(startTime, 500);
  }
  // case 2 today date is after start date && today date is before end date
  else if (Difference_In_Time1 <= 0 && Difference_In_Time2 >= 0)
  {
    // console.log('case 2 today date is after start date && today date is before end date');
    
    // To calculate the no. of days between two dates
    var Difference_In_Days2 = parseInt(Difference_In_Time2 / (1000 * 60 * 60 * 24));
    Difference_In_Time2 -= Difference_In_Days2 * (1000 * 60 * 60 * 24);
    
    // To calculate the no. of hours between two dates
    var Difference_In_Hours2 = parseInt(Difference_In_Time2 / (1000 * 60 * 60));
    Difference_In_Time2 -= Difference_In_Hours2 * (1000 * 60 * 60);

    // To calculate the no. of minutes between two dates
    var Difference_In_Minutes2 = parseInt(Difference_In_Time2 / (1000 * 60));
    Difference_In_Time2 -= Difference_In_Minutes2 * (1000 * 60);

    // To calculate the no. of seconds between two dates
    var Difference_In_Seconds2 = parseInt(Difference_In_Time2 / (1000));
    Difference_In_Time2 -= Difference_In_Seconds2 * (1000);

    var d = Difference_In_Days2;
    var h = Difference_In_Hours2;
    var m = Difference_In_Minutes2;
    var s = Difference_In_Seconds2;
    //   h = checkTime(h);
    //   m = checkTime(m);
    //   s = checkTime(s);

    var addToCartButtons = document.getElementsByName('shop-item-button');
    for (var i = 0; i < addToCartButtons.length; i++)
    {
      try
      {
        // console.log('notifcationOrderPlacedSentAlready: ' + notifcationOrderPlacedSentAlready);
        if (!notifcationOrderPlacedSentAlready)
        {
          // console.log('dlop: ' + dlop);
          var Difference_In_Time1 = start_date.getTime() - date_dlop.getTime();

          // console.log('Difference_In_Time1: ' + Difference_In_Time1);
          // console.log();

          // if DLOP is before the start of the new sale, allow purchase
          if (isNaN(Difference_In_Time1) || Difference_In_Time1 > 1 )
          {
            // console.log('Purchase is old enough, new one valid');
            var button = addToCartButtons[i];
            button.addEventListener('click', addToCartClicked);
            button.classList.remove('disabled');
          }
          else
          {
            // console.log('Purchase too recent, cannot place additional one')
            // Notification
            const message = "Order already placed";
            const alertType     = 'info';
            const iconChoice    = 2;
            alertNotify(message, alertType, iconChoice, 9999);
            notifcationOrderPlacedSentAlready = true;
          }
        }
      } catch (error)
      {
        var button = addToCartButtons[i];
        button.addEventListener('click', addToCartClicked);
        button.classList.remove('disabled');
        console.log(error);
      } 
    }
    preorderTimer.innerHTML =  `Pre Order Sale 🚀 ${d} days, ${h} hrs, ${m} min, ${s} sec 🚀`;
    // $('#preorderNavbar2').removeAttr('hidden');
    setTimeout(startTime, 500);
  }
  // case 3 today date is after start date && today date is after end date
  else if (Difference_In_Time1 <= 0 && Difference_In_Time2 <= 0)
  {
    // console.log('case 3 today date is after start date && today date is after end date');

    // console.log('DISABLE BUTTONS, TIMER OVER');
    var addToCartButtons = document.getElementsByName('shop-item-button');
    for (var i = 0; i < addToCartButtons.length; i++)
    {
        var button = addToCartButtons[i];
        button.addEventListener('click', null);
        button.classList.add('disabled');
    }
    // console.log('DISABLE SUCCESS');

    preorderNavbar.classList.remove('bg-primary');
    preorderNavbar.classList.add('bg-dark');
    // preorderTimer.innerHTML =  'Pre-Order Sale: '+ h + " hrs  " + m + " min  " + s + ' sec';
    preorderTimer.innerHTML =  'Pre Order Sale Over 🚀 See your <a href="/orders">Order Status</a> 🚀'
    $('#preorderNavbar2').attr('hidden', ''); 

    cartRemoveAllItems();
    setTimeout(startTime, 1000);
  }
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

function cartRemoveAllItems()
{
  fetch(address + '/cartRemoveAllItems',
  {
    credentials: "include",
    method: 'PATCH',
    headers:
    {
        'Content-type': 'application/json'
    }
  })
  .then(response => response.json())
  .then((response) =>
  {
    $("#cart-quantity").text(0);
    // console.log('remove complete');
  });
}

function update_date_of_last_visit()
{
  // console.log('route/update_date_of_last_visit()');
  fetch(address + '/update_date_of_last_visit',
  {
      credentials: "include",
      method: 'PATCH',
      headers:
      {
          'Content-type': 'application/json'
      },
      body: JSON.stringify(
      {
          new_DLOV:    new Date()
      })
  })
  .then(response => response.json())
  .then((data) => 
  {
    // console.log('DLOV Updated');
  }).catch((error) => 
  {
      console.log("update_date_of_last_visit() ERROR: \n" + error);
  });
}

function alertNotify(message, alertType, iconChoice, duration)
{
  if (iconChoice == 1)      // ✔
      iconChoice = 'check-circle-fill';
  else if (iconChoice == 2) // i
      iconChoice = 'info-fill';
  else if (iconChoice == 3) // !
      iconChoice = 'exclamation-triangle-fill';

  var iconHTML = `<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="${alertType}}:"><use xlink:href="#${iconChoice}"/></svg>`;
  alertType = `alert-${alertType}`;

  var html = 
  `
  <div id="alertNotification" class="alert ${alertType}  text-center  col-auto" style="margin: 0 auto; align-text: center;" role="alert">
      <span>
          ${iconHTML}
          ${message}
      </span>
  </div>
  `;

  // show pop up
  $('#notification').append(html);
  
  duration *= 1000;
  setTimeout(function ()
  { // this will automatically close the alert in 2 secs
      $("#alertNotification").remove();
  }, duration);
}
