const sqlite3 = require("sqlite3")
const ut = require("./utils.js")

module.exports.HiddenCharacterRepository = function ()
{
    let db = new sqlite3.Database('db.db');
    db.serialize(() =>
    {
        db.run("CREATE TABLE IF NOT EXISTS HIDDEN_CHARACTERS (USER_ID, CHARACTER)")
    })
    this.hideCharacter = (user, character) =>
    {
        if (user == "" || user == undefined || user == null)
        {
            ut.log("Tried to hide character " + character + " for empty or null user. Won't do anything.")
            return
        }
        ut.log("Hiding character " + character + " for user " + user)
        db.run("INSERT INTO HIDDEN_CHARACTERS (USER_ID, CHARACTER) VALUES (?, ?)",
            [user, character],
            (err) =>
            {
                if (err) ut.printError(err)
            })
    }
    this.unhideCharacter = (user, character) =>
    {
        if (user == "" || user == undefined || user == null)
        {
            ut.log("Tried to unhide character " + character + " for empty or null user. Won't do anything.")
            return
        }
        ut.log("Unhiding character " + character + " for user " + user)
        db.run("DELETE FROM HIDDEN_CHARACTERS WHERE USER_ID = ? AND CHARACTER = ?",
            [user, character],
            (err) =>
            {
                if (err) ut.printError(err)
            })
    }
    this.unhideAllCharacters = (user) =>
    {
        db.run("DELETE FROM HIDDEN_CHARACTERS WHERE USER_ID = ?",
            [user],
            (err) =>
            {
                if (err) ut.printError(err)
            })
    }
    this.getHiddenCharacters = (user, callback) =>
    {
        ut.log("Getting hidden characters for user " + user)
        db.all("SELECT CHARACTER FROM HIDDEN_CHARACTERS WHERE USER_ID = ?",
            [user],
            (err, rows) =>
            {
                if (err)
                {
                    ut.printError(err)
                    callback([])
                }
                else 
                {
                    callback(rows.map(row => row["CHARACTER"]))
                }
            })
    }
}