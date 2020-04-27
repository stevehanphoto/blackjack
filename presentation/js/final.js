window.addEventListener('load', initPage);

function initPage()
{
    obj = document.getElementsByClassName('make-white');
    for (var i=0; i<obj.length; i++) {
        obj[i].style.color = "white";
    }
}