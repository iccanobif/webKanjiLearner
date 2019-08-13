module.exports.go = async function (elements, limit, operation)
{
    let processedElementsCount = 0

    const next = () =>
    {
        processedElementsCount++
        if (processedElementsCount <= elements.length)
            operation(elements[processedElementsCount - 1])
                .then(next)
                .catch((err) =>
                {
                    console.log("processedElementsCount: " + processedElementsCount)
                    throw err
                })
        else
            return
    }

    for (let i = 0; i < limit; i++)
    {
        setTimeout(() =>
        {
            operation(elements[i])
                .then(next)
                .catch((err) =>
                {
                    console.log("i: " + i)
                    throw err
                })
        }, 50 * i);
    }
    processedElementsCount = limit
}
