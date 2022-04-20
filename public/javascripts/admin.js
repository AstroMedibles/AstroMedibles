document.addEventListener('DOMContentLoaded', function () 
{
    // console.log("DOMContentLoaded");
    ready();
});

const address = 'https://www.astromedibles.com';
// const address = 'http://localhost:8080';
var orders    = null;

var checkDay1 = document.getElementById('checkDay1');
var checkDay2 = document.getElementById('checkDay2');
var checkDay3 = document.getElementById('checkDay3');
var checkDay4 = document.getElementById('checkDay4');
var checkDay5 = document.getElementById('checkDay5');
var checkDay6 = document.getElementById('checkDay6');
var checkDay7 = document.getElementById('checkDay7');

var checkTime1  = document.getElementById('checkTime1');
var checkTime2  = document.getElementById('checkTime2');
var checkTime3  = document.getElementById('checkTime3');
var checkTime4  = document.getElementById('checkTime4');
var checkTime5  = document.getElementById('checkTime5');
var checkTime6  = document.getElementById('checkTime6');
var checkTime7  = document.getElementById('checkTime7');
var checkTime8  = document.getElementById('checkTime8');
var checkTime9  = document.getElementById('checkTime9');
var checkTime10 = document.getElementById('checkTime10');
var checkTime11 = document.getElementById('checkTime11');
var checkTime12 = document.getElementById('checkTime12');
var checkTime13 = document.getElementById('checkTime13');
var checkTime14 = document.getElementById('checkTime14');
var checkTime15 = document.getElementById('checkTime15');
var checkTime16 = document.getElementById('checkTime16');
var checkTime17 = document.getElementById('checkTime17');
var checkTime18 = document.getElementById('checkTime18');
var checkTime19 = document.getElementById('checkTime19');
var checkTime20 = document.getElementById('checkTime20');
var checkTime21 = document.getElementById('checkTime21');
var checkTime22 = document.getElementById('checkTime22');
var checkTime23 = document.getElementById('checkTime23');
var checkTime24 = document.getElementById('checkTime24');


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
        orders = Array.from(data['data']);

        // $('#orders-items').val('');
        document.getElementById("orders-items").innerHTML = '';

        for (let i = 0; i < orders.length; i++)
        {
            // console.log(orders[i]);

            var userOrder = orders[i];

            var status_id    = userOrder.status_id;
            var status       = userOrder.status;
            var order_id     = userOrder.order_id;
            var name         = userOrder.name;
            var email        = userOrder.email;
            var cart         = JSON.parse(userOrder.cart).cart;
            var total        = userOrder.total;
            var date_created = new Date(userOrder.date_created);
            var options =
            {
                hour: '2-digit',
                minute: '2-digit',
                year: "numeric",
                month: "2-digit",
                day: "2-digit"

            };
            var dataAttributes = 
            `data-order_id="${order_id}" data-status_id="${status_id}"  data-status="${status}" data-name="${name}" data-email="${email}" data-total="${total}" data-date_created="${new Date(date_created).toISOString()} "`;

            date_created = date_created.toLocaleString('en-us', options);

            // Payment Required - Order will not be made until this is paid.
            // Preparing Order - Order is in queue to be baked.
            // Ready for Pickup - Order has been made, and waiting for pickup.
            // Complete - Order has been delivered.


            var statusText = status;
            var dropDownButton = '';

            if (statusText === 'Payment Required')
            {
                dropDownButton = 
                `
                <button  id="selected-${order_id}" class="btn btn-danger btn-sm dropdown-toggle rounded-pill w-100" aria-expanded="false" data-bs-toggle="dropdown" type="button" style="max-width: 225px;" >${statusText}</button>
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
                <button  id="selected-${order_id}" class="btn btn-primary btn-sm dropdown-toggle rounded-pill w-100" aria-expanded="false" data-bs-toggle="dropdown" type="button" style="max-width: 225px;" >${statusText}</button>
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
                <button  id="selected-${order_id}" class="btn btn-warning btn-sm dropdown-toggle rounded-pill w-100" aria-expanded="false" data-bs-toggle="dropdown" type="button" style="max-width: 225px;" >${statusText}</button>
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
                <button  id="selected-${order_id}" class="btn btn-success btn-sm dropdown-toggle rounded-pill w-100" aria-expanded="false" data-bs-toggle="dropdown" type="button" style="max-width: 225px;" >${statusText}</button>
                `;
                status = 
                `
                <button class="dropdown-item disabled">Payment Required</button>
                <button class="dropdown-item disabled">Preparing Order</button>
                <button class="dropdown-item disabled">Ready for Pickup</button>
                <button class="dropdown-item disabled">Complete</button>
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
                <div class="row product-image d-flex justify-content-between align-items-start" ${dataAttributes} >

                    <div class="col-md-4 product-info">
                        <div class="product-specs d-flex flex-column  align-items-center">
                            <div class="w-100" style="padding: 0px 0px 15px 0px; text-align: center;">
                                <span>Status</span>
                                <br>
                                <div class="dropdown w-100" >
                                    ${dropDownButton}
                                    <div class="dropdown-menu w-100" name="${order_id}">
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
                                <span>Date Created</span>
                                <br>
                                <span class="value">${date_created}</span>
                            </div>


                            <div style="padding: 0px 0px 15px 0px; text-align: center;">
                                <span>Name</span>
                                <br>
                                <span class="value">${name}</span>
                            </div>

                            <div style="padding: 0px 0px 15px 0px; text-align: center;">
                            <span>Email</span>
                            <br>
                            <span class="value">${email}</span>
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
        console.log('orders.length');
        console.log(orders.length.toString());
        $('#inputSearchLabel').text(`(${orders.length.toString()})`);
    });
}

function searchOrderClick(event)
{
    // Filter results
    document.getElementById("orders-items").innerHTML = '';

    var searchText = $('#inputSearchOrders').val().trim().toLowerCase();
    var counter = 0;

    for (let i = 0; i < orders.length; i++)
    {
        

        var userOrder = orders[i];

        var status_id    = userOrder.status_id.toString();
        var status       = userOrder.status.toString();
        var order_id     = userOrder.order_id.toString();
        var name         = userOrder.name.toString();
        var email        = userOrder.email.toString();
        var cart         = JSON.parse(userOrder.cart).cart;
        var total        = userOrder.total;
        var date_created = new Date(userOrder.date_created);

        if (!status_id.toLowerCase().includes(searchText) && !status.toLowerCase().includes(searchText) 
        &&  !order_id.toLowerCase().includes(searchText)  && !name.toLowerCase().includes(searchText)   
        &&  !email.toLowerCase().includes(searchText))
        {
            console.log('TRUE THO');
            continue;
        }
        else
        {
            counter += 1;
        }

        var options =
        {
            hour: '2-digit',
            minute: '2-digit',
            year: "numeric",
            month: "2-digit",
            day: "2-digit"

        };
        var dataAttributes = 
        `data-order_id="${order_id}" data-status_id="${status_id}"  data-status="${status}" data-name="${name}" data-email="${email}" data-total="${total}" data-date_created="${new Date(date_created).toISOString()} "`;

        date_created = date_created.toLocaleString('en-us', options);

        // Payment Required - Order will not be made until this is paid.
        // Preparing Order - Order is in queue to be baked.
        // Ready for Pickup - Order has been made, and waiting for pickup.
        // Complete - Order has been delivered.


        var statusText = status;
        var dropDownButton = '';

        if (statusText === 'Payment Required')
        {
            dropDownButton = 
            `
            <button  id="selected-${order_id}" class="btn btn-danger btn-sm dropdown-toggle rounded-pill w-100" aria-expanded="false" data-bs-toggle="dropdown" type="button" style="max-width: 225px;" >${statusText}</button>
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
            <button  id="selected-${order_id}" class="btn btn-primary btn-sm dropdown-toggle rounded-pill w-100" aria-expanded="false" data-bs-toggle="dropdown" type="button" style="max-width: 225px;" >${statusText}</button>
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
            <button  id="selected-${order_id}" class="btn btn-warning btn-sm dropdown-toggle rounded-pill w-100" aria-expanded="false" data-bs-toggle="dropdown" type="button" style="max-width: 225px;" >${statusText}</button>
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
            <button  id="selected-${order_id}" class="btn btn-success btn-sm dropdown-toggle rounded-pill w-100" aria-expanded="false" data-bs-toggle="dropdown" type="button" style="max-width: 225px;" >${statusText}</button>
            `;
            status = 
            `
            <button class="dropdown-item disabled">Payment Required</button>
            <button class="dropdown-item disabled">Preparing Order</button>
            <button class="dropdown-item disabled">Ready for Pickup</button>
            <button class="dropdown-item disabled">Complete</button>
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
            <div class="row product-image d-flex justify-content-between align-items-start" ${dataAttributes} >

                <div class="col-md-4 product-info">
                    <div class="product-specs d-flex flex-column  align-items-center">
                        <div class="w-100" style="padding: 0px 0px 15px 0px; text-align: center;">
                            <span>Status</span>
                            <br>
                            <div class="dropdown w-100" >
                                ${dropDownButton}
                                <div class="dropdown-menu w-100" name="${order_id}">
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
                            <span>Date Created</span>
                            <br>
                            <span class="value">${date_created}</span>
                        </div>


                        <div style="padding: 0px 0px 15px 0px; text-align: center;">
                            <span>Name</span>
                            <br>
                            <span class="value">${name}</span>
                        </div>

                        <div style="padding: 0px 0px 15px 0px; text-align: center;">
                        <span>Email</span>
                        <br>
                        <span class="value">${email}</span>
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
    $('#inputSearchLabel').text(`(${counter})`);
}

function dropDownUpdateOrderStatus(event)
{
    // console.log('start dropDownUpdateOrderStatus(event)');

    event = event.currentTarget;
    var parentDiv   = event.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
    var orderId     = $(parentDiv).attr("data-order_id");
    var email       = $(parentDiv).attr("data-email");
    var status_id   = null;
    // var status_id   = $(parentDiv).attr("data-status_id");
    // console.log(orderId);

    var newSelectedStatus = $(event).attr("name");
    console.log('attr name: ' + newSelectedStatus);
    // console.log('attr data-status_id: ' + status_id);


    var dropDownSubElementID = $(`#selected-${orderId}`); 
    // console.log(dropDownSubElementID);



    if (confirm('Are you sure you want to update this order status?\nThis user will be notified.\nThis action cannot be undone'))
    {
        // 
        // console.log('Update order pressed.');
    } 
    else
    {
        // 
        // console.log('Cancel action pressed.');
        return;
    }

    // $(dropDownSubElementID).text(status);

    // console.log("status.includes('complete')");
    // console.log(status.includes('complete'));

    if (newSelectedStatus === 'Preparing Order')
    {
        status_id = 2;
    } 
    else if (newSelectedStatus === 'Ready for Pickup')
    {
        status_id = 3;
    } 
    else if (newSelectedStatus === 'Complete')
    {
        status_id = 4;
    }

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
                orderId:    orderId,
                status_id:  status_id,
                status:     newSelectedStatus,
                email:      email
            })
    })
    .then(response => response.json())
    .then((data) => 
    {
        // Update Status to new option
        $(dropDownSubElementID).text(newSelectedStatus);

        // disable used option
        $(event).addClass("disabled");
        $(event).on(('onClick'), null);

        // console.log('Status check: ' + status);

        // console.log("status.includes('complete')");
        // console.log(status.includes('complete'));

        console.log('New Status ID: ' + status_id);

        // if 'Preparing Order'
        if (status_id === 2)
        {
            // console.log(1);
            dropDownSubElementID.removeClass("btn-danger");
            dropDownSubElementID.addClass("btn-primary");
        }
        // if 'Ready for Pickup'
        else if (status_id === 3)
        {
            // console.log(2);
            dropDownSubElementID.removeClass("btn-danger");
            dropDownSubElementID.removeClass("btn-primary");
            dropDownSubElementID.addClass("btn-warning");
        }
        // if 'Complete'
        else if (status_id === 4)
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

    $('#orders-items-outer').removeAttr('hidden');


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
    $('#orders-items-outer').attr('hidden', '');
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

function radioChartClick()
{
    // console.log('radioChartClick()');
    // hide other divs, reveal chart div
    $('#codes-items').attr('hidden', '');
    $('#orders-items-outer').attr('hidden', '');
    $('#pickups-items').attr('hidden', '');

    $('#chart-items').removeAttr('hidden');


    // set radioChart active
    document.getElementById("radioChart").classList.add("active");

    document.getElementById("radioOrders").classList.remove("active");
    document.getElementById("radioCodes").classList.remove("active");
    document.getElementById("radioPickups").classList.remove("active");

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

            var statusText      = userOrder.status;
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

            tableHTML +=
                    `
                    <tr style="font-size: small;">
                        <th scope="row" style="font-weight: normal;">${value.name}</th>
                        <td class="table-danger"  >${quantityRequired}</td>
                        <td class="table-primary" >${quantityRecieved}</td>
                        <td style="font-weight: bold;">${value.quantity}</td>
                    </tr>
                    `;

        }
        // $('#chartMapTotal').val(text);
        // document.getElementById("chartMapTotal").innerHTML = text;
        document.getElementById("chartTable").innerHTML = tableHTML;

    });
}

