document.addEventListener('DOMContentLoaded', function () 
{
    // console.log("DOMContentLoaded");
    ready();
});

// const address = 'https://www.astromedibles.com';
const address = 'http://localhost:8080';

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
    // get schedule info

    console.log('Attempting Connection...');
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
            customerDate : new Date()
        })
    })
    .then(response => response.json())
    .then(data1 =>  
    {
        console.log('Connection success!');
        var results = Array.from(data1['data']);
        var dropDownDayResults  = results[0];
        var dropDownTimeResults = results[1];

        // console.log('/ordersCustomerGetPickupDaysAndTimes');


        // get user order info
        fetch(address + '/getUserOrders')
        .then(response => response.json())
        .then(data =>  
        {
            var orders = Array.from(data['data']);

            for (let i = 0; i < orders.length; i++)
            {
                console.log(orders[i]);

                var userOrder = orders[i];

                var status      = userOrder.status;
                var order_id    = userOrder.order_id;
                var name        = userOrder.name;
                var cart        = JSON.parse(userOrder.cart).cart;
                var total       = userOrder.total;

                var date_created = new Date(userOrder.date_created);
                var options =
                {
                    hour: '2-digit',
                    minute: '2-digit',
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit"

                };
                console.log("date_created");
                console.log(date_created);
                date_created = date_created.toLocaleString('en-us', options);
                console.log(date_created);

                var interactDiv = "";

                if (status === "Payment Required")
                {
                    var dataAttributes = "data-order_id=" + order_id;
                    status = '<a href="https://account.venmo.com/pay?txn=pay&recipients=Astro-Medibles">' + status + '</a>';
                    interactDiv =
                    `
                    <br>
                    <span class="value">
                        <button name="cancel-order-button" ${dataAttributes} class="btn btn-warning btn-sm rounded-pill" type="button" >Cancel Order</button>
                    </span>`;
                }

                if (status === "Ready for Pickup")
                {
                    var dataAttributes = "data-order_id=" + order_id;
                    // status = '<a href="/orders">' + status + '</a>';

                    // drop down days
                    var dropDownDaysText   = dropDownDayResults[0][0]; // 'Sunday, Dec 19'

                    var dropDownDaysButton = 
                    `
                    <button id="selected-${order_id}" class="btn btn-primary btn-sm rounded-pill dropdown-toggle" aria-expanded="false" data-bs-toggle="dropdown" type="button" style="width: 100%; ">${dropDownDaysText}</button>
                    `;

                    // var dropDownDaysChoices = 
                    // `
                    // <button class="dropdown-item">Sunday, Dec 19</button>
                    // <button class="dropdown-item">Monday, Dec 20</button>
                    // <button class="dropdown-item disabled">Tuesday, Dec 21</button>
                    // <button class="dropdown-item">Wednesday, Dec 22</button>
                    // `;
                    var dropDownDaysChoices = '';

                    for (var index = 0; index < dropDownDayResults.length; index++)
                    {
                        const element = dropDownDayResults[index];

                        if (element[1] == true)
                            dropDownDaysChoices += `<button class="dropdown-item" dropDownCustomerUpdateOrderStatus(event)>${element[0]}</button>`;
                        else
                            dropDownDaysChoices += `<button class="dropdown-item disabled">${element[0]}</button>`;

                    }
                    


                    // drop down times
                    var dropDownTimesText   = dropDownTimeResults[0][0]; // '2:00pm'; 

                    var dropDownTimesButton = 
                    `
                    <button id="selected-${order_id}" class="btn btn-primary btn-sm rounded-pill dropdown-toggle" aria-expanded="false" data-bs-toggle="dropdown" type="button" style="width: 100%;">${dropDownTimesText}</button>
                    `;


                    var dropDownTimesChoices = '';

                    for (var index = 0; index < dropDownTimeResults.length; index++)
                    {
                        const element = dropDownTimeResults[index];
                        // if [1] == true, avalible
                        if (element[1] == true)
                            dropDownTimesChoices += `<button class="dropdown-item" dropDownCustomerUpdateOrderStatus(event)>${element[0]}</button>`;
                        else
                            dropDownTimesChoices += `<button class="dropdown-item disabled">${element[0]}</button>`;

                        
                        // if [1] == false, disabled
                    }


                    // var dropDownTimesChoices = 
                    // `
                    // <button class="dropdown-item">1:00pm</button>
                    // <button class="dropdown-item">2:00pm</button>
                    // <button class="dropdown-item disabled">3:00pm</button>
                    // <button class="dropdown-item">4:00pm</button>
                    // `;

                    // add schedule pickup div to order

                    interactDiv =
                    `
                    <span>Pick Up Time</span>
                    <br>
                    <div class="dropdown" >
                        ${dropDownDaysButton}
                        <div class="dropdown-menu" name="${order_id}">
                            ${dropDownDaysChoices}
                        </div>
                    </div>
                    <br>
                    <div class="dropdown" >
                        ${dropDownTimesButton}
                        <div class="dropdown-menu" name="${order_id}">
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
                    <div class="row product-image justify-content-center align-items-start">

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
                                    <span>Date:</span>
                                    <br>
                                    <span class="value">${date_created}</span>
                                </div>

                            <div style="padding: 0px 0px 15px 0px; text-align: center;">
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
                        console.log("button found!");
                        var button = cancelOrderButtons[i];
                        button.addEventListener('click', buttonCancelOrder);
                        console.log("button " + i + " online!");
                    }
                });

                var s = new Date().toLocaleString();

            console.log("DATE: " + s);

        });
}

function dropDownCustomerUpdateOrderStatus(event)
{
    // console.log('start dropDownUpdateOrderStatus(event)');

    event = event.currentTarget;
    var parentDiv = event.parentNode;
    var orderId = $(parentDiv).attr("name");
    // console.log(orderId);

    var status = $(event).attr("name");
    // console.log(status);

    var dropDownSubElementID = $(`#selected-${orderId}`); 
    // console.log(dropDownSubElementID);



    if (confirm('Are you sure you want to update this order?'))
    {
        // 
        // console.log('Update order pressed.');
    } else
    {
        // 
        // console.log('Cancel action pressed.');
        return;
    }

    // $(dropDownSubElementID).text(status);


    // fetch(address + '/adminUpdateOrderStatus',
    // {
    //     credentials: "include",
    //     method: 'PATCH',
    //     headers:
    //     {
    //         'Content-type': 'application/json'
    //     },
    //     body: JSON.stringify(
    //         {
    //             orderId: orderId,
    //             status: status
    //         })
    // })
    // .then(response => response.json())
    // .then((data) => 
    // {
        // Update Status to new option
        $(dropDownSubElementID).text(status);

        // disable used option
        $(event).addClass("disabled");
        $(event).on(('onClick'), null);

        // console.log('Status check: ' + status);

        status = status.toLowerCase();
        // console.log("status.includes('complete')");
        // console.log(status.includes('complete'));

        // if (status === 'preparing order')
        // {
        //     // console.log(1);
        //     dropDownSubElementID.removeClass("btn-danger");
        //     dropDownSubElementID.addClass("btn-primary");
        // } else if (status === 'ready for pickup')
        // {
        //     // console.log(2);
        //     dropDownSubElementID.removeClass("btn-danger");
        //     dropDownSubElementID.removeClass("btn-primary");
        //     dropDownSubElementID.addClass("btn-warning");
        // } else if (status === 'complete')
        // {
        //     // console.log(3);
        //     dropDownSubElementID.removeClass("btn-danger");
        //     dropDownSubElementID.removeClass("btn-primary");
        //     dropDownSubElementID.removeClass("btn-warning");
        //     dropDownSubElementID.addClass("btn-success");
        // }

        // console.log("dropDownUpdateOrderStatus(event) complete");
    // }).catch((error => 
    // {
        // console.log("dropDownUpdateOrderStatus(event)  catch:" + error);
    // }));
}

function buttonCancelOrder(event)
{
    if (confirm('Are you sure you want to cancel this order?')) {
        // 
        console.trace('Cancel order pressed.');
      } else {
        // 
        console.trace('Do not cancel order pressed.');
        return;
      }


    console.log("\n" + "buttonCancelOrder(event)");
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
            console.log("cancelOrder(event) complete");
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