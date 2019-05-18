class NavigationHandler
{
    constructor(firstPage)
    {
        this.pages = [{
            element: firstPage,
            scrollPosition: 0
        }]
    }

    goToNextPage(html)
    {
        this.pages[this.pages.length - 1].scrollPosition = window.scrollY
        $(this.pages[this.pages.length - 1].element).hide()
        const newPage = document.body.appendChild(document.createElement("div"))
        newPage.classList.add("divWithSpaceForFooter")
        $(newPage).html(html +
            `<div class="fixedFooter">
                <a id="closePopupButton" href="#" onClick="hideCharacterDetails(); return false">BACK</a>
                <a id="scrollToTop" href="#" onClick="scrollToTop(); return false">TO TOP</a>
            </div>`)

        this.pages.push({
            element: newPage,
            scrollPosition: 0
        })
        scrollToTop()
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
    $.ajax("getRandomSentence/" + character)
        .done((data) =>
        {
            $("#" + character + " .sentenceContainer").html(data)
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
    loader.show()
    $.get("kanjiDetail/" + character)
        .done((data) =>
        {
            navigationHandler.goToNextPage(data)
            loader.hide()
        })
        .fail(() =>
        {
            alert("Failed")
            loader.hide()
        })
}

function showDictionaryDefinition(word)
{
    loader.show()
    $.get("dictionaryDefinition/" + word)
        .done((data) =>
        {
            navigationHandler.goToNextPage(data)
            loader.hide()
        })
        .fail(() =>
        {
            alert("Failed")
            loader.hide()
        })
}

function scrollToTop()
{
    window.scrollTo(0, 0);
}

function expandWord(clickedLink)
{
    const ul = $(clickedLink).prevAll("ul")[0]
    if ($(ul).css("display") == "none")
        $(ul).css("display", "inline-block")
    else
        $(ul).css("display", "none")
}

function showEnglishTranslation(sender)
{
    console.log(sender)
    $(sender).next(".eng").show()
    $(sender).hide()
}