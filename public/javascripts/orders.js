document.addEventListener('DOMContentLoaded', function () 
{
    // console.log("DOMContentLoaded");
    ready();
});

const address = 'https://www.astromedibles.com';
// const address = 'http://localhost:8080';
var   avalibleDaysandTimes;

function loadCartTotal(data)
{
    // console.log("function: loadCartTotal(data)");
    try
    {
        var cart = data.cart.cart[0][1];
        // console.log(cart);

        if (data == null)
        {
            // console.log("data is undefined or null");
            return;
        }

        // update navbar
        var cartQty = document.getElementById('cart-quantity');
        cartQty.dataset.quantity = cart;
        $("#cart-quantity").text(cart);
    }
    catch (error)
    {
        console.log(error);
    }
}

function populateUserOrders()
{
    // get pickup schedule info

    console.log('Attempting Connection...');

    var newDate = new Date();
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);


    newDate = newDate.toISOString();
    console.log('newDate: ' + newDate);
    fetch(address + '/ordersCustomerGetPickupDaysAndTimes',
    {
        credentials: "include",
        method: 'PATCH',
        headers:
        {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(
        {
            customerDate : newDate
        })
    })
    .then(response => response.json())
    .then(data1 =>  
    {
        console.log('Connection success!');
        var results = Array.from(data1['data']);
        // var dropDownDayResults   = results[0];
        // var dropDownTimeResults  = results[1];
        avalibleDaysandTimes = results;
        console.log('\navalibleDaysandTimes:');
        console.log(avalibleDaysandTimes);


        // get user order info
        fetch(address + '/getUserOrders')
        .then(response => response.json())
        .then(data =>  
        {
            var orders = Array.from(data['data']);

            for (var index = 0; index < orders.length; index++)
            {
                // console.log(orders[i]);

                var userOrder = orders[index];

                var status           = userOrder.status;
                var order_id         = userOrder.order_id;
                var name             = userOrder.name;
                var cart             = JSON.parse(userOrder.cart).cart;
                var total            = userOrder.total;
                var pickup_scheduled = userOrder.pickup_scheduled;

                // if null, make it empty string
                try { pickup_scheduled.length; } catch (error) { pickup_scheduled = ''; }

                console.log
                (`
                order_id: ${order_id}

                pickup_scheduled: ${pickup_scheduled}
                `);


                var date_created = new Date(userOrder.date_created);
                var options =
                {
                    hour: '2-digit',
                    minute: '2-digit',
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit"

                };
                // console.log("date_created");
                // console.log(date_created);
                date_created = date_created.toLocaleString('en-us', options);
                // console.log(date_created);

                var interactDiv = "";
                var dataAttributes = `data-order_id="${order_id}" data-status="${status}"`;


                if (status === "Payment Required")
                {
                    status = '<a href="https://account.venmo.com/pay?txn=pay&recipients=Astro-Medibles">' + status + '</a>'
                    + '<br>' + '<p>(Include your <b>Order ID</b>)</p>';
                    interactDiv =
                    `
                    <br>
                    <span class="value">
                        <button name="cancel-order-button" ${dataAttributes} class="btn btn-warning btn-sm rounded-pill w-100" type="button" style="max-width: 225px;" >Cancel Order</button>
                    </span>`;
                }

                if (status === "Ready for Pickup")
                {
                    // drop down days
                    var dropDownDaysText    = 'Select day';  // 'Sunday, Dec 19'
                    var dropDownTimesText   = 'Select time'; // '2:00pm'

                    var dropDownDaysButton;
                    var dropDownDaysChoices = '';
                    var dropDownTimesChoices = '';


                    // if an order already has a pickup scheduled, display that
                    if (pickup_scheduled.length > 1)
                    {

                        var date = new Date(pickup_scheduled);
                        var localeTimeStr = date.toLocaleTimeString("en-US", {timeZone: "America/Chicago"}).toString();
                        var time = localeTimeStr.substring(0, localeTimeStr.lastIndexOf(':')) + localeTimeStr.substring(localeTimeStr.lastIndexOf(':') + 3) 
                        var options = { weekday: 'long', month: 'short', day: 'numeric'};
                        var dateLocaleString = date.toLocaleString('en-US', options) + getOrdinalSuffix(date);
                        

                        dropDownDaysText  = dateLocaleString;
                        dropDownTimesText = time;

                        dropDownDaysButton = 
                        `
                        <button id="selected-${order_id}" ${dataAttributes} class="btn btn-sm btn-primary rounded-pill dropdown-toggle disabled w-100" aria-expanded="false" data-bs-toggle="dropdown" type="button" style="max-width: 225px;" >${dropDownDaysText}</button>
                        `;


                    }
                    // if the order does not have a pickup scheduled
                    else
                    {
                        dropDownDaysButton = 
                        `
                        <button id="selected-${order_id}" ${dataAttributes} class="btn btn-sm btn-primary rounded-pill dropdown-toggle disabled w-100" aria-expanded="false" data-bs-toggle="dropdown" type="button" style="max-width: 225px;" >${dropDownDaysText}</button>
                        `;


                        // add day drop down choices
                        for (var i = 0; i < avalibleDaysandTimes.length; i++)
                        {
                            var element1 = avalibleDaysandTimes[i];
                            
                            for (var j = 0; j < element1.length; j++)
                            {
                                var element2 = element1[j][0];

                                console.log('\nelement:');
                                console.log(element2);
    
                                console.log('\nelement[2]:');
                                console.log(element2[2]);
    
                                var dateObj = new Date(element2[2]);
                                console.log('\ndateObj:');
                                console.log(dateObj);
                                // create day locale string
                                var localeTimeStr = dateObj.toLocaleTimeString().toString();
                                var options = { weekday: 'long', month: 'short', day: 'numeric'};
                                // getOrdinalSuffix
                                var daySuffix = (dateObj.getDate() % 10 == 1 && dateObj.getDate() != 11 ? 'st' : (dateObj.getDate() % 10 == 2 && dateObj.getDate() != 12 ? 'nd' : (dateObj.getDate() % 10 == 3 && dateObj.getDate() != 13 ? 'rd' : 'th'))); 
                                var dateLocaleString = dateObj.toLocaleString('en-US', options) + daySuffix;
                                console.log('\ndateLocaleString:');
                                console.log(dateLocaleString);

                                dropDownDaysChoices += `<button class="dropdown-item" data-choice="${dateLocaleString}" data-date="${element2[2]}"  onClick="dropDownCustomerUpdateOrderStatusDay(event)" >${dateLocaleString}</button>`;
                            }
                        }

                    }
                    
                    // drop down times
                    var dropDownTimesButton = 
                    `
                    <button id="selected-time-${order_id}" class="btn btn-primary btn-sm rounded-pill dropdown-toggle disabled w-100" aria-expanded="false" data-bs-toggle="dropdown" type="button" style="max-width: 225px;" >${dropDownTimesText}</button>
                    `;


                    // add schedule pickup div to order

                    interactDiv =
                    `
                    <span>Pick Up Time</span>
                    <br>
                    <div class="dropdown" >
                        ${dropDownDaysButton}
                        <div class="dropdown-menu" ${dataAttributes} >
                            ${dropDownDaysChoices}
                        </div>
                    </div>
                    <br>
                    <div class="dropdown" >
                        ${dropDownTimesButton}
                        <div class="dropdown-menu" id="selected-time-options-${order_id}" ${dataAttributes} >
                            ${dropDownTimesChoices}
                        </div>
                    </div>
                    `;
                }

                var cartText = "";
                for (let j = 1; j < cart.length; j++)
                {
                    var cartElement = cart[j];
                    cartText += "(" + cartElement[1] + ") " + cartElement[2] + "<br>";
                }

                let card = "";

                // create element in shopping cart
                card +=
                `
                <div class="product">
                    <div class="row product-image justify-content-center align-items-start" style="padding: 0px;">

                        <div class="col-md-4 product-info">
                            <div class="product-specs d-flex flex-column  align-items-center">
                                    
                                <div style="padding: 0px 0px 15px 0px; text-align: center;">
                                    <span>Status</span>
                                    <br>
                                    <span class="value">${status}</span>
                                </div>


                                <div style="padding: 0px 0px 15px 0px; text-align: center;">
                                    <span>Order ID</span>
                                    <br>
                                    <span class="value">${order_id}</span>
                                </div>

                                <div style="padding: 0px 0px 15px 0px; text-align: center;">
                                    <span>Total</span>
                                    <br>
                                    <span class="value">$${total}</span>
                                </div>
                                
                            </div>
                        </div>

                        <div class="col-md-4 product-info">
                            <div class="product-specs d-flex flex-column  align-items-center">
                                
                                <div style="padding: 0px 0px 15px 0px; text-align: center;">
                                    <span>Items</span>
                                    <br>
                                    <span class="value">${cartText}</span>
                                </div>

                            </div>
                        </div>


                        <div class="col-md-4 product-info ">
                            <div class="product-specs d-flex flex-column  align-items-center">

                                <div style="padding: 0px 0px 15px 0px; text-align: center;">
                                    <span>Date Created:</span>
                                    <br>
                                    <span class="value">${date_created}</span>
                                </div>

                            <div class="w-100" style="padding: 0px 0px 15px 0px; text-align: center;">
                                <br>
                                ${interactDiv}
                            </div>

                            </div>
                        </div>

                    </div>
                </div>
                `;


                // create card
                var myform = $('#cart-items');
                myform.append(card);
            }

            var cancelOrderButtons = document.getElementsByName('cancel-order-button');
            for (var i = 0; i < cancelOrderButtons.length; i++)
            {
                // console.log("button found!");
                var button = cancelOrderButtons[i];
                button.addEventListener('click', buttonCancelOrder);
                // console.log("button " + i + " online!");
            }
            });

        });
}

