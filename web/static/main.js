function loadNewSentence(char)
{
    $("#" + char + " > .loadNewSentenceButton").prop("value", "Loading...")
    $.ajax("/getRandomSentence/" + char)
        .done((data) =>
        {
            $("#" + char + " > .kana").text(data["kana"])
            $("#" + char + " > .jpn").text(data["jpn"])
            $("#" + char + " > .eng").text(data["eng"])
            $("#" + char + " > .loadNewSentenceButton").prop("value", "Load new sentence")
        })
}

function hideCharacter(character)
{
    $("#" + character).hide()
    $.post("/hideCharacter", character)
}