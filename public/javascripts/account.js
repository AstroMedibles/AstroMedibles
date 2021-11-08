
// const address = 'https://www.astromedibles.com';
const address = 'http://localhost:8080';

function updateAccountAttributes()
{
    var email = $('#inputEmail').val();
    email = $.trim(email);

    var password = $('#inputPassword').val();
    password = $.trim(password);

    var name = $('#inputName').val();
    name = $.trim(name);

    // console.log(email);
    // console.log(password);
    // console.log(name);

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
        if (data == false)
        {
            var error = 'Error, could not update'
            console.log(error);

            // Notification
            const message       =  error; 
            const alertType     = 'danger';
            const iconChoice    = 3;
            alertNotify(message, alertType, iconChoice, 3);

            return;
        }
        else
        {
            var error = 'Success! Account updated'
            console.log(error);

            // Notification
            const message       =  error; 
            const alertType     = 'success';
            const iconChoice    = 1;
            alertNotify(message, alertType, iconChoice, 3);
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