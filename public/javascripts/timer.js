var preorderTimer, preorderNavbar;
var notifcationOrderPlacedSentAlready = false;

document.addEventListener('DOMContentLoaded', function () 
{
  preorderTimer  = document.getElementById('preorderTimer');
  preorderNavbar = document.getElementById('preorderNavbar');
  
  startTime();
});

function startTime()
{
  var todayDate = new Date();
  var startDate = new Date('2022-04-30T05:00:00.000Z');
  var endDate   = new Date('2022-05-02T05:00:00.000Z');

  var Difference_In_Time1 = startDate.getTime() - todayDate.getTime();
  var Difference_In_Time2 = endDate.getTime() - todayDate.getTime();
  
  // var Difference_In_Time3 = endDate.getTime() - startDate.getTime();
  // console.log('Difference_In_Time3: ' + Difference_In_Time3);
  


  // case 1 today date is before start date 
  if (Difference_In_Time1 > 0)
  {
    // console.log('case 1 today date is before start date ');
    preorderNavbar.classList.remove('bg-primary');
    preorderNavbar.classList.add('bg-dark');

    // To calculate the no. of hours between two dates
    var Difference_In_Days = parseInt(Difference_In_Time1 / (1000 * 60 * 60 * 24));
    Difference_In_Time1 -= Difference_In_Days * (1000 * 60 * 60 * 24);

    // To calculate the no. of hours between two dates
    var Difference_In_Hours = parseInt(Difference_In_Time1 / (1000 * 60 * 60));
    Difference_In_Time1 -= Difference_In_Hours * (1000 * 60 * 60);

    // To calculate the no. of minutes between two dates
    var Difference_In_Minutes = parseInt(Difference_In_Time1 / (1000 * 60));
    Difference_In_Time1 -= Difference_In_Minutes * (1000 * 60);

    // To calculate the no. of seconds between two dates
    var Difference_In_Seconds = parseInt(Difference_In_Time1 / (1000));
    Difference_In_Time1 -= Difference_In_Seconds * (1000);

    var d = Difference_In_Days;
    var h = Difference_In_Hours;
    var m = Difference_In_Minutes;
    var s = Difference_In_Seconds;

    preorderTimer.innerHTML =  'Next Sale 🚀 ' + d + " days  " + h + " hrs  " + m + " min  " + s + ' sec 🚀';
    setTimeout(startTime, 500);
  }
  // case 2 today date is after start date && today date is before end date
  else if (Difference_In_Time1 <= 0 && Difference_In_Time2 >= 0)
  {
    // console.log('case 2 today date is after start date && today date is before end date');
    // To calculate the no. of hours between two dates
    var Difference_In_Hours = parseInt(Difference_In_Time2 / (1000 * 60 * 60));
    Difference_In_Time2 -= Difference_In_Hours * (1000 * 60 * 60);

    // To calculate the no. of minutes between two dates
    var Difference_In_Minutes = parseInt(Difference_In_Time2 / (1000 * 60));
    Difference_In_Time2 -= Difference_In_Minutes * (1000 * 60);

    // To calculate the no. of seconds between two dates
    var Difference_In_Seconds = parseInt(Difference_In_Time2 / (1000));
    Difference_In_Time2 -= Difference_In_Seconds * (1000);

    var h = Difference_In_Hours;
    var m = Difference_In_Minutes;
    var s = Difference_In_Seconds;
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
            var dlop = $('#myform').attr('data-dlop');
            var date_dlop = new Date(dlop);
            // console.log('dlop: ' + dlop);
    
            var Difference_In_Time1 = startDate.getTime() - date_dlop.getTime();
    
    
            // console.log('Difference_In_Time1: ' + Difference_In_Time1);
            // console.log();
            // if order is in past 3 days or 259200000 ms
            if (Difference_In_Time1 > 259200000 || isNaN(Difference_In_Time1))
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
              alertNotify(message, alertType, iconChoice, 3);
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
    preorderTimer.innerHTML =  'Pre-Order Sale: '+ h + " hrs  " + m + " min  " + s + ' sec';
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
    preorderTimer.innerHTML =  'Pre-Order Sale Over: See your order status at <a href="/orders">My Orders</a>'
    
    // console.log('Difference_In_Time: ' + Difference_In_Time / (1000 * 60 * 60));
    // if user logs in less than one hour after sale has ended, place their order
    // else clear their cart
    if ((Difference_In_Time2 / (1000 * 60 * 60) ) > -1 && $("#cart-quantity").text() != 0)
    {
      userPlaceOrder();
      // console.log('ORDER PLACED AUTOMATICALLY');
    }
    else
    {
      cartRemoveAllItems();
      // console.log('CART EMPTIED AUTOMATICALLY');
    }
    // setTimeout(startTime, 500);
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

function userPlaceOrder()
{
  fetch(address + '/userPlaceOrder',
  {
      credentials: "include",
      method: 'POST',
      headers:
      {
          'Content-type': 'application/json'
      },
      body: JSON.stringify
      ({
          date: new Date()
      })
  })
  .then(response => response.json())
  .then((response) =>
  {

    $("#cart-quantity").text(0);

    // Notification
    const message = 'Thank you! Your order has been placed!';
    const alertType     = 'success';
    const iconChoice    = 1;
    alertNotify(message, alertType, iconChoice, 3);

    setTimeout(function ()
    { // this will automatically close the alert in 2 secs
        window.location.replace('/orders');
    }, 3000);
  })
  .catch((error) =>
  {
    console.log(error);

    // Notification
    const message = "Oops. Your order could not be placed.";
    const alertType     = 'danger';
    const iconChoice    = 3;
    alertNotify(message, alertType, iconChoice, 3);
  });
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
  })
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
