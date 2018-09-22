class NavigationHandler
{
    constructor(firstPage)
    {
        this.pages = [{
            element: firstPage,
            scrollPosition: 0
        }]
    }

    goToNextPage()
    {
        this.pages[this.pages.length - 1].scrollPosition = window.scrollY
        $(this.pages[this.pages.length - 1].element).hide()
        let newPage = document.createElement("div")
        document.body.appendChild(newPage)
        this.pages.push({
            element: newPage,
            scrollPosition: 0
        })
        return newPage
    }

    back()
    {
        $(this.pages[this.pages.length - 1].element).hide()
        this.pages.pop()
        $(this.pages[this.pages.length - 1].element).show()
        window.scrollTo(0, this.pages[this.pages.length - 1].scrollPosition)
    }
}

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

let navigationHandler = new NavigationHandler(document.getElementById("mainPage"))

function hideCharacterDetails()
{
    navigationHandler.back()
}

function showCharacterDetails(character)
{
    let newPage = navigationHandler.goToNextPage()
    console.log(newPage)

    $.get("kanjiDetail/" + character)
        .done((data) =>
        {
            $(newPage).html(data)
        })
}
