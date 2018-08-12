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

// $(() =>
// {
//     document.querySelectorAll("input").forEach((btn) =>
//     {
//         btn.addEventListener("click", () =>
//         {
//             loadNewSentence(btn.name())
//         })
//     })
// }
// )