function dropDownCustomerUpdateOrderStatusDay(event)
{
try
{
    console.log('start dropDownCustomerUpdateOrderStatusDay(event)');

    // console.log('checkpoint 1');

    event = event.currentTarget;

    var parentDiv = event.parentNode;
    var orderId = $(parentDiv).attr("data-order_id");
    console.log(`orderId : ${orderId}`);

    var newChoice = $(event).attr("data-choice");
    var newDate = $(event).attr("data-date");
    console.log(`newChoice : ${newChoice}`);

    var dropDownSubElementID = $(`#selected-${orderId}`); 
    console.log(`dropDownSubElementID : ${dropDownSubElementID}`);

    // $(dropDownSubElementID).text(status);


    // Update Status to new option
    $(dropDownSubElementID).text(newChoice);
    $(dropDownSubElementID).attr('data-date', newDate);

    // enable time drop down
    $(`#selected-time-${orderId}`).removeClass("disabled");

    console.log('Removing disabled at: ' + `#selected-time-${orderId}`);

    // add object and add times to drop down

    var timeDropDown = $(`#selected-time-options-${orderId}`);
    timeDropDown.empty();

    console.log('\n\n');

    console.log('avalibleDaysandTimes');
    console.log(avalibleDaysandTimes[0]);
    newDate = new Date(newDate);

    console.log('\n');
    // console.log('checkpoint 2');
    // add time drop down choices
    for (var i = 0; i < avalibleDaysandTimes[0].length; i++)
    {
        var element1 = avalibleDaysandTimes[0][i];
        var elementDay = new Date(element1[0][2]);

        // console.log('newDate');
        // console.log(newDate);

        
        // console.log('elementDay');
        // console.log(elementDay);

        console.log('\n\n');

        var isSameDay =   (newDate.getDate()     === elementDay.getDate() 
                        && newDate.getMonth()    === elementDay.getMonth()
                        && newDate.getFullYear() === elementDay.getFullYear());

        if (isSameDay)
        {
        //    console.log('DATE MATCH');

           for (var j = 0; j < element1.length; j++)
           {
                var localeTime_avalibility_datetimeobject = element1[j];
                var optionLocaleTime      = localeTime_avalibility_datetimeobject[0];
                var optionAvalibility     = localeTime_avalibility_datetimeobject[1];
                var optionDateTimeObject  = localeTime_avalibility_datetimeobject[2];
                var option = '';

                console.log('\nlocaleTime_avalibility_datetimeobject');  // [ '12:00 AM', true, '2022-02-25T06:00:00.000Z' ]
                console.log(localeTime_avalibility_datetimeobject);
            
                if (optionAvalibility === true)
                {
                    option = `<button class="dropdown-item" data-choice="${optionLocaleTime}" data-time="${optionDateTimeObject}" onClick="dropDownCustomerUpdateOrderStatusTime(event)">${optionLocaleTime}</button>`;
                }
                else
                {
                    option = `<button class="dropdown-item disabled">${optionLocaleTime}</button>`;

                }
                timeDropDown.append(option);
           }
        }
    }
    // console.log('checkpoint 3');

    


} catch (error)
{
    console.log('ERROR:' + error);
    console.log('\n')
    console.trace(error);    
}

    
}

