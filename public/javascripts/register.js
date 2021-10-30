
const address = 'https://www.astromedibles.com';
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
        alert("Please fill in the fields.");
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
        
                var iconHTML = '<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:"><use xlink:href="#check-circle-fill"/></svg>';
    
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
                { // in 2 secs, redirect to login
                    window.location.href = '/';
                }, 2000);

            }
            else // account not created, ERROR
            {
                $('#inputCode').val("");
                $('#inputEmail').val("");
                $('#inputPassword').val("");

                const message = "Email already in use, or invalid Access Code.<br>Please try again.";
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
                }, 6000);





            }
        });
}
