document.addEventListener('DOMContentLoaded', function () 
{
    // console.log("DOMContentLoaded");
    ready();
});

const address = 'https://astromedibles-rjjul.ondigitalocean.app';
// const address = 'http://localhost:8080';

function loadCartTotal(data)
{
    // console.log("function: loadCartTotal(data)");
    try
    {
        var cart = data[0].cart.cart[0][1];
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
    fetch(address + '/adminGetUserOrders')
    .then(response => response.json())
    .then(data =>  
    {
        var orders = Array.from(data['data']);

        for (let i = 0; i < orders.length; i++)
        {
            console.log(orders[i]);

            var userOrder = orders[i];

            var status      = userOrder[0].status;
            var order_id    = userOrder[1].order_id;
            var name        = userOrder[2].name;
            var cart        = JSON.parse(userOrder[3].cart).cart;
            var total       = userOrder[4].total;
            var date_created = new Date(userOrder[5].date_created);
            var options =
            {
                hour: '2-digit',
                minute: '2-digit',
                year: "numeric",
                month: "2-digit",
                day: "2-digit"

            };
            date_created = date_created.toLocaleString('en-us', options);

            // Payment Required - Order will not be made until this is paid.
            // Preparing Order - Order is in queue to be baked.
            // Ready for Pickup - Order has been made, and waiting for pickup.
            // Complete - Order has been delivered.
            // <a class="dropdown-item" href='javascript:;' " onClick="dropDownUpdateOrderStatus();">Preparing Order</a>


            var statusText = status;
            if (status === 'Payment Required')
            {
                status = 
                `
                <button class="dropdown-item disabled">Payment Required</button>
                <button name="Preparing Order"  class="dropdown-item" type="button" onClick="dropDownUpdateOrderStatus(event);">Preparing Order</button>
                <button name="Ready for Pickup" class="dropdown-item" type="button" onClick="dropDownUpdateOrderStatus(event);">Ready for Pickup</button>
                <button name="Complete"         class="dropdown-item" type="button" onClick="dropDownUpdateOrderStatus(event);">Complete</button>
                `;

            } else if (status === 'Preparing Order')
            {
                status = 
                `
                <button class="dropdown-item disabled">Payment Required</button>
                <button class="dropdown-item disabled">Preparing Order</button>
                <button name="Ready for Pickup" class="dropdown-item" type="button" onClick="dropDownUpdateOrderStatus(event);">Ready for Pickup</button>
                <button name="Complete"         class="dropdown-item" type="button" onClick="dropDownUpdateOrderStatus(event);">Complete</button>
                `;
            } else if (status === 'Ready for Pickup')
            {
                status = 
                `
                <button class="dropdown-item disabled">Payment Required</button>
                <button class="dropdown-item disabled">Preparing Order</button>
                <button class="dropdown-item disabled">Ready for Pickup</button>
                <button name="Complete"         class="dropdown-item" type="button" onClick="dropDownUpdateOrderStatus(event);">Complete</button>
                `;
            } else if (status === 'Complete')
            {
                status = 
                `
                <button class="dropdown-item disabled">Payment Required</button>
                <button class="dropdown-item disabled">Preparing Order</button>
                <button class="dropdown-item disabled">Ready for Pickup</button>
                <button class="dropdown-item disabled">Complete</button>
                `;
            }

            // var date_created = userOrder[5].date_created.substring(0, 10) + "<br>" // date
            //     + timeHour + userOrder[5].date_created.substring(13, 16) + amOrPm;    // time

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
                <div class="row product-image d-flex justify-content-between align-items-start ">

                    <div class="col-md-4 product-info">
                        <div class="product-specs d-flex flex-column  align-items-center">
                            <div style="padding: 0px 0px 15px 0px; text-align: center;">
                                <span>Status</span>
                                <br>
                                <div class="dropdown" >
                                    <button  id="selected-${order_id}" class="btn btn-primary btn-sm dropdown-toggle" aria-expanded="false" data-bs-toggle="dropdown" type="button" style="width: 165px;">${statusText}</button>
                                    <div class="dropdown-menu" name="${order_id}">
                                        ${status}
                                    </div>
                                </div>
                            </div>

                            <div style="padding: 0px 0px 15px 0px; text-align: center;">
                                <span>Order ID</span>
                                <br>
                                <span class="value">${order_id}</span>
                            </div>
                            <div style="padding: 0px 0px 15px 0px; text-align: center;">
                                <span>Name</span>
                                <br>
                                <span class="value">${name}</span>
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
                                <span>Total</span>
                                <br>
                                <span class="value">${total}</span>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
            `;

            // create card
            var myform = $('#orders-items');
            myform.append(card);

        }
    });
}

function dropDownUpdateOrderStatus(event)
{
    console.log('start dropDownUpdateOrderStatus(event)');

    event = event.currentTarget;
    var parentDiv = event.parentNode;
    var orderId = $(parentDiv).attr("name");
    console.log(orderId);

    var status = $(event).attr("name");
    console.log(status);

    var dropDownSubElementID = $(`#selected-${orderId}`); 
    console.log(dropDownSubElementID);



    if (confirm('Are you sure you want to update this order?'))
    {
        // 
        console.log('Update order pressed.');
    } else
    {
        // 
        console.log('Cancel action pressed.');
        return;
    }

    // $(dropDownSubElementID).text(status);


    fetch(address + '/adminUpdateOrderStatus',
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
                    status: status
                })
        })
        .then(response => response.json())
        .then((data) => 
        {
            // Update Status to7 new option
            $(dropDownSubElementID).text(status);
            $(event).addClass("disabled");
            $(event).on(('onClick'), null);
            console.log("dropDownUpdateOrderStatus(event) complete");
        }).catch((error => 
        {
            console.log("dropDownUpdateOrderStatus(event)  catch:" + error);
        }));
}

function radioOrdersClick()
{
    console.log('radioOrdersClick()');
    $('#codes-items').attr('hidden', '');
           
    $('#orders-items').removeAttr('hidden');


}

function radioCodesClick()
{
    console.log('radioCodesClick()');
    $('#orders-items').attr('hidden', '');
           
    $('#codes-items').removeAttr('hidden');

    var text = 
    [
        'Work in Progress \n'
    ]
    $('#activeAccessCodes').val(text);

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