// const address = 'https://www.astromedibles.com';
const address = 'http://localhost:8080';

function sendHelp()
{
    var orderId     = $('#inputOrderId').val();
    var description = $('#inputDescription').val();
    orderId         = $.trim(orderId);
    description     = $.trim(description);

    // console.log(orderId);
    // console.log(description);

    if (orderId.length < 3 || description.length < 3)
    {
        alert("Please fill in the fields.");
        return;
    }

    fetch(address + '/customerSupportEmailHelpDesk',
    {
        credentials: "include",
        method: 'POST',
        headers:
        {
            'Content-type': 'application/json'
        },
        body: JSON.stringify
            ({
                orderId: orderId,
                description: description
            })
    })
    .then(response => response.json())
    .then((response) =>
    {
        // Response sent successfully
        document.getElementById("inputOrderId").classList.add("disabled");
        document.getElementById("inputDescription").classList.add("disabled");
        document.getElementById("buttonSubmit").classList.add("disabled");

        // Notification
        const message = 'Thank you! Your response has been recieved!';
        const alertType     = 'success';
        const iconChoice    = 1;
        alertNotify(message, alertType, iconChoice, 3);

        setTimeout(function ()
        { // this will automatically close the alert in 2 secs
            window.location.replace('/help');
        }, 3000);
    })
    .catch((error) =>
    {
        console.log(error);

        // Notification
        const message = "Error, response could not be sent";
        const alertType     = 'danger';
        const iconChoice    = 3;
        alertNotify(message, alertType, iconChoice, 3);
    });
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
