module.exports.go = function (elements, limit, operation)
{
    return new Promise((resolve, reject) =>
    {
        try
        {
            let processedElementsCount = 0

            const next = () =>
            {
                processedElementsCount++
                if (processedElementsCount < elements.length)
                    operation(elements[processedElementsCount])
                        .then(next)
                        .catch((err) =>
                        {
                            console.log("processedElementsCount: " + processedElementsCount)
                            reject(err)
                        })
                else
                    resolve()
            }

            for (i = 0; i < limit; i++)
            {
                setTimeout(() =>
                {
                    operation(elements[i])
                        .then(next)
                        .catch((err) =>
                        {
                            console.log("i: " + i)
                            reject(err)
                        })
                }, 30 * i);
            }
        }
        catch (err)
        {
            reject(err)
        }
    })
}
