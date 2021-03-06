
document.addEventListener('DOMContentLoaded', function () 
{
    // console.log("DOMContentLoaded");
    ready();
});

var address = 'https://www.astromedibles.com';
// var address = 'http://localhost:8080';


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

        // navbar
        var cartQty = document.getElementById('cart-quantity');
        cartQty.dataset.quantity = cart;
        $("#cart-quantity").text(cart);

        if (parseInt(cart) > 0)
        {
            $('buttonPlaceOrder').removeClass('disabled');
        }

        // load cards from cart
        getCartDetails(data.cart.cart);

    }
    catch (error)
    {
        console.log(error);
    }
    // console.log("function: loadCartTotal END");
}

function getCartDetails(userCart)
{
    fetch(address + '/get_menu')
    .then(response => response.json())
    .then(data =>  
    {
        var menuItems = Array.from(data['data']);
        var subtotal = discount = shipping = total = 0;

        for (let i = 0; i < userCart.length; i++)
        {
            var element = userCart[i];

            // for each menu item

            Array.from(menuItems).forEach(function ({ id, name, price, description })
            {
                // console.log("id + name + price + description");

                const userCartItemID = element[0];
                const userCartItemQTY = element[1];

                // console.log(userCartItemID + " = " + id);
                if (userCartItemID == id)
                {
                    // console.log("MATCH userCartItemID == id");
                    // console.log( id + "\t" + name + "\t" + price + "\t" + description);

                    let card = "";

                    let dropDownValue = "";
                    dropDownValue += "<a class=\"dropdown-item\" href=\"#\">" + "0 (delete)" + "</a>";
                    for (let index = 1; index < 11; index++)
                    {
                        dropDownValue += "<a class=\"dropdown-item\" href=\"#\">" + index + "</a>";
                    }
                    dropDownValue += "<a class=\"dropdown-item\" href=\"#\">" + "25" + "</a>";
                    dropDownValue += "<a class=\"dropdown-item\" href=\"#\">" + "50" + "</a>";



                    // create element in shopping cart
                    card +=
                        `
                    <div class="product">
                        <div class="row justify-content-center align-items-center">
                         
                        <!-- <div class="col-md-3">
                                 <div class="product-image"><img class="img-fluid d-block mx-auto image" src="../images/${name}.jpg"></div> 
                            </div> -->
                            <div class="col-md-4 product-info"><h2 class="product-name" >${name}</h2>
                                <div class="product-specs">
                                    <div><span>Price:&nbsp;</span><span class="value">$${price.toFixed(2)}</span></div>
                                    <div><span class="value">${description}</span></div>
                                </div>
                            </div>
                            <div class="col-md-3 d-flex flex-row flex-grow-1 justify-content-between align-items-end flex-md-column flex-md-fill price" >
                                <div class="d-flex flex-row" id="card-${userCartItemID}"  data-itemname="${name}" data-itemid="${userCartItemID}" data-itemprice="${price}"  data-itemqty="${userCartItemQTY}" >
                                    <button class="btn btn-primary   " type="button" style="width: 35px;" onclick="subtractItem(event)">-</button>
                                    <input type="text" value="${userCartItemQTY}"  readonly=""   style=" width: 40px; text-align: center; border-width:0px;  border:none;  outline:none!important; margin: 0px 0px 4px 4px;"  id="labelqty${userCartItemID}" value="${userCartItemQTY}">
                                    <button class="btn btn-primary   " type="button" style="width: 35px;" onclick="addItem(event)">+</button>
                                </div>
                                <div class="d-flex flex-row"><span id="card-subtotal-${userCartItemID}">$${(userCartItemQTY * price).toFixed(2)}</span></div>
                            </div>
                        </div>
                    </div>
                        `;

                    // create card
                    var myform = $('#cart-items');
                    myform.append(card);
                    // add to subtotal
                    subtotal += (userCartItemQTY * price);

                }
            });
        }
        // Update Summary: Subtotal, discount, shipping, total
        // total = subtotal - discount - shipping;
        // $("#cart-subtotal").text("$" + parseFloat(subtotal).toFixed(2));
        // $("#cart-total").text("$" + parseFloat(total).toFixed(2));
        updateSummary(userCart);

    });
}

