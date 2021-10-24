document.addEventListener('DOMContentLoaded', function () 
{
    // console.log("DOMContentLoaded");
    ready();
});

const address = 'https://astromedibles.com';
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
    fetch(address + '/getUserOrders')
    .then(response => response.json())
    .then(data =>  
    {
        var orders = Array.from(data['data']);

        for (let i = 0; i < orders.length; i++)
        {
            console.log(orders[i]);

            var userOrder = orders[i];

            var status      = userOrder[0].status;
            var order_id    = userOrder[1].order_id;
            var name        = userOrder[2].name;
            var cart        = JSON.parse(userOrder[3].cart).cart;
            var total       = userOrder[4].total;

            var date_created = new Date(userOrder[5].date_created);
            var options =
            {
                hour: '2-digit',
                minute: '2-digit',
                year: "numeric",
                month: "2-digit",
                day: "2-digit"

            };
            console.log("date_created");
            console.log(date_created);
            date_created = date_created.toLocaleString('en-us', options);
            console.log(date_created);

            var cancelOrderButton = "";

            if (status === "Payment Required")
            {
                var dataAttributes = "data-order_id=" + order_id;
                status = '<a href="https://account.venmo.com/pay?txn=pay&recipients=Astro-Medibles">' + status + '</a>';
                cancelOrderButton =
                `<span class="value">
                <button name="cancel-order-button" ${dataAttributes} class="btn btn-warning btn-sm rounded-pill" type="button" >Cancel Order</button>
                </span>`;
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
                <div class="row product-image justify-content-center align-items-start">

                    <div class="col-md-4 product-info">
                        <div class="product-specs d-flex flex-column  align-items-center">
                                
                            <div style="padding: 0px 0px 15px 0px; text-align: center;">
                                <span>Items</span>
                                <br>
                                <span class="value">${status}</span>
                            </div>


                            <div style="padding: 0px 0px 15px 0px; text-align: center;">
                                <span>Order ID</span>
                                <br>
                                <span class="value">${order_id}</span>
                            </div>

                            <div style="padding: 0px 0px 15px 0px; text-align: center;">
                                <br>
                                <span class="value">${cancelOrderButton}</span>
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
            var myform = $('#cart-items');
            myform.append(card);
        }

        var cancelOrderButtons = document.getElementsByName('cancel-order-button');
        for (var i = 0; i < cancelOrderButtons.length; i++)
        {
            console.log("button found!");
            var button = cancelOrderButtons[i];
            button.addEventListener('click', buttonCancelOrder);
            console.log("button " + i + " online!");
        }
    });

    var s = new Date().toLocaleString();

    console.log("DATE: " + s);

}

function buttonCancelOrder(event)
{
    if (confirm('Are you sure you want to cancel this order?')) {
        // 
        console.trace('Cancel order pressed.');
      } else {
        // 
        console.trace('Do not cancel order pressed.');
        return;
      }


    console.log("\n" + "buttonCancelOrder(event)");
    var button = event.target;
    var order_id = button.dataset.order_id;

    console.log("order_id:\t" + order_id);

    fetch(address + '/cancelOrder',
        {
            credentials: "include",
            method: 'DELETE',
            headers:
            {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(
                {
                    order_id: order_id
                })
        })
        .then(response => response.json())
        .then(() => 
        {
            // window.location.href = '/MyOrders'; // might not need?

            var parentDiv = button.parentNode.parentNode.parentNode.parentNode.parentNode;
            parentDiv.remove();
            console.log("cancelOrder(event) complete");
        }).catch((error => 
        {
            console.log("cancelOrder(event)  catch:" + error);
        }));

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

    populateUserOrders();
}