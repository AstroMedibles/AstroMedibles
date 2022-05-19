document.addEventListener('DOMContentLoaded', function () 
{
    // console.log("DOMContentLoaded");
    ready();
});

const address = 'https://www.astromedibles.com';
// const address = 'http://localhost:8080';


function ready()
{
    // get cart total
    fetch(address + '/getUserData')
    .then(response => response.json())
    .then(data => 
    {
        loadCartTotal(data['data']);

        // console.table(data);

        $('#inputName').val(data['data'].name);
        $('#inputEmail').val(data['data'].email);

    });
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

function updateAccountAttributes()
{
    var email = $('#inputEmail').val();
    email = $.trim(email);

    var password = $('#inputPassword').val();
    password = $.trim(password);

    var name = $('#inputName').val();
    name = $.trim(name);

    if (name.length > 30)
    {
        name = name.substring(0, 30);
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
                password: password,
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
            error = 'Error: Email possibly already in use.'
            // console.log(error);

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