function dropDownCustomerUpdateOrderStatusTime(event)
{
    console.log('start dropDownCustomerUpdateOrderStatusTime(event)');
    // console.log('checkpoint 4');

    event = event.currentTarget;

    var parentDiv = event.parentNode;
    var orderId = $(parentDiv).attr("data-order_id");
    console.log(`orderId : ${orderId}`);

    var date = new Date($(`#selected-${orderId}`).attr("data-date"));
    // console.log(`date : ${date}`);

    var newChoice = $(event).attr("data-choice");
    console.log(`data-choice : ${newChoice}`);

    var time = new Date($(event).attr("data-time"));
    console.log(`data-time : ${time.toISOString()}`);

    // date.setHours(time.getHours());

    // console.log(`dateTIME : ${date}`);

    var dropDownSubElementID = $(`#selected-time-${orderId}`); 
    // console.log(`dropDownSubElementID : ${dropDownSubElementID}`);

    if (confirm('Confirm time for scheduled pickup? \nThis action cannot be undone.'))
    {
        // 
        // console.log('Update order pressed.');

        fetch(address + '/userUpdateScheduledPickup',
        {
            credentials: "include",
            method: 'PATCH',
            headers:
            {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(
                {
                    orderId: orderId,
                    dateScheduledPickup: time.toISOString()
                })
        })
        .then(response => response.json())
        .then((data) => 
        {
            console.log(`data: ${data}`);
            if (data == true)
            {
                // Update Status to new option
                $(dropDownSubElementID).text(newChoice);

                // disable drop down day
                $(`#selected-${orderId}`).addClass("disabled");
                $(`#selected-${orderId}`).on(('onClick'), null);
                // disable drop down time
                $(`#selected-time-${orderId}`).addClass("disabled");
                $(`#selected-time-${orderId}`).on(('onClick'), null);
            }
            else
            {
                // disable drop down day
                $(event).addClass("disabled");
                $(event).on(('onClick'), null);

                alert(`(${newChoice}) Time slot is not available anymore, try again`);
            }

        }).catch((error => 
        {
            console.log("dropDownUpdateOrderStatus(event)  catch:" + error);
        }));

    } else
    {
        // 
        // console.log('Cancel action pressed.');
        return;
    }

}


function buttonCancelOrder(event)
{
    if (confirm('Are you sure you want to cancel this order? \nThis action cannot be undone.')) {
        // 
        console.trace('Cancel order pressed.');
      } else {
        // 
        console.trace('Do not cancel order pressed.');
        return;
      }


    // console.log("\n" + "buttonCancelOrder(event)");
    var button = event.target;
    var order_id = button.dataset.order_id;

    console.log("order_id:\t" + order_id);

    fetch(address + '/cancelOrder',
        {
            credentials: "include",
            method: 'DELETE',
            headers:
            {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(
                {
                    order_id: order_id
                })
        })
        .then(response => response.json())
        .then(() => 
        {
            // window.location.href = '/MyOrders'; // might not need?

            var parentDiv = button.parentNode.parentNode.parentNode.parentNode.parentNode;
            parentDiv.remove();
            // console.log("cancelOrder(event) complete");
        }).catch((error => 
        {
            console.log("cancelOrder(event)  catch:" + error);
        }));

}


function ready()
{
    // get cart total
    fetch(address + '/getCartData')
        .then(response => response.json())
        .then(data => 
        {
            loadCartTotal(data['data']);
        });

    populateUserOrders();
}

function getOrdinalSuffix(dt)
{
    return (dt.getDate() % 10 == 1 && dt.getDate() != 11 ? 'st' : (dt.getDate() % 10 == 2 && dt.getDate() != 12 ? 'nd' : (dt.getDate() % 10 == 3 && dt.getDate() != 13 ? 'rd' : 'th'))); 
}