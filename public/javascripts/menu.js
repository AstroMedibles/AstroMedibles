document.addEventListener('DOMContentLoaded', function () 
{
    console.log("DOMContentLoaded");

    // UPDATE PORT, DO NOT FORGET
    fetch(address + '/getMenuData')
        .then(response => response.json())
        .then(data => loadMenuCards(data['data']))
        .then(ready());
});

const address = 'https://astromedibles-rjjul.ondigitalocean.app';
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

        let card = "";
        let dataAttributes = " data-id=" + parseInt(id) + " data-name=" + name + " data-price=" + parseFloat(price) + " data-mg=" + parseInt(mg);
        
        // <div name="card" class="col-md-6 col-xl-3" ${dataAttributes} ">
        card +=
            `
            <div name="card" class="card  col-6  col-sm-4  col-md-3 " ${dataAttributes} style="max-width: 304px" >
                <img class="card-img-top" src="../images/${name.toLowerCase()}.jpg" style="object-fit: contain;"  alt="...">
                <div class="card-body">
                    <h5 class="card-title"><b>${name}</b></h5>
                    <p class="card-text">Why choose one when you can get three? Enjoy multiple treats!</p>
                    <h6 class="card-text"><b>$${price}</b></h6>
                    <button name="shop-item-button" ${dataAttributes} class="btn btn-primary rounded-pill " type="button" style="padding: 0px; width: 100%;">Add to cart</button>
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