function subtractItem(event)
{
    // console.log("\n" + "subtractItem(event)");

    // grab item attributes, id, name, qty
    var parentDiv = event.currentTarget.parentNode;
    var id = parseInt(parentDiv.getAttribute('data-itemid'));
    var name = parentDiv.getAttribute('data-itemname');
    var qty = parentDiv.getAttribute('data-itemqty');
    var price = parentDiv.getAttribute('data-itemprice');

    // console.log("Name: " + name);
    // console.log("ID: " + id);
    // console.log("QTY: " + qty);

    // use itemId to remove "1" qty from cart
    fetch(address + '/cartSubtractItem',
        {
            credentials: "include",
            method: 'PATCH',
            headers:
            {
                'Content-type': 'application/json'
            },
            body: JSON.stringify
                ({
                    itemId: id,
                    itemQty: 1
                })
        })
        .then(response => response.json())
        .then((data) => 
        {
            // console.log("cartRemoveItem.then");
            var cart = data['data']['cart'];
            var total = cart[0][1];

            // Update cart total on Navbar
            var cartQty = document.getElementById('cart-quantity');
            cartQty.dataset.quantity = total;
            $("#cart-quantity").text(total);

            // Update item Qty within Card

            // console.log(cart);
            let matchFound = false;
            let labelName = "labelqty" + id;
            const cardSubtotalLabel = "#card-subtotal-" + id;



            for (let i = 0; i < cart.length; i++)
            {
                // console.log("id == cart[i][0]: " + id + " _ " + cart[i][0] + " i: " + i);
                if (id == cart[i][0])
                {
                    // console.log("MATCH");
                    matchFound = true;
                    var itemQty = cart[i][1];
                    // console.log("itemQty: " + itemQty);
                    
                    // console.log("id: " + id);
                    // console.log("labelName: " + labelName);
                    // console.log("itemQty: " + itemQty);


                    // Update card dataset QTY
                    parentDiv.setAttribute("data-itemqty", itemQty);
                    document.getElementById(labelName).value = itemQty;


                    // Update card subtotal
                    const cardSubtotalValue = "$" + (itemQty * price).toFixed(2);
                    $(cardSubtotalLabel).text(cardSubtotalValue);
                }
            }


            // Handle what happens if product goes to 0 QTY
            if (matchFound == false)
            {
                // Update card dataset QTY
                parentDiv.setAttribute("data-itemqty", 0);
                document.getElementById(labelName).value = 0;

                // Update card subtotal
                $(cardSubtotalLabel).text("$" + (0).toFixed(2));
            }

            // Update Summary
            updateSummary(cart);
            // console.log("cartRemoveItem complete");
        }).catch((error => 
        {
            console.log("subtractItem(event)  catch:" + error);
        }));
}

