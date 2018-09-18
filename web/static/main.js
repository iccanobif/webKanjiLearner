function loadNewSentence(character)
{
    let button = $("#" + character + " >> .loadNewSentenceButton")
    let originalLabel = button.prop("value")
    button.prop("value", "Loading...")
    $.ajax("/getRandomSentence/" + character)
        .done((data) =>
        {
            $("#" + character + " > .kana").text(data["kana"])
            $("#" + character + " > .jpn").text(data["jpn"])
            $("#" + character + " > .eng").text(data["eng"])
            button.prop("value", originalLabel)
        })
        .fail(() =>
        {
            alert("Failed to load new sentence for character " + character + ".")
            $("#" + character + " >> .loadNewSentenceButton").prop("value", originalLabel)
        })
}

function hideCharacter(character)
{
    if (!confirm("You sure you want to hide " + character + "?"))
        return;

    let button = $("#" + character + " >> .hideCharacterButton")
    let originalLabel = button.prop("value")
    button.prop("value", "Hiding...")
    $.post("hideCharacter", { character: character, userId: $("#user").val() })
        .done(() =>
        {
            $("#" + character).hide()
        })
        .fail(() =>
        {
            alert("Failed to hide character " + character + ".")
            button.prop("value", originalLabel)
        })
}

function hideCharacterDetails()
{
    $("#popupOverlay").hide()
    $("#popupCharacterDetails").hide()
    $("#popupCharacterDetails").html("")
}

function showCharacterDetails(character)
{
    $("#popupOverlay").show()
    $("#popupCharacterDetails").show()

    $.get("kanjiDetail/" + character)
        .done((data) =>
        {
            $("#popupCharacterDetails").html(data)
        })
}

$("#popupOverlay").click(hideCharacterDetails)