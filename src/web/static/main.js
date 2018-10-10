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
        let newPage = document.body.appendChild(document.createElement("div"))

        this.pages.push({
            element: newPage,
            scrollPosition: 0
        })
        return newPage
    }

    back()
    {
        document.body.removeChild(this.pages.pop().element)
        let currentPage = this.pages[this.pages.length - 1]
        $(currentPage.element).show()
        window.scrollTo(0, currentPage.scrollPosition)
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
            $("#" + character + " > .jpn").html(data
                .splits
                .map(word => "<a href='#' onclick='showDictionaryDefinition(\"word\"); return false;'>word</a>".replace(/word/g, word))
                .join(""))
            $("#" + character + " > .kana").text(data.kana)
            $("#" + character + " > .eng").text(data.eng)
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
let loader = new Loader()

function hideCharacterDetails()
{
    navigationHandler.back()
}

function showCharacterDetails(character)
{
    let newPage = navigationHandler.goToNextPage()
    loader.show()
    $.get("kanjiDetail/" + character)
        .done((data) =>
        {
            $(newPage).html(data)
            loader.hide()
        })
        .fail(() =>
        {
            alert("Failed")
            loader.hide()
            navigationHandler.back()
        })
}

function showDictionaryDefinition(word)
{
    let newPage = navigationHandler.goToNextPage()
    loader.show()
    $.get("dictionaryDefinition/" + word)
        .done((data) =>
        {
            $(newPage).html(data)
            loader.hide()
        })
        .fail(() =>
        {
            alert("Failed")
            loader.hide()
            navigationHandler.back()
        })
}

function scrollToTop()
{
    window.scrollTo(0, 0);
}