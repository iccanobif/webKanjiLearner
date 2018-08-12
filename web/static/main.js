$(() =>
{
    document.querySelectorAll("input").forEach((btn) =>
    {
        btn.addEventListener("click", () =>
        {
            char = btn.name
            console.log(char)
            $.ajax("/getRandomSentence/" + char)
                .done((data) =>
                {
                    $("#" + char + " > .kana").text(data["kana"])
                    $("#" + char + " > .jpn").text(data["jpn"])
                    $("#" + char + " > .eng").text(data["eng"])
                })
        })
    })
}
)
