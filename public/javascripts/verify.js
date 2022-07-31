
var address = 'https://www.astromedibles.com';
// var address = 'http://localhost:8080';

function send_verification_code()
{
    // disable button
    $('#button_send_code').addClass('disabled');

    // generate and email sec code
    fetch(address + '/send_verification_code',
    {
        credentials: "include",
        method: 'PATCH',
        headers:
        {
            'Content-type': 'application/json'
        }
    })
    .then(response => response.json())
    .then((data) => 
    {
        // Send user to verify page
        // window.location.replace('/verify');


        // end
    }).catch((error => 
    {
        console.log("send_verification_code  catch:" + error);

        // Notification
        const message       =  'Error, could not send'; 
        const alertType     = 'danger';
        const iconChoice    = 3;
        alertNotify(message, alertType, iconChoice, 3);

        // disable button
        $('#button_send_code').removeClass('disabled');
    }));
}

function submit_verification_code()
{
    var verification_code = $('#inputCode').val();
    verification_code = $.trim(verification_code);

    fetch(address + '/submit_verification_code',
    {
        credentials: "include",
        method: 'PATCH',
        headers:
        {
            'Content-type': 'application/json'
        },
        body: JSON.stringify
            ({
                verification_code: verification_code
            })
    })
    .then(response => response.json())
    .then((data) => 
    {
        // Notification
        const message       = 'Account Verified'; 
        const alertType     = 'Success';
        const iconChoice    = 3;
        alertNotify(message, alertType, iconChoice, 3);


        // this will automatically close the alert in 2 secs
        window.location.replace('/menu');

    }).catch((error => 
    {
        console.log("submit_verification_code  catch:" + error);

        // Notification
        const message       = 'Error: Code does not match'; 
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