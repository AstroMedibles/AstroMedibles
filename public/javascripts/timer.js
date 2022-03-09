var preorderTimer, preorderNavbar;

document.addEventListener('DOMContentLoaded', function () 
{
  preorderTimer = document.getElementById('preorderTimer');
  preorderNavbar = document.getElementById('preorderNavbar');
  
  startTime();
});

function startTime()
{
  const today = new Date();
//   console.log('working');
  
  // 9:00pm
  // const targetDate = new Date('2022-03-07T21:00');
    var targetDate = new Date();
    targetDate.setHours(23);
    // targetDate.setHours(8);
    targetDate.setMinutes(59);
    // targetDate.setMinutes(23);
    targetDate.setSeconds(59);

  // To calculate the time difference of two dates
  var Difference_In_Time = targetDate.getTime() - today.getTime();

  if (Difference_In_Time > 0)
  {

    // console.log(`Difference_In_Time: ${Difference_In_Time}`);
  
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

    var addToCartButtons = document.getElementsByName('shop-item-button');
    for (var i = 0; i < addToCartButtons.length; i++)
    {
        var button = addToCartButtons[i];
        button.addEventListener('click', addToCartClicked);
        button.classList.remove('disabled');
    }

    preorderTimer.innerHTML =  'Pre-Order Sale: '+ h + " hrs  " + m + " min  " + s + ' sec';
    setTimeout(startTime, 500);
  } 
  else
  {
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

    console.log('CART: '  +$("#cart-quantity").text());
    if ($("#cart-quantity").text() != 0)
    {
      console.log('CART NOT ZERO BABY');
    }

    if ((Difference_In_Time / (1000 * 60 * 60) ) > -1 && $("#cart-quantity").text() != 0)
    {
      userPlaceOrder();
      // console.log('ORDER PLACED AUTOMATICALLY');
    }
    else
    {
      cartRemoveAllItems();
      // $("#cart-quantity").text(0);
      // console.log('CART EMPTIED AUTOMATICALLY');
    }
    
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
    console.log('remove complete');
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