function radioPickupsClick()
{
    // console.log('radioChartClick()');
    // hide other divs, reveal chart div
    $('#codes-items').attr('hidden', '');
    $('#orders-items-outer').attr('hidden', '');
    $('#chart-items').attr('hidden', '');


    $('#pickups-items').removeAttr('hidden');


    // set radioChart active
    document.getElementById("radioPickups").classList.add("active");

    document.getElementById("radioOrders").classList.remove("active");
    document.getElementById("radioCodes").classList.remove("active");
    document.getElementById("radioChart").classList.remove("active");

    // console.log('/adminGetUserPickups');

    var tableHTML = '';

    fetch(address + '/adminGetUserPickups')
    .then(response => response.json())
    .then(data =>  
    {
        var pickups  = Array.from(data['data']);
        var lastYear = '';
        var lastDate = new Date();
        var b = 1;

        for (var i = 0; i < pickups.length; i++)
        {
            b = 1;
            // console.log(pickups[i]);
            var date = new Date(pickups[i].date);

            var localeTimeStr = date.toLocaleTimeString().toString();
            var time = localeTimeStr.substring(0, localeTimeStr.lastIndexOf(':')) + localeTimeStr.substring(localeTimeStr.lastIndexOf(':') + 3) 


            var options = { weekday: 'long', month: 'long', day: 'numeric'};
            var dateLocaleString = date.toLocaleString('en-US', options) + getOrdinalSuffix(date);
            
            // Sunday, November 14th
            if (lastYear != date.getFullYear())
            {
                tableHTML +=
                `
                <tr>
                    <th class="table" style="width: 40%;" >${date.getFullYear()}</th>
                    <th class="table" style="width: 20%;" ></th>
                    <th class="table" style="width: 20%;" ></th>
                    <th class="table" style="width: 20%;" ></th>
                </tr>
                `;
                lastYear = date.getFullYear();
            }

            var isSameDay =   (lastDate.getDate()     === date.getDate() 
            && lastDate.getMonth()    === date.getMonth()
            && lastDate.getFullYear() === date.getFullYear());

            // console.log(`${lastDate} - ${dateLocaleString}`);
            if (!isSameDay)
            {
                tableHTML +=
                `
                <!-- Date -->
                <tr>
                    <th class="table" style="width: 40%;" >${dateLocaleString}</th>
                    <th class="table" style="width: 20%;" ></th>
                    <th class="table" style="width: 20%;" ></th>
                    <th class="table" style="width: 20%;" ></th>
                </tr>
                `;
                lastDate = date;
                b = 0;
            }

            var timeString = time;
            // if (b == 1 || lastDate == dateLocaleString)


            var isSameTime =   (lastDate.getHours()     === date.getHours() 
                             && lastDate.getMinutes() === date.getMinutes());


            // console.log('\nlastDate')
            // console.log(lastDate.getHours());
            // console.log(lastDate.getMinutes());

            // console.log('date')
            // console.log(date.getHours());
            // console.log(date.getMinutes());

            // console.log('time')
            // console.log(time);

            // console.log('timeString')
            // console.log(timeString);

            if (isSameDay && isSameTime)
            {
                timeString = '';
            }
            else
            {
                lastDate = date;
            }
            

            tableHTML +=
            `
            <!-- Time, Name, Order ID, Location -->
            <tr style="font-size: small;">
                <td class="table" style="width: 40%;" >${timeString}</td>
                <td class="table" style="width: 20%;" >${pickups[i].name}</td>
                <td class="table" style="width: 20%;" >${pickups[i].order_id}</td>
                <td class="table" style="width: 20%;" >${pickups[i].pickup_location}</td>
            </tr>
            `
        }
        document.getElementById("tablePickups").innerHTML = tableHTML;
    });

    // console.log('we made it');

    fetch(address + '/getPickupAvailabilityDays')
    .then(response => response.json())
    .then(data =>  
    {
        var checkData = Array.from(data['data']);
        var checks = [checkDay1, checkDay2, checkDay3, checkDay4, checkDay5, checkDay6, checkDay7];

        for (let i = 0; i < checkData.length; i++)
        {
            // console.log(checkData[i]);
            if (checkData[i] == 1)
            {
                checks[i].parentNode.setAttribute("style","font-weight: bold");
                checks[i].checked = true;
            }
        }

    });

    fetch(address + '/getPickupAvailabilityTimes')
    .then(response => response.json())
    .then(data =>  
    {
        var checkData = Array.from(data['data']);
        var checks = 
        [   checkTime1,  checkTime2,  checkTime3,  checkTime4,
            checkTime5,  checkTime6,  checkTime7,  checkTime8,
            checkTime9,  checkTime10, checkTime11, checkTime12,
            checkTime13, checkTime14, checkTime15, checkTime16,
            checkTime17, checkTime18, checkTime19, checkTime20,
            checkTime21, checkTime22, checkTime23, checkTime24
        ];
        for (let i = 0; i < checkData.length; i++)
        {
            // console.log(checkData[i]);
            if (checkData[i] == 1)
            {
                // console.log(3000);
                checks[i].parentNode.setAttribute("style","font-weight: bold");
                checks[i].checked = true;
            }
        }
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

function getOrdinalSuffix(dt)
{
    return (dt.getDate() % 10 == 1 && dt.getDate() != 11 ? 'st' : (dt.getDate() % 10 == 2 && dt.getDate() != 12 ? 'nd' : (dt.getDate() % 10 == 3 && dt.getDate() != 13 ? 'rd' : 'th'))); 
}

function updateDaysSchedule(event)
{
    // console.log("\n" + "updateDaysSchedule(event)");

    if (confirm('Update Days Schedule?'))
    {
        // 
        // console.log('Update order pressed.');
    } else
    {
        // 
        // console.log('Cancel action pressed.');
        return;
    }

    var checks = [checkDay1.checked, checkDay2.checked, checkDay3.checked, checkDay4.checked, checkDay5.checked, checkDay6.checked, checkDay7.checked];
    // console.log(checks);
   
    fetch(address + '/adminSetPickupsDays',
    {
        credentials: "include",
        method: 'PATCH',
        headers:
        {
            'Content-type': 'application/json'
        },
        body: JSON.stringify
            ({
                available: checks
            })
    })
    .then(response => response.json())
    .then((data) => 
    {
        // console.log(123456);
        checks = [checkDay1, checkDay2, checkDay3, checkDay4, checkDay5, checkDay6, checkDay7];
        checks.forEach(element =>
            {
                if (element.checked == true)
                {
                    element.parentNode.setAttribute("style","font-weight: bold");
                }
                else
                {
                    element.parentNode.setAttribute("style","font-weight: normal");
                }
                // element.checked = false;
            });


        // console.log("updateDaysSchedule complete");
        // Update Summary
    }).catch((error => 
    {
        console.log("updateDaysSchedule(event)  catch:" + error);
    }));
}

function updateTimesSchedule(event)
{
    // console.log("\n" + "updateTimesSchedule(event)");

    if (confirm('Update Times Schedule?'))
    {
        // console.log('Update order pressed.');
    } else
    {
        // console.log('Cancel action pressed.');
        return;
    }

    var checks = 
    [   checkTime1.checked,  checkTime2.checked,  checkTime3.checked, checkTime4.checked,
        checkTime5.checked,  checkTime6.checked,  checkTime7.checked, checkTime8.checked,
        checkTime9.checked,  checkTime10.checked, checkTime11.checked,checkTime12.checked,
        checkTime13.checked, checkTime14.checked, checkTime15.checked,checkTime16.checked,
        checkTime17.checked, checkTime18.checked, checkTime19.checked,checkTime20.checked,
        checkTime21.checked, checkTime22.checked, checkTime23.checked,checkTime24.checked
    ];
    // console.log(checks);
   
    fetch(address + '/adminSetPickupsTimes',
    {
        credentials: "include",
        method: 'PATCH',
        headers:
        {
            'Content-type': 'application/json'
        },
        body: JSON.stringify
            ({
                available: checks
            })
    })
    .then(response => response.json())
    .then((data) => 
    {
        checks = 
        [   checkTime1,  checkTime2, checkTime3, checkTime4,
            checkTime5,  checkTime6, checkTime7, checkTime8,
            checkTime9,  checkTime8, checkTime9, checkTime10,
            checkTime11, checkTime12, checkTime13, checkTime14,
            checkTime15, checkTime16, checkTime17, checkTime18,
            checkTime19, checkTime20, checkTime21, checkTime22,
            checkTime23, checkTime24
        ];


        checks.forEach(element =>
            {
                if (element.checked == true)
                {
                    element.parentNode.setAttribute("style","font-weight: bold");
                }
                else
                {
                    element.parentNode.setAttribute("style","font-weight: normal");
                }
                // element.checked = false;
            });


        // console.log("updateTimesSchedule complete");
        // Update Summary
    }).catch((error => 
    {
        // console.log("updateTimesSchedule(event)  catch:" + error);
    }));
}

function ready()
{
    try 
    {
        // get cart total
        fetch(address + '/getCartData')
        .then(response => response.json())
        .then(data => 
        {
            loadCartTotal(data['data']);
        });
    } catch (error)
    {
        // console.log(error);
    }
    
    try
    {
        radioOrdersClick();
    } catch (error)
    {
        // console.log(error);
    }
}