document.addEventListener('DOMContentLoaded', function () 
{
    console.log("DOMContentLoaded");

    // UPDATE PORT, DO NOT FORGET
    fetch(address + '/getMenuData')
        .then(response => response.json())
        .then(data => loadMenuCards(data['data']))
        .then(ready());
});

const address = 'https://www.astromedibles.com';
// const address = 'http://localhost:8080';


function loadMenuCards(data)
{
    try
    {
        if (data.length === 0)
        {
            console.log("data.length === 0");
            return;
        }
    } catch (error)
    {
        console.log(error);
    }

    var myform = $('#myform');
    Array.from(data).forEach(function ({ id, name, price, mg })
    {
        console.log(id + "\t" + name + "\t" + price + "\t" + mg);

        id = parseInt(id);
        price = parseFloat(price);

        let card = "";
        let dataAttributes = ` data-id="${id}"  data-name="${name}"  data-price="${price}"`;
        
        // <div name="card" class="col-md-6 col-xl-3" ${dataAttributes} ">
        card +=
            `
            <div class="col-6 col-md-3 d-flex  text-center">

            <div name="card" class="card  d-flex align-items-start flex-column " ${dataAttributes} style="max-width: 304px" >
                <img class="card-img-top" src="../images/${name.toLowerCase()}.jpg"   alt="...">

                <div class="card-header" style="width: 100%;">
                    <h6 class="card-title"><b>${name}</b></h6>
                </div>

                <div class="card-body">
                    <p class="card-text">Why choose one when you can get three? Enjoy multiple treats!</p>
                </div>

                <div class="card-footer" style="width: 100%;>
                    <h5 class="card-text"><b>$${price.toFixed(2)}</b></h5>
                    <button name="shop-item-button" ${dataAttributes} class="btn btn-primary rounded-pill " type="button" style="width: 100%;">Add to cart</button>
                </div>
            </div>

            </div>
        `;

        myform.append(card);
    });
    console.log("buttons created");

    // create menu buttons
    var removeCartItemButtons = document.getElementsByClassName('btn-danger');
    for (var i = 0; i < removeCartItemButtons.length; i++)
    {
        var button = removeCartItemButtons[i];
        button.addEventListener('click', removeCartItem);
    }

    var quantityInputs = document.getElementsByClassName('cart-quantity-input');
    for (var i = 0; i < quantityInputs.length; i++)
    {
        var input = quantityInputs[i];
        input.addEventListener('change', quantityChanged);
    }

    // console.log("shop-item-button Search Start");
    var addToCartButtons = document.getElementsByName('shop-item-button');
    for (var i = 0; i < addToCartButtons.length; i++)
    {
        console.log("button found!");
        var button = addToCartButtons[i];
        button.addEventListener('click', addToCartClicked);
        console.log("button " + i + " online!");
    }
    console.log("shop-item-button Search End");

}

function loadCartTotal(data)
{
    console.log("function: loadCartTotal() START 12345");

    try
    {
        var cart = data[0].cart.cart[0][1];
        console.log(cart);

        if (data == null)
        {
            console.log("data is undefined or null");
            return;
        }

        var cartQty = document.getElementById('cart-quantity');
        cartQty.dataset.quantity = cart;
        $("#cart-quantity").text(cart);
    }
    catch (error)
    {
        console.log(error);
    }
    console.log("function: loadCartTotal END");
}

function addToCartClicked(event)
{
    console.log("\n" + "addToCartClicked()");
    var button = event.target;
    var id = parseInt(button.dataset.id);
    var title = button.dataset.name;
    var mg = parseInt(button.dataset.mg);
    var price = parseFloat(button.dataset.price);

    // console.log(shopItem.dataAttributes);
    console.log("id:\t" + id);
    console.log("title:\t" + title);
    console.log("mg:\t" + mg);
    console.log("price:\t" + price);

    fetch(address + '/cartAddItem',
        {
            credentials: "include",
            method: 'PATCH',
            headers:
            {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(
                {
                    itemId: id,
                    itemQty: 1
                })
        })
        .then(response => response.json())
        .then((data) => 
        {
            var cart = data['data']['cart'];
            var total = cart[0][1];
            console.log(cart);

            // console.log(cart.data.cart);
            var cartQty = document.getElementById('cart-quantity');
            cartQty.dataset.quantity = total;
            $("#cart-quantity").text(total);


            const message = `(1) ${title} added to cart!`;
            const alerttype = "alert-success";
    
            var iconHTML = '<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:"><use xlink:href="#check-circle-fill"/></svg>';

            var html = 
            `
            <div id="alertNotification" class="alert ${alerttype}  text-center  col-auto" style="margin: 0 auto; align-text: center;" role="alert">
                <span>
                    ${iconHTML}
                    ${message}
                </span>
            </div>
            `;

            // show pop up
            $('#notification').append(html);
            
            setTimeout(function ()
            { // this will automatically close the alert in 2 secs
                $("#alertNotification").remove();
            }, 1000);



            console.log("addToCartClicked complete");
        }).catch((error => 
        {
            console.log("addToCartClicked(event)  catch:" + error);
        }));
}

function ready()
{
    // get cart total
    fetch(address + '/getCartData')
        .then(response => response.json())
        .then(data => loadCartTotal(data['data']));
}