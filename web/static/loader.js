class Loader
{
    constructor()
    {
        debugger
        this.loaderElement = $("<div id='loader' class='overlay'><div id='loaderText'>実行中</div></div>")
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