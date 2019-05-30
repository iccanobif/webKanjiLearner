class Loader
{
    constructor()
    {
        this.loaderElement = $("<div id='loader' class='overlay'><div id='loaderText'>Loading...</div></div>")
        $("body").append(this.loaderElement)
        // this.hide()
    }
    show()
    {
        $(this.loaderElement).show()
    }
    hide()
    {
        $(this.loaderElement).hide()
    }
}