
const address = 'https://astromedibles.com';
// const address = 'http://localhost:8080';


function createUserAccount()
{
    var code       = $('#inputCode').val();
    var name       = $('#inputName').val();
    var email      = $('#inputEmail').val();
    var password   = $('#inputPassword').val();

    code        = $.trim(code);
    name        = $.trim(name);
    email       = $.trim(email);
    password    = $.trim(password);

    console.log(code);
    console.log(name);
    console.log(email);
    console.log(password);

    if (code.length < 2 || name.length < 2 || email.length < 2 || password.length < 2)
    {
        alert("Please correct the fields.");
        return;
    }

    fetch(address + '/register',
        {
            credentials: "include",
            method: 'POST',
            headers:
            {
                'Content-type': 'application/json'
            },
            body: JSON.stringify
                ({
                    name: name,
                    email: email,
                    password: password,
                    code: code
                })
        })
        .then(response => response.json())
        .then((accountCreated) =>
        {
            console.log("accountCreated:");
            console.log(accountCreated);

            // acountCreated!
            if (accountCreated)
            {
                const message = "Your account has been created!";
                const alerttype = "alert-success";
    
                // show pop up
                $('#alertCreate').append('<div id="alertdiv" class="alert ' + alerttype + '"><a class="close" data-dismiss="alert"></a><span>' + message + '</span></div>')

                setTimeout(function ()
                { // in 2 secs, redirect to login
                    window.location.href = '/';
                }, 2000);

            }
            else // account not created, ERROR
            {
                $('#inputEmail').val("");
                $('#inputEmail').focus();
                const message = "Email already in use, please try again.<br> Or invalid Access Code.";
                const alerttype = "alert-danger";
    
                // show pop up
                $('#alertEmail').append('<div id="alertdiv" class="alert ' + alerttype + '"><a class="close" data-dismiss="alert"></a><span>' + message + '</span></div>')
    
                setTimeout(function ()
                { // this will automatically close the alert in 6 secs
                    $("#alertdiv").remove();
                }, 6000);

            }
        });
}
