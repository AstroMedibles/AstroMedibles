document.addEventListener('DOMContentLoaded', function () 
{
    // console.log("DOMContentLoaded");
    ready();
});

const address = 'https://www.astromedibles.com';


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

function updateAccountAttributes()
{
    var email = $('#inputEmail').val();
    email = $.trim(email);

    var password = $('#inputPassword').val();
    password = $.trim(password);

    var name = $('#inputName').val();
    name = $.trim(name);

    if (name.length > 20)
    {
        name = name.substring(0, 20);
    }

    if (email.length > 60)
    {
        email = email.substring(0, 60);
    }
    // console.log(email);
    // console.log(password);
    // console.log(name);

    const buttonUpdate = document.getElementById('buttonUpdate');
    buttonUpdate.classList.add("disabled");

    fetch(address + '/updateAccountAttributes',
    {
        credentials: "include",
        method: 'PATCH',
        headers:
        {
            'Content-type': 'application/json'
        },
        body: JSON.stringify
            ({
                email: email,
                password: '12345',
                name: name
            })
    })
    .then(response => response.json())
    .then((data) => 
    {
        if (data == true)
        {
            var error = 'Success! Account updated'
            console.log(error);

            // Notification
            const message       =  error; 
            const alertType     = 'success';
            const iconChoice    = 1;
            var   duration      = 3;
            alertNotify(message, alertType, iconChoice, duration);

            // reload page
            duration *= 1000;
            setTimeout(function ()
            { // this will automatically close the alert in 2 secs
                window.location.replace('/account');
            }, duration);
        }
        else
        {
            var error = data;
            console.log(error);

            // Notification
            const message       =  error; 
            const alertType     = 'danger';
            const iconChoice    = 3;
            alertNotify(message, alertType, iconChoice, 3);

            return;
        }
    }).catch((error => 
    {
        console.log("updateAccountAttributes  catch:" + error);

        // Notification
        const message       = 'Error! Something went wrong!'; 
        const alertType     = 'danger';
        const iconChoice    = 3;
        alertNotify(message, alertType, iconChoice, 3);
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