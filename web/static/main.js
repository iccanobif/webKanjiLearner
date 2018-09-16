function loadNewSentence(character)
{
    let originalLabel = $("#" + character + " > .loadNewSentenceButton").prop("value")
    $("#" + character + " > .loadNewSentenceButton").prop("value", "Loading...")
    $.ajax("/getRandomSentence/" + character)
        .done((data) =>
        {
            $("#" + character + " > .kana").text(data["kana"])
            $("#" + character + " > .jpn").text(data["jpn"])
            $("#" + character + " > .eng").text(data["eng"])
            $("#" + character + " > .loadNewSentenceButton").prop("value", originalLabel)
        })
}

function hideCharacter(character)
{
    let hideCharacterButton = $("#" + character + " > .hideCharacterButton")
    let originalLabel = hideCharacterButton.prop("value")
    hideCharacterButton.prop("value", "Hiding...")
    $.post("/hideCharacter", { character: character, userId: $("#user").val() })
        .done(() =>
        {
            $("#" + character).hide()
        })
        .fail(() =>
        {
            alert("failed to delete character " + character)
            hideCharacterButton.prop("value", originalLabel)
        })
}