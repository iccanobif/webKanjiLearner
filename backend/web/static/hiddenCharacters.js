let loader = new Loader()

function unhideCharacter(character)
{
    if (!confirm("Wanna unhide character " + character + "?"))
        return

    loader.show()

    $.post("unhideCharacter", { character: character, userId: $("#user").val() })
        .done(() =>
        {
            $("#" + character).hide()
            loader.hide()
        })
        .fail(() =>
        {
            alert("Failed to unhide character " + character + ".")
            loader.hide()
        })
}