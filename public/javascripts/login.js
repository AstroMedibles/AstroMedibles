
const address = 'https://www.astromedibles.com';
// const address = 'http://localhost:8080';


console.log(window.location.href);
if (window.location.href.includes('www.'))
{
    console.log('GOOD');
} else
{
    console.log('Bad, redirecting');
}

function signIn()
{
    var email = $('#inputEmail').val();
    var password = $('#inputPassword').val();
    email = $.trim(email);
    password = $.trim(password);

    console.log(email);
    console.log(password);


    if (email.length < 2 || password.length < 2)
    {
        $('#inputPassword').val("");
        // $('#inputPassword').focus();
        const message = "Login invalid, please try again!";
        const alerttype = "alert-danger";

        // show pop up
        $('#alertSignIn').append('<div id="alertdiv" class="alert ' + alerttype + '"><a class="close" data-dismiss="alert"></a><span>' + message + '</span></div>')
        
        setTimeout(function ()
        { // this will automatically close the alert in 2 secs
            $("#alertdiv").remove();
        }, 4000);

        return;
    }


    fetch(address + '/auth',
        {
            credentials: "include",
            method: 'POST',
            headers:
            {
                'Content-type': 'application/json'
            },
            body: JSON.stringify
                ({
                    email: email,
                    password: password
                })
        })
        .then(response => response.json())
        .then((userSignedIn) =>
        {
            console.log("userSignedIn:");
            console.log(userSignedIn);

            // userSignedIn!
            if (userSignedIn)
            {
                window.location.href = 'menu';
            }
            else // invalid credentials
            {
                $('#inputPassword').val("");
                $('#inputPassword').focus();
                const message = "Login invalid, please try again!";
                const alerttype = "alert-danger";
    
                // show pop up
                $('#alertSignIn').append('<div id="alertdiv" class="alert ' + alerttype + '"><a class="close" data-dismiss="alert"></a><span>' + message + '</span></div>')
                
                setTimeout(function ()
                { // this will automatically close the alert in 2 secs
                    $("#alertdiv").remove();
                }, 4000);


            }
        });
}
