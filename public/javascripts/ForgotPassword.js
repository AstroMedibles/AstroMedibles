
const address = 'https://www.astromedibles.com';
// const address = 'http://localhost:8080';

const passwordInput = document.getElementById('inputPassword');
const togglePasswordButton = document.getElementById('toggle-password');

togglePasswordButton.addEventListener('click', togglePassword);

function togglePassword()
{
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      togglePasswordButton.textContent = 'Hide';
      togglePasswordButton.setAttribute('aria-label',
        'Hide password.');
    } else {
      passwordInput.type = 'password';
      togglePasswordButton.textContent = 'Show';
      togglePasswordButton.setAttribute('aria-label',
        'Show password as plain text. ' +
        'Warning: this will display your password on the screen.');
    }
}



function forgotPassword()
{
    var email = $('#inputEmail').val();
    email = $.trim(email);

    console.log(email);

    // generate and email sec code
    fetch(address + '/forgotPasswordGenerateCode',
        {
            credentials: "include",
            method: 'PATCH',
            headers:
            {
                'Content-type': 'application/json'
            },
            body: JSON.stringify
                ({
                    email: email
                })
        })
        .then(response => response.json())
        .then((data) => 
        {
            if (data == false)
            {
                var error = 'Email not found'
                console.log(error);
                $('#inputEmail').val('');

                // Notification
                const message       =  error; 
                const alertType     = 'danger';
                const iconChoice    = 3;
                alertNotify(message, alertType, iconChoice, 3);

                return;
            }

            // verication code has been emailed

            // notify user code has been sent, and please enter it in
            $('#directionsLabel').text("Enter the verifcation code from your email");
            // reveal security code input

            $('#emailDiv').attr('hidden', 'true');
            $('#buttonRequestCode').attr('hidden', 'true');
           
            $('#verifyDiv').removeAttr('hidden');
            $('#newPasswordDiv').removeAttr('hidden');
            $('#buttonNewPassword').removeAttr('hidden');

            // Notification
            const message       =  'Code successfully sent'; 
            const alertType     = 'primary';
            const iconChoice    = 3;
            alertNotify(message, alertType, iconChoice, 2);

            // console.log("forgotPasswordGenerateCode complete");
        }).catch((error => 
        {
            console.log("forgotPasswordGenerateCode  catch:" + error);
        }));
}

function updatePassword()
{
    var email = $('#inputEmail').val();
    email = $.trim(email);

    var password = $('#inputPassword').val();
    password = $.trim(password);

    var verificationCode = $('#inputCode').val();
    verificationCode = $.trim(verificationCode);

    // make sure both password fields match
    // if (password != passwordConfirm)
    // {
    //     var error = 'New password does not match confirm'
    //     console.log(error);
    //     $('#inputPasswordConfirm').val('');

    //     // Notification
    //     const message       =  error; 
    //     const alertType     = 'danger';
    //     const iconChoice    = 3;
    //     alertNotify(message, alertType, iconChoice, 3);

    //     return;
    // }


    // console.log(email);
    // console.log(password);
    // console.log(verificationCode);

    fetch(address + '/updatePassword',
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
                verificationCode: verificationCode
            })
    })
    .then(response => response.json())
    .then((data) => 
    {
        if (data == false)
        {
            var error = 'Verification code does not match'
            console.log(error);
            $('#inputCode').val('');
            $('#inputCode').focus();

            // Notification
            const message       =  error; 
            const alertType     = 'danger';
            const iconChoice    = 3;
            alertNotify(message, alertType, iconChoice, 3);

            return;
        }


        $('#directionsLabel').text("Success! Your password has been updated");
        window.location.href = 'login';
    }).catch((error => 
    {
        console.log("updateNewPassword  catch:" + error);

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