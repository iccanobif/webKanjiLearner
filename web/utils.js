module.exports.log = function log(msg)
{
    let d = new Date()
    console.log("[" + d.toISOString() + "] " + msg)
}

module.exports.printError = function printError(e)
{
    log(e.message + " " + e.stack)
}