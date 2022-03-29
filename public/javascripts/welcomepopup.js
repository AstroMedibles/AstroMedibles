document.addEventListener('DOMContentLoaded', function () 
{
    const name = 'welcome';
    cValue = getCookie(name);

    if (cValue != 'HELLO')
    {
        $("#modal1").modal('show');
        setCookie('welcome', 'HELLO', 999);
    }
    console.log(`Cookie Value (${name}): ` + cValue);
});

function getCookie(cname)
{
    return document.cookie.match('(^|;)\\s*' + cname + '\\s*=\\s*([^;]+)')?.pop()
}

function setCookie(cname, cvalue, exdays)
{
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}