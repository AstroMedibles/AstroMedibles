document.addEventListener('DOMContentLoaded', function () 
{
    // console.log("DOMContentLoaded");
    ready();
});

const address = 'https://www.astromedibles.com';
// const address = 'http://localhost:8080';

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
    fetch(address + '/adminGetUserOrders')
    .then(response => response.json())
    .then(data =>  
    {
        var orders = Array.from(data['data']);

        // $('#orders-items').val('');
        document.getElementById("orders-items").innerHTML = '';


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
            date_created = date_created.toLocaleString('en-us', options);

            // Payment Required - Order will not be made until this is paid.
            // Preparing Order - Order is in queue to be baked.
            // Ready for Pickup - Order has been made, and waiting for pickup.
            // Complete - Order has been delivered.
            // <a class="dropdown-item" href='javascript:;' " onClick="dropDownUpdateOrderStatus();">Preparing Order</a>


            var statusText = status;
            var dropDownButton = '';

            if (statusText === 'Payment Required')
            {
                dropDownButton = 
                `
                <button  id="selected-${order_id}" class="btn btn-danger btn-sm dropdown-toggle" aria-expanded="false" data-bs-toggle="dropdown" type="button" ">${statusText}</button>
                `;

                status = 
                `
                <button class="dropdown-item disabled">Payment Required</button>
                <button name="Preparing Order"  class="dropdown-item" type="button" onClick="dropDownUpdateOrderStatus(event);">Preparing Order</button>
                <button name="Ready for Pickup" class="dropdown-item" type="button" onClick="dropDownUpdateOrderStatus(event);">Ready for Pickup</button>
                <button name="Complete"         class="dropdown-item" type="button" onClick="dropDownUpdateOrderStatus(event);">Complete</button>
                `;
            } else if (statusText === 'Preparing Order')
            {
                dropDownButton = 
                `
                <button  id="selected-${order_id}" class="btn btn-primary btn-sm dropdown-toggle" aria-expanded="false" data-bs-toggle="dropdown" type="button" ">${statusText}</button>
                `;

                status = 
                `
                <button class="dropdown-item disabled">Payment Required</button>
                <button class="dropdown-item disabled">Preparing Order</button>
                <button name="Ready for Pickup" class="dropdown-item" type="button" onClick="dropDownUpdateOrderStatus(event);">Ready for Pickup</button>
                <button name="Complete"         class="dropdown-item" type="button" onClick="dropDownUpdateOrderStatus(event);">Complete</button>
                `;
            } else if (statusText === 'Ready for Pickup')
            {
                dropDownButton = 
                `
                <button  id="selected-${order_id}" class="btn btn-warning btn-sm dropdown-toggle" aria-expanded="false" data-bs-toggle="dropdown" type="button" ">${statusText}</button>
                `;
                status = 
                `
                <button class="dropdown-item disabled">Payment Required</button>
                <button class="dropdown-item disabled">Preparing Order</button>
                <button class="dropdown-item disabled">Ready for Pickup</button>
                <button name="Complete"         class="dropdown-item" type="button" onClick="dropDownUpdateOrderStatus(event);">Complete</button>
                `;
            } else if (statusText === 'Complete')
            {
                dropDownButton = 
                `
                <button  id="selected-${order_id}" class="btn btn-success btn-sm dropdown-toggle" aria-expanded="false" data-bs-toggle="dropdown" type="button" ">${statusText}</button>
                `;
                status = 
                `
                <button class="dropdown-item disabled">Payment Required</button>
                <button class="dropdown-item disabled">Preparing Order</button>
                <button class="dropdown-item disabled">Ready for Pickup</button>
                <button class="dropdown-item disabled">Complete</button>
                `;
            }



            // var date_created = userOrder.date_created.substring(0, 10) + "<br>" // date
            //     + timeHour + userOrder.date_created.substring(13, 16) + amOrPm;    // time

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
                                    ${dropDownButton}
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
            var ordersHTML = $('#orders-items');
            ordersHTML.append(card);

        }

    });
}

function dropDownUpdateOrderStatus(event)
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

            // disable used option
            $(event).addClass("disabled");
            $(event).on(('onClick'), null);

            // console.log('Status check: ' + status);

            status = status.toLowerCase();
            // console.log("status.includes('complete')");
            // console.log(status.includes('complete'));

            if (status === 'preparing order')
            {
                // console.log(1);
                dropDownSubElementID.removeClass("btn-danger");
                dropDownSubElementID.addClass("btn-primary");
            } else if (status === 'ready for pickup')
            {
                // console.log(2);
                dropDownSubElementID.removeClass("btn-danger");
                dropDownSubElementID.removeClass("btn-primary");
                dropDownSubElementID.addClass("btn-warning");
            } else if (status === 'complete')
            {
                // console.log(3);
                dropDownSubElementID.removeClass("btn-danger");
                dropDownSubElementID.removeClass("btn-primary");
                dropDownSubElementID.removeClass("btn-warning");
                dropDownSubElementID.addClass("btn-success");
            }

            // console.log("dropDownUpdateOrderStatus(event) complete");
        }).catch((error => 
        {
            // console.log("dropDownUpdateOrderStatus(event)  catch:" + error);
        }));
}

