async function tutto()
{
    const mongodb = require("mongodb")
    const client = await mongodb.MongoClient.connect("mongodb://localhost:27017", { useNewUrlParser: true, useUnifiedTopology: true })
    const db = client.db("webKanjiLookup")
    const coll = db.collection("sanseido")

    const aggrPipeline = [
        { $sort: { _id: 1, fileName: 1 } },
        { $group: { _id: "$fileName", count: { $sum: 1 }, idDaCancellare: { $first: "$_id" } } },
        { $match: { count: { $gt: 1 } } },
    ]
    // console.log(JSON.stringify(await coll.aggregate(aggrPipeline).explain(), null, 2))
    // return
    const result = await coll.aggregate(aggrPipeline).toArray()
    const idDaCancellare = result.map(x => x.idDaCancellare)
    console.log(idDaCancellare)
    await Promise.all(idDaCancellare.map(async id =>
    {
        console.log("deleting " + id)
        await coll.deleteOne({ _id: id })
    }))
    console.log("fatto tutto")
    client.close()
}

tutto().catch(console.error)