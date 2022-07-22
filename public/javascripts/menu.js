var address = 'https://www.astromedibles.com';
// var address = 'http://localhost:8080';


document.addEventListener('DOMContentLoaded', function () 
{
    // load user data
    fetch(address + '/getUserData')
        .then(response => response.json())
        .then(data => loadCartTotal(data['data']))
        .then(() => 
        {
            // load menu data
            fetch(address + '/get_menu')
            .then(response => response.json())
            .then(data => loadMenuCards(data['data']));
        });
});



function loadMenuCards(data)
{
    try
    {
        if (data.length == 0)
        {
            // console.log("data.length == 0");
            return;
        }
    } catch (error)
    {
        console.log(error);
    }

    var myform = $('#myform');
    // Array.from(data).forEach(function ({ id, name, price, description, stock })
    Array.from(data).forEach(function ({ id, name, price, description})
    {
        // console.log(id + "\t" + name + "\t" + price + "\t" + description);

        id = parseInt(id);
        price = parseFloat(price);

        let card = "";
        let dataAttributes = ` data-id="${id}"  data-name="${name}"  data-price="${price}"`;
        

        // <div name="card" class="card  d-flex align-items-start flex-column " ${dataAttributes} style="max-width: 304px" >
        // <img class="card-img-top" src="../images/${name}.jpg"  alt="...">


        // <div class="card-body" style="font-size: 0.75em; width: 100%;">
        //     <p class="card-text">${description}</p>
        // </div>

        card +=
            `
            <div class="col-6 col-md-4 col-lg-3 d-flex  text-center">
                <div name="card" class="card w-100 d-flex align-items-start flex-column " ${dataAttributes} style="max-width: 304px" >

                    <div class="card-header" style="width: 100%; height: 60px;">
                        <h6 class="card-title" style="font-size: small;"><b>${name}</b></h6>
                    </div>

                    <div class="card-body" style="font-size: 0.75em; width: 100%;">
                        <p class="card-text">${description}</p>
                    </div>

                    <!-- <img class="card-img-top" src="../images/${name}.jpg" style="border-radius: 0%;" alt="..." loading="lazy" > -->

                    <div class="card-footer" style="width: 100%; height: 90px;">
                        <h6 class="card-text user-select-none" style="font-size: normal;" >$${price.toFixed(2)}</h6>
                        <!-- <p class="card-text" style="font-size: small;" >(%{stock}) in stock</p> -->
                        
                        <button name="shop-item-button" ${dataAttributes} class="btn btn-primary rounded-pill disabled" type="button" style="width: 100%;">Add to cart</button>
                    </div>

                </div>
            </div>
        `;
        myform.append(card);
    });
    // console.log("buttons created");

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
        // console.log("button found!");
        var button = addToCartButtons[i];
        button.addEventListener('click', addToCartClicked);
        // console.log("button " + i + " online!");
    }
    // console.log("shop-item-button Search End");

}

// Update Cart Quantity
function loadCartTotal(data)
{
    try
    {
        // get total of items 
        var cart        = data.cart.cart[0][1];
        // var cart_points = data.cart_points.cart[0][1];

        var totalQty = cart;

        if (data == null)
        {
            console.log('Error: No User Data');
            return;
        }

        // navbar
        var cartQty = document.getElementById('cart-quantity');
        cartQty.dataset.quantity = totalQty;
        $("#cart-quantity").text(totalQty);
    }
    catch (error)
    {
        console.log(error);
    }
}

function addToCartClicked(event)
{
    // console.log("\n" + "addToCartClicked()");
    var button = event.target;
    var id = parseInt(button.dataset.id);
    var title = button.dataset.name;
    var price = parseFloat(button.dataset.price);

    // console.log(shopItem.dataAttributes);
    // console.log("id:\t" + id);
    // console.log("title:\t" + title);
    // console.log("price:\t" + price);

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
            var cart = data['data'].cart;
            var total = cart[0][1];
            // console.log(cart);

            // console.log(cart.data.cart);
            var cartQty = document.getElementById('cart-quantity');
            cartQty.dataset.quantity = total;
            $("#cart-quantity").text(total);

            
            // Notification
            const message = `${title} added`;
            const alertType     = 'success';
            const iconChoice    = 1;
            alertNotify(message, alertType, iconChoice, 2);

            // console.log("addToCartClicked complete");
        }).catch((error => 
        {
            console.log("addToCartClicked(event)  catch:" + error);
        }));
}

function alertNotify(message, alertType, iconChoice, duration)
{
    if (iconChoice == 1)      // ✔
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