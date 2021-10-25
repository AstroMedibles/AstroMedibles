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
        var cart = data[0].cart.cart[0][1];
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

        // load cards from cart
        getCartDetails(data[0].cart.cart);

    }
    catch (error)
    {
        console.log(error);
    }
    // console.log("function: loadCartTotal END");
}

function getCartDetails(userCart)
{

    fetch(address + '/getMenuData')
        .then(response => response.json())
        .then(data =>  
        {
            var menuItems = Array.from(data['data']);
            var subtotal = discount = shipping = total = 0;

            for (let i = 0; i < userCart.length; i++)
            {
                var element = userCart[i];

                // for each menu item

                Array.from(menuItems).forEach(function ({ id, name, price, mg })
                {
                    // console.log("id + name + price + mg");

                    const userCartItemID = element[0];
                    const userCartItemQTY = element[1];

                    // console.log(userCartItemID + " = " + id);
                    if (userCartItemID == id)
                    {
                        // console.log("MATCH userCartItemID == id");
                        // console.log( id + "\t" + name + "\t" + price + "\t" + mg);

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
                                <div class="col-md-3">
                                    <div class="product-image"><img class="img-fluid d-block mx-auto image" src="../images/${name.toLowerCase()}.jpg"></div>
                                </div>
                                <div class="col-md-4 product-info"><h2 class="product-name" >${name}</h2>
                                    <div class="product-specs">
                                        <div><span>Price:&nbsp;</span><span class="value">${price}</span></div>
                                        <div><span>Mg:   &nbsp;</span><span class="value">${mg}</span></div>
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
    console.log("\n" + "subtractItem(event)");

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
            console.log("cartRemoveItem.then");
            var cart = data['data']['cart'];
            var total = cart[0][1];

            // Update cart total on Navbar
            var cartQty = document.getElementById('cart-quantity');
            cartQty.dataset.quantity = total;
            $("#cart-quantity").text(total);

            // Update item Qty within Card

            console.log(cart);
            let matchFound = false;
            let labelName = "labelqty" + id;
            const cardSubtotalLabel = "#card-subtotal-" + id;



            for (let i = 0; i < cart.length; i++)
            {
                console.log("id == cart[i][0]: " + id + " _ " + cart[i][0] + " i: " + i);
                if (id == cart[i][0])
                {
                    console.log("MATCH");
                    matchFound = true;
                    var itemQty = cart[i][1];
                    console.log("itemQty: " + itemQty);



                    console.log("id: " + id);
                    console.log("labelName: " + labelName);
                    console.log("itemQty: " + itemQty);


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
    console.log("\n" + "cartAddItem(event)");

    // grab item attributes, id, name, qty
    var parentDiv = event.currentTarget.parentNode;
    var id = parseInt(parentDiv.getAttribute('data-itemid'));
    var name = parentDiv.getAttribute('data-itemname');
    var qty = parentDiv.getAttribute('data-itemqty');
    var price = parentDiv.getAttribute('data-itemprice');
    console.log("Name: " + name);
    console.log("ID: " + id);
    console.log("QTY: " + qty);

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
            console.log(cart);
            let labelName = "labelqty" + id;
            const cardSubtotalLabel = "#card-subtotal-" + id;

            for (let i = 0; i < cart.length; i++)
            {
                console.log("id == cart[i][0]: " + id + " _ " + cart[i][0] + " i: " + i);
                if (id == cart[i][0])
                {
                    console.log("MATCH");
                    var itemQty = cart[i][1];
                    console.log("itemQty: " + itemQty);
                    console.log("id: " + id);
                    console.log("labelName: " + labelName);
                    console.log("itemQty: " + itemQty);


                    // Update card dataset QTY
                    parentDiv.setAttribute("data-itemqty", itemQty);
                    document.getElementById(labelName).value = itemQty;


                    // Update card subtotal
                    const cardSubtotalValue = "$" + (itemQty * price).toFixed(2);
                    $(cardSubtotalLabel).text(cardSubtotalValue);
                }
            }

            console.log("addItem complete");
            // Update Summary
            updateSummary(cart);
        }).catch((error => 
        {
            console.log("addItem(event)  catch:" + error);
        }));
}

function updateSummary(cart)
{
    console.log("updateSummary(cart) START");
    let shipping = 0;
    let discount = 0;
    let total = 0;
    let subtotal = 0;
    console.log("cart");
    console.log(cart);
    for (let i = 1; i < cart.length; i++)
    {
        console.log("Searching for " + "card-" + cart[i][0]);
        console.log();
        const userCartElement = document.getElementById("card-" + cart[i][0]);
        var id = userCartElement.getAttribute('data-itemid');
        var name = userCartElement.getAttribute('data-itemname');
        var qty = userCartElement.getAttribute('data-itemqty');
        var price = userCartElement.getAttribute('data-itemprice');
        subtotal += qty * price;
    }

    total = subtotal - discount - shipping;

    console.log(subtotal);
    console.log(discount);
    console.log(shipping);
    console.log(total);


    // Update summary
    $("#summary-subtotal").text("$" + parseFloat(subtotal).toFixed(2));
    $("#summary-discount").text("$" + parseFloat(discount).toFixed(2));
    $("#summary-shipping").text("$" + parseFloat(shipping).toFixed(2));
    $("#summary-total").text("$" + parseFloat(total).toFixed(2));
    console.log("updateSummary(cart) END");
}

function userPlaceOrder()
{
    console.log(1000);
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
        // problem: this happens even if an order didnt go through...
        console.log(2000);
        const message = "Thank you! Your order has been placed!";
        const alerttype = "alert-success";

        // show pop up
        $('#textPlaceOrder').append('<div id="alertdiv" class="alert ' + alerttype + '"><a class="close" data-dismiss="alert"></a><span>' + message + '</span></div>')

        setTimeout(function ()
        { // this will automatically close the alert and remove this if the users doesnt close it in 5 secs
            //   $("#alertdiv").remove();
            // This Thank you redirect causes error :(
            window.location.href = 'ThankYou';
        }, 3000);
    })
    .catch((error) =>
    {
        console.log(error);
    })
    ;
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
}