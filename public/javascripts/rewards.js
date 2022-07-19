var address = 'https://www.astromedibles.com';
// var address = 'http://localhost:8080';

// user points
var user_points = 0;

document.addEventListener('DOMContentLoaded', function () 
{
    // console.log("DOMContentLoaded");

    // load user data
    fetch(address + '/getUserData')
        .then(response => response.json())
        .then(data => loadCartTotal(data['data']))
        .then(() => 
        {
            // load menu data
            fetch(address + '/getMenuData')
            .then(response => response.json())
            .then(data => loadMenuCards(data['data']));
        });

});

function loadMenuCards(data)
{
    console.log('/loadMenuCards');
    try
    {
        // console.table(data);
        if (data.length == 0)
        {
            console.log("data.length == 0");
            return;
        }
    } catch (error)
    {
        console.log(error);
    }

    var myform = $('#myform');
    Array.from(data).forEach(function ({ id, name, price, price_points, description})
    {
        id = parseInt(id);
        price = parseFloat(price);
        price_points = parseInt(price_points);

        // console.log('\nuser_points: ' + user_points);
        // console.log('price_points: ' + price_points);

        // console.log(user_points >= price_points);


        let card = "";
        let dataAttributes = ` data-id="${id}"  data-name="${name}"  data-price="${price}"  data-price_points="${price_points}"`;
        

        // <div name="card" class="card  d-flex align-items-start flex-column " ${dataAttributes} style="max-width: 304px" >
        // <img class="card-img-top" src="../images/${name}.jpg"  alt="...">


        // <div class="card-body" style="font-size: 0.75em; width: 100%;">
        //     <p class="card-text">${description}</p>
        // </div>

        var enabledOrDisabled = 'disabled';
        // if user has enough points to purchase item, enable selection
        if (user_points >= price_points)
        {
            enabledOrDisabled = '';
        }

        // <div name="card" class="card  d-flex align-items-start flex-column " ${dataAttributes} style="max-width: 304px" >
        // <img class="card-img-top" src="../images/${name}.jpg"  alt="...">


        // <div class="card-body" style="font-size: 0.75em; width: 100%;">
        //     <p class="card-text">${description}</p>
        // </div>

        card +=
            `
            <div class="col-6 col-md-4 col-lg-3 d-flex  text-center">
                <div name="card" class="card w-100 d-flex align-items-start flex-column " ${dataAttributes} style="max-width: 304px" >

                    <div class="card-header" style="width: 100%; height: 50px;">
                        <h6 class="card-title" style="font-size: small;"><b>${name}</b></h6>
                    </div>

                    <div class="card-body" style="font-size: 0.75em; width: 100%;">
                        <p class="card-text">${description}</p>
                    </div>

                    <!-- <img class="card-img-top" src="../images/${name}.jpg" style="border-radius: 0%;" alt="..." loading="lazy" > -->

                    <div class="card-footer" style="width: 100%; height: 90px;">
                        <h5 class="card-text  user-select-none">${price_points} pts</h5>
                        <!-- <p class="card-text" style="font-size: small;" >(%{stock}) in stock</p> -->
                        
                        <button ${dataAttributes} class="btn btn-primary rounded-pill ${enabledOrDisabled}" type="button" onClick="addToCartPointsClicked(event)" style="width: 100%;">Select</button>
                    </div>

                </div>
            </div>
        `;

        myform.append(card);
    });

}

// Update Cart Quantity
function loadCartTotal(data)
{
    try
    {
        // navbar
        var cartQty = document.getElementById('cart-quantity');
        cartQty.dataset.quantity = totalQty;
        $("#cart-quantity").text(totalQty);
        
        // get total of items 
        var cart        = data.cart.cart[0][1];
        // var cart_points = data.cart_points.cart[0][1];

        var totalQty = cart;

        if (data == null)
        {
            console.log('Error: No User Data');
            return;
        }


        // display user points 
        user_points = parseInt(data.points); 
        $('#USER_POINTS').text(`You have: ${user_points.toLocaleString()} points`); 
        console.log('user_points loaded: ' + user_points); 
        
    }
    catch (error)
    {
        console.log(error);
    }
}

function addToCartPointsClickedRemove(event)
{
    var button       = event.target;
    var id           = parseInt(button.dataset.id);
    var title        = button.dataset.name;
    var price        = parseFloat(button.dataset.price);
    var price_points = parseFloat(button.dataset.price_points);

    fetch(address + '/setCartPointsDataRemove',
    {
        credentials: "include",
        method: 'PATCH',
        headers:
        {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(
        {

        })
    })
    .then(response => response.json())
    .then((data) => 
    {
        var cart = data['data']['cart'];
        var total = cart[0][1];

        // Add styling to new selection
        button.classList.remove('btn-outline-primary');
        button.classList.add('btn-primary');
        button.innerHTML = 'Select';
        button.dataset.selected = 'false';
        // button.removeEventListener('onclick', addToCartPointsClickedRemove); 
        // button.addEventListener('onclick', addToCartPointsClicked); 

        // Update Cart Total
        var cartQty = document.getElementById('cart-quantity');
        cartQty.dataset.quantity = total;
        $("#cart-quantity").text(total);

        // Notify user of new selection
        const message = `Reward ${title} removed`;
        const alertType     = 'secondary';
        const iconChoice    = 1;
        alertNotify(message, alertType, iconChoice, 2);
    }).catch((error => 
    {
        console.log("addToCartPointsClickedRemove(event)  catch:" + error);
    }));
}

function addToCartPointsClicked(event)
{
    var button       = event.target;
    var id           = parseInt(button.dataset.id);
    var title        = button.dataset.name;
    var price        = parseFloat(button.dataset.price);
    var price_points = parseFloat(button.dataset.price_points);

    fetch(address + '/setCartPointsData',
    {
        credentials: "include",
        method: 'PATCH',
        headers:
        {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(
        {
            itemId: id
        })
    })
    .then(response => response.json())
    .then((data) => 
    {
        var cart = data['data']['cart'];
        var total = cart[0][1];

        // If there is a previously existing selection, remove that selection
        var previous_selected_button = document.querySelector('[data-selected~="true"]');            
        if (previous_selected_button != null) 
        {
            previous_selected_button.classList.remove('btn-outline-primary');
            previous_selected_button.classList.add('btn-primary');
            previous_selected_button.dataset.selected = 'false';
            previous_selected_button.innerHTML = 'Select';
        }
        
        // Add styling to new selection
        button.classList.remove('btn-primary');
        button.classList.add('btn-outline-primary');
        button.innerHTML = 'Selected';
        button.dataset.selected = 'true';
        // button.removeEventListener('onclick', addToCartPointsClicked(event)); 
        // button.addEventListener('onclick', addToCartPointsClickedRemove);
        console.log('WORKING123');

        // Update Cart Total
        var cartQty = document.getElementById('cart-quantity');
        cartQty.dataset.quantity = total;
        $("#cart-quantity").text(total);
        
        // Notify user of new selection
        const message = `Reward ${title} selected`;
        const alertType     = 'primary';
        const iconChoice    = 1;
        alertNotify(message, alertType, iconChoice, 2);
    }).catch((error =>
    {
        console.log("addToCartPointsClicked(event)  catch:" + error);
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