function addItem(event)
{
    // console.log("\n" + "cartAddItem(event)");

    // grab item attributes, id, name, qty
    var parentDiv = event.currentTarget.parentNode;
    var id = parseInt(parentDiv.getAttribute('data-itemid'));
    var name = parentDiv.getAttribute('data-itemname');
    var qty = parentDiv.getAttribute('data-itemqty');
    var price = parentDiv.getAttribute('data-itemprice');
    // console.log("Name: " + name);
    // console.log("ID: " + id);
    // console.log("QTY: " + qty);

    // use itemId to remove "1" qty from cart
    fetch(address + '/cartAddItem',
        {
            credentials: "include",
            method: 'PATCH',
            headers:
            {
                'Content-type': 'application/json'
            },
            body: JSON.stringify
                ({
                    itemId: id,
                    itemQty: 1
                })
        })
        .then(response => response.json())
        .then((data) => 
        {
            var cart = data['data']['cart'];
            var total = cart[0][1];

            // Update cart total on Navbar
            var cartQty = document.getElementById('cart-quantity');
            cartQty.dataset.quantity = total;
            $("#cart-quantity").text(total);

            // Update item Qty within Card
            // console.log(cart);
            let labelName = "labelqty" + id;
            const cardSubtotalLabel = "#card-subtotal-" + id;

            for (let i = 0; i < cart.length; i++)
            {
                // console.log("id == cart[i][0]: " + id + " _ " + cart[i][0] + " i: " + i);
                if (id == cart[i][0])
                {
                    // console.log("MATCH");
                    var itemQty = cart[i][1];
                    // console.log("itemQty: " + itemQty);
                    // console.log("id: " + id);
                    // console.log("labelName: " + labelName);
                    // console.log("itemQty: " + itemQty);


                    // Update card dataset QTY
                    parentDiv.setAttribute("data-itemqty", itemQty);
                    document.getElementById(labelName).value = itemQty;


                    // Update card subtotal
                    const cardSubtotalValue = "$" + (itemQty * price).toFixed(2);
                    $(cardSubtotalLabel).text(cardSubtotalValue);
                }
            }

            // console.log("addItem complete");
            // Update Summary
            updateSummary(cart);
        }).catch((error => 
        {
            console.log("addItem(event)  catch:" + error);
        }));
}

function updateSummary(cart)
{
    // console.log("updateSummary(cart) START");
    let shipping = 0;
    let discount = 0;
    let total = 0;
    let subtotal = 0;
    // console.log("cart");
    // console.log(cart);
    for (let i = 1; i < cart.length; i++)
    {
        // console.log("Searching for " + "card-" + cart[i][0]);
        // console.log();
        const userCartElement = document.getElementById("card-" + cart[i][0]);
        var id = userCartElement.getAttribute('data-itemid');
        var name = userCartElement.getAttribute('data-itemname');
        var qty = userCartElement.getAttribute('data-itemqty');
        var price = userCartElement.getAttribute('data-itemprice');
        subtotal += qty * price;
    }

    total = subtotal - discount - shipping;

    // console.log(subtotal);
    // console.log(discount);
    // console.log(shipping);
    // console.log(total);


    if (parseFloat(subtotal) > 0)
    {
        $('#pMessage').text('Place your order!');
        document.getElementById("buttonPlaceOrder").classList.remove("disabled");
    }
    else
    {
        document.getElementById("buttonPlaceOrder").classList.add("disabled");
    }
    // Update summary
    $("#summary-subtotal").text("$" + parseFloat(subtotal).toFixed(2));
    $("#summary-discount").text("$" + parseFloat(discount).toFixed(2));
    $("#summary-shipping").text("$" + parseFloat(shipping).toFixed(2));
    $("#summary-total").text("$" + parseFloat(total).toFixed(2));
    // console.log("updateSummary(cart) END");
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
        // Order placed successfully
        document.getElementById("buttonPlaceOrder").classList.add("disabled");

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

function alertNotify(message, alertType, iconChoice, duration)
{
    if (iconChoice == 1)      // ???
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

// check every ten seconds
// if user does not have items in their cart, send them to /menu
function checkCart()
{
    // console.log('working');
    fetch(address + '/getUserData')
    .then(response => response.json())
    .then(data => 
    {
        try
        {
            var cart = data['data'].cart.cart[0][1];
            console.log(cart);

            if (parseInt(cart) <= 0)
            {
                window.location.replace(address + "/menu");
            }
        }
        catch (error)
        {
            console.log(error);
            window.location.replace(address + "/menu");
        }
    });
    // console.log("function: loadCartTotal(data)");
    setTimeout(checkCart, 10000);
}

function ready()
{
    // get cart total
    fetch(address + '/getUserData')
    .then(response => response.json())
    .then(data => 
    {
        // console.log('working1');
        loadCartTotal(data['data']);
        checkCart();
        // console.log('working2');
    });
}
