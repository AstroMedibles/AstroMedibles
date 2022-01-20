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


    fetch(address + '/ordersCustomerGetPickupDaysAndTimes',
    {
        credentials: "include",
        method: 'GET',
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
        fetch(address + '/getPickupAvailabilityTimes')
        .then(response => response.json())
        .then(data2 =>  
        {
            var checkData1 = Array.from(data1['data']);
            var checkData2 = Array.from(data2['data']);
    
            console.log('Days Availability');
            for (let i = 0; i < checkData1.length; i++)
            {
                 console.log(checkData1[i]);
            }
            console.log('Times Availability');

            for (let i = 0; i < checkData2.length; i++)
            {
                 console.log(checkData2[i]);
            }


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
                        var dropDownDaysText   = 'Sunday, Dec 19';

                        var dropDownDaysButton = 
                        `
                        <button id="selected-${order_id}" class="btn btn-primary btn-sm rounded-pill dropdown-toggle" aria-expanded="false" data-bs-toggle="dropdown" type="button" style="width: 100%;">${dropDownDaysText}</button>
                        `;

                        var dropDownDaysChoices = 
                        `
                        <button class="dropdown-item">Sunday, Dec 19</button>
                        <button class="dropdown-item">Monday, Dec 20</button>
                        <button class="dropdown-item disabled">Tuesday, Dec 21</button>
                        <button class="dropdown-item">Wednesday, Dec 22</button>
                        `;

                        // drop down times
                        var dropDownTimesText   = '2:00pm';

                        var dropDownTimesButton = 
                        `
                        <button id="selected-${order_id}" class="btn btn-primary btn-sm rounded-pill dropdown-toggle" aria-expanded="false" data-bs-toggle="dropdown" type="button" style="width: 100%;">${dropDownTimesText}</button>
                        `;

                        var dropDownTimesChoices = 
                        `
                        <button class="dropdown-item">1:00pm</button>
                        <button class="dropdown-item">2:00pm</button>
                        <button class="dropdown-item disabled">3:00pm</button>
                        <button class="dropdown-item">4:00pm</button>
                        `;

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

    });



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