function radioOrdersClick()
{
    $('#codes-items').attr('hidden', '');
    $('#chart-items').attr('hidden', '');
    $('#pickups-items').attr('hidden', '');

    $('#orders-items').removeAttr('hidden');


    // set radioOrders active
    document.getElementById("radioOrders").classList.add("active");

    document.getElementById("radioCodes").classList.remove("active");
    document.getElementById("radioChart").classList.remove("active");
    document.getElementById("radioPickups").classList.remove("active");



    populateUserOrders();
}

function radioCodesClick()
{
    // console.log('radioCodesClick()');
    $('#orders-items').attr('hidden', '');
    $('#chart-items').attr('hidden', '');
    $('#pickups-items').attr('hidden', '');


    $('#codes-items').removeAttr('hidden');


    // set radioCodes active
    document.getElementById("radioCodes").classList.add("active");

    document.getElementById("radioOrders").classList.remove("active");
    document.getElementById("radioChart").classList.remove("active");
    document.getElementById("radioPickups").classList.remove("active");


    fetch(address + '/adminGetAccessCodes')
    .then(response => response.json())
    .then((response) =>
    {
        // var text = 
        // [
        //     'Work in Progress \n'
        // ]
        $('#activeAccessCodes').val(response['data']);
    })
    .catch(() =>
    {
        $('#activeAccessCodes').val();
    });
}

function radioPickupsClick()
{
    // console.log('radioChartClick()');
    // hide other divs, reveal chart div
    $('#codes-items').attr('hidden', '');
    $('#orders-items').attr('hidden', '');
    $('#chart-items').attr('hidden', '');


    $('#pickups-items').removeAttr('hidden');


    // set radioChart active
    document.getElementById("radioPickups").classList.add("active");

    document.getElementById("radioOrders").classList.remove("active");
    document.getElementById("radioCodes").classList.remove("active");
    document.getElementById("radioChart").classList.remove("active");

}

