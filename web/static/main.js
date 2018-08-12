function loadNewSentence(char)
{
    $.ajax("/getRandomSentence/" + char)
        .done((data) =>
        {
            $("#" + char + " > .kana").text(data["kana"])
            $("#" + char + " > .jpn").text(data["jpn"])
            $("#" + char + " > .eng").text(data["eng"])
        })
}

function hideCharacter(character)
{
    $.post("/hideCharacter", character)
    $("#" + character).hide()
}