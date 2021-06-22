document.addEventListener('DOMContentLoaded', textarea_height)

function textarea_height() {
    document.querySelectorAll('textarea').forEach(each_textarea => {
        each_textarea.style.height = each_textarea.scrollHeight + "px";
        each_textarea.addEventListener('input', function() {
            each_textarea.style.height = "";
            each_textarea.style.height = each_textarea.scrollHeight + "px";
        })
    })
}