function radioChartClick()
{
    // console.log('radioChartClick()');
    // hide other divs, reveal chart div
    $('#codes-items').attr('hidden', '');
    $('#orders-items').attr('hidden', '');

    $('#chart-items').removeAttr('hidden');


    // set radioChart active
    document.getElementById("radioChart").classList.add("active");

    document.getElementById("radioOrders").classList.remove("active");
    document.getElementById("radioCodes").classList.remove("active");

    // update chart
    fetch(address + '/adminGetUserOrders')
    .then(response => response.json())
    .then(data =>  
    {
        var orders = Array.from(data['data']);


        var chartMapPaymentRequired = new Map(); // (id, {quantity: 5, name: 'Krispy Treats'})
        var chartMapPaymentRecieved = new Map(); // (id, {quantity: 5, name: 'Krispy Treats'})

        var chartMapTotal = new Map(); // will be used to combine the two above Maps


        for (let i = 0; i < orders.length; i++)
        {
            // console.log(orders[i]);

            var userOrder = orders[i];

            var statusText  = userOrder.status;
            var cart        = JSON.parse(userOrder.cart).cart;

            // create chartMap

            if (statusText === 'Payment Required')
            {
                for (let j = 1; j < cart.length; j++)
                {
                    var cartElement = cart[j];
                    var id = cartElement[0];
    
                    // if item exists in chartMapPaymentRequired, add to its quantity
                    if (chartMapPaymentRequired.has(id))
                    {
                        // console.log(`chartMapPaymentRequired.has(${id}) TRUE`);
                        var quantity = chartMapPaymentRequired.get(id).quantity;
                        var name     = chartMapPaymentRequired.get(id).name;
    
                        var newQuantity = quantity + cartElement[1];
    
                        chartMapPaymentRequired.set(id, {quantity: newQuantity, name: name});
                    }
                    // if item does not exist in chartMapPaymentRequired, add its entry into the chartMapPaymentRequired
                    else
                    {
                        // console.log(`chartMapPaymentRequired.has(${id}) FALSE`);
                        chartMapPaymentRequired.set(id, {quantity: cartElement[1], name: cartElement[2]});
                    }
                }
            } else if (statusText === 'Preparing Order')
            {
                for (let j = 1; j < cart.length; j++)
                {
                    var cartElement = cart[j];
                    var id = cartElement[0];
    
                    // if item exists in chartMapPaymentRecieved, add to its quantity
                    if (chartMapPaymentRecieved.has(id))
                    {
                        // console.log(`chartMapPaymentRecieved.has(${id}) TRUE`);
                        var quantity = chartMapPaymentRecieved.get(id).quantity;
                        var name     = chartMapPaymentRecieved.get(id).name;
    
                        var newQuantity = quantity + cartElement[1];
    
                        chartMapPaymentRecieved.set(id, {quantity: newQuantity, name: name});
                    }
                    // if item does not exist in chartMapPaymentRecieved, add its entry into the chartMapPaymentRecieved
                    else
                    {
                        // console.log(`chartMapPaymentRecieved.has(${id}) FALSE`);
                        chartMapPaymentRecieved.set(id, {quantity: cartElement[1], name: cartElement[2]});
                    }
                }
            }

        }


        // var text = '';
        chartMapPaymentRequired = new Map([...chartMapPaymentRequired].sort((a, b) => a[0] - b[0]));
        for (let [key, value] of chartMapPaymentRequired.entries())
        {
            // text += `[${key}]  (${value.quantity}) ${value.name}<br>`;
            
            // if item exists in chartMapTotal, add to its quantity
            if (chartMapTotal.has(key))
            {
                // console.log(`chartMapTotal.has(${key}) TRUE`);
                var quantity = chartMapTotal.get(key).quantity;
                var name     = chartMapTotal.get(key).name;

                var newQuantity = quantity + value.quantity;

                chartMapTotal.set(key, {quantity: newQuantity, name: name});
            }
            // if item does not exist in chartMapTotal, add its entry into the chartMapTotal
            else
            {
                // console.log(`chartMapTotal.has(${key}) FALSE`);
                chartMapTotal.set(key, {quantity: value.quantity, name: value.name});
            }
        }
        // $('#chartMapPaymentRequired').val(text);
        // document.getElementById("chartMapPaymentRequired").innerHTML = text;
        // text = '';
        
        chartMapPaymentRecieved = new Map([...chartMapPaymentRecieved].sort((a, b) => a[0] - b[0]));

        // chartMapPaymentRecieved = new Map([...chartMapPaymentRecieved].sort((a, b) => a[0]) - (b[0]));
        for (let [key, value] of chartMapPaymentRecieved.entries())
        {
            // text += `[${key}]  (${value.quantity}) ${value.name}<br>`;
            
            // if item exists in chartMapTotal, add to its quantity
            if (chartMapTotal.has(key))
            {
                // console.log(`chartMapTotal.has(${key}) TRUE`);
                var quantity = chartMapTotal.get(key).quantity;
                var name     = chartMapTotal.get(key).name;

                var newQuantity = quantity + value.quantity;

                chartMapTotal.set(key, {quantity: newQuantity, name: name});
            }
            // if item does not exist in chartMapTotal, add its entry into the chartMapTotal
            else
            {
                // console.log(`chartMapTotal.has(${key}) FALSE`);
                chartMapTotal.set(key, {quantity: value.quantity, name: value.name});
            }
        }
        // $('#chartMapPaymentRecieved').val(text);
        // document.getElementById("chartMapPaymentRecieved").innerHTML = text;


        // text = '';
        // chartMapTotal = new Map([...chartMapTotal.entries()].sort());
        var tableHTML = '';
        chartMapTotal = new Map([...chartMapTotal].sort((a, b) => a[0] - b[0]));
        for (let [key, value] of chartMapTotal.entries())
        {
            var quantityRequired = 0;
            var quantityRecieved = 0;

            if (chartMapPaymentRequired.has(key))
            {
                quantityRequired = chartMapPaymentRequired.get(key).quantity;
            }
            if (chartMapPaymentRecieved.has(key))
            {
                quantityRecieved = chartMapPaymentRecieved.get(key).quantity;
            }

            // text += `[${key}]  (${value.quantity}) ${value.name}<br>`;
            tableHTML +=
                    `
                    <tr>
                        <th scope="row">${value.name}</th>
                        <td class="table-danger"  >${quantityRequired}</td>
                        <td class="table-primary" >${quantityRecieved}</td>
                        <td>${value.quantity}</td>
                    </tr>
                    `;

        }
        // $('#chartMapTotal').val(text);
        // document.getElementById("chartMapTotal").innerHTML = text;
        document.getElementById("chartTable").innerHTML = tableHTML;

    });
}


function generateAccessCodes()
{
    if (confirm('This action will create (10) more access codes. Are you sure?'))
    {
        // continue
        // console.log('Confirm pressed.');
    } else
    {
        // stop
        // console.log('Cancel action pressed.');
        return;
    }

    $('#activeAccessCodes').val();

    fetch(address + '/generateAccessCodes',
    {
        credentials: "include",
        method: 'POST'
    })
    .then(response => response.json())
    .then((response) =>
    {
        radioCodesClick();
    });
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

    radioOrdersClick();
}