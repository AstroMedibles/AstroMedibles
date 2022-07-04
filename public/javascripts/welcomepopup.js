document.addEventListener('DOMContentLoaded', function () 
{
    const name = 'welcome';
    cValue = getCookie(name);

    if (cValue != 'HELLO')
    {
        var modal_title = document.getElementById('modal_title');
        var modal_body = document.getElementById('modal_body');

        const modal_title_text = `🚀 Welcome to Astromedibles.com! 🚀`;

        const modal_body_text =
        `
        Here at <b>Astromedibles</b> we take great pride in producing the <b>highest quality edibles</b> for the <b>best value</b> since 2018. <br>
        Utilizing high purity extracts and concentrates combined with high quality, locally sourced ingredients allows us to provide you accurately dosed sweets, treats and munchies that are full of flavor for any occasion.<br>
        <b>Specialty treats include:</b> Enchilado gummies, cereal bars, frozen desserts, lemonades made from scratch and baked goods.<br>
        <b>The rush to order is OVER:</b> Take your time, and enjoy the new website. We are working to create a smoother customer experience.<br><br>
        We appeciate your support and feedback, thank you! 👩‍🚀
        `;

        modal_title.innerHTML = modal_title_text;
        modal_body.innerHTML = modal_body_text;

        $("#modal1").modal('show');
        setCookie('welcome', 'HELLO', 999);
    }
    // console.log(`Cookie Value (${name}): ` + cValue);
});

function getCookie(cname)
{
    return document.cookie.match('(^|;)\\s*' + cname + '\\s*=\\s*([^;]+)')?.pop();
}

function setCookie(cname, cvalue, exdays)
{
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}