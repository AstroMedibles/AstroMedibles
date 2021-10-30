
const address = 'https://www.astromedibles.com';
// const address = 'http://localhost:8080';


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
        alert("Please fill in the fields.");
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
    
            var iconHTML = '<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Failure:"><use xlink:href="#exclamation-triangle-fill"/></svg>';
    
            var html = 
            `
            <div id="alertNotification" class="alert ${alerttype}  text-center  col-auto" style="margin: 0 auto; align-text: center;" role="alert">
                <span>
                    ${iconHTML}
                    ${message}
                </span>
            </div>
            `;
    
            // show pop up
            $('#notification').append(html);
            
            setTimeout(function ()
            { // this will automatically close the alert in 2 secs
                $("#alertNotification").remove();
            }, 3000);
        }
    });
}
