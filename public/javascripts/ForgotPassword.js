
const address = 'https://astromedibles.com';
// const address = 'http://localhost:8080';

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
            
            // verication code has been emailed

            // notify user code has been sent, and please enter it in
            $('#directionsLabel').text("Enter the verifcation code from your email");
            // reveal security code input

            $('#emailDiv').attr('hidden', 'true');
            $('#buttonRequestCode').attr('hidden', 'true');
           
            $('#verifyDiv').removeAttr('hidden');
            $('#newPasswordDiv').removeAttr('hidden');
            $('#newPasswordConfirmDiv').removeAttr('hidden');
            $('#buttonNewPassword').removeAttr('hidden');

            console.log("forgotPasswordGenerateCode complete");
        }).catch((error => 
        {
            console.log("forgotPasswordGenerateCode  catch:" + error);
        }));
}

function updatePassword()
{
    console.log(1000);
    var email = $('#inputEmail').val();
    email = $.trim(email);

    var password = $('#inputPassword').val();
    password = $.trim(password);

    var passwordConfirm = $('#inputPasswordConfirm').val();
    passwordConfirm = $.trim(passwordConfirm);

    var verificationCode = $('#inputCode').val();
    verificationCode = $.trim(verificationCode);

    console.log(email);
    console.log(password);
    console.log(verificationCode);


    console.log(4000);

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
            $('#directionsLabel').text("Success! Your password has been updated");
            window.location.href = 'login';
        }).catch((error => 
        {
            console.log("updateNewPassword  catch:" + error);
        }));
}