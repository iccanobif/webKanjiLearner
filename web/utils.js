module.exports.log = function log(msg)
{
    let d = new Date()
    console.log("[" + d.toISOString() + "] " + msg)
}

module.exports.printError = function printError(e)
{
    log(e.message + " " + e.stack)
}

Array.prototype.shuffle = function ()
{
    let output = this.slice(0)
    for (let i = output.length - 1; i > 0; i--)
    {
        const j = Math.floor(Math.random() * (i + 1));
        [output[i], output[j]] = [output[j], output[i]]; // eslint-disable-line no-param-reassign
    }
    return output;
}