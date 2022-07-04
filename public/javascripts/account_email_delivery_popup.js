document.addEventListener('DOMContentLoaded', function () 
{
    // get account attributes
    var div_account_attributes  = document.getElementById('div_account_attributes');
    var account_attributes      = JSON.parse(div_account_attributes.getAttribute('data-account_attributes'));
    var error_email_delivery    = account_attributes.error_email_delivery;

    console.table(account_attributes);
    console.log(account_attributes.error_email_delivery);

    // if email delivery failure is true
    // if (error_email_delivery != 0)
    if (error_email_delivery == 1000)
    {
        var modal_title = document.getElementById('modal_title');
        var modal_body = document.getElementById('modal_body');

        const modal_title_text = `Email Delivery Failure`;
        const modal_body_text  =
        `
        <b>Action Required</b>: The email you provided is not able to recieve our emails<br>
        <br>
        <b>Most common reasons include</b><br>
        - The email account does not exist<br>
        - Inbox is full, and cannot receive more messages<br>
        - The email account has been disabled<br>
        <br>
        <b>Try these solutions</b><br>
        - Check your provided email for typos<br>
        - Empty your full inbox to be able to receive new messages<br>
        - Provide a different email addresss<br>
        <br>
        Afterward <b>press Update</b> to resolve this issue
        `;

        modal_title.innerHTML = modal_title_text;
        modal_body.innerHTML = modal_body_text;

        $("#modal1").modal('show');
    }
});