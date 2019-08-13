module.exports.go = function (elements, limit, initialGap, operation)
{
    return new Promise(resolve =>
    {
        let count = 0

        const doNextOperation = async () =>
        {
            if (count >= elements.length)
                resolve()
            else
            {
                count++
                try
                {
                    await operation(elements[count - 1])
                }
                catch (err)
                {
                    console.error(err)
                }
                doNextOperation();
            }
        }

        for (let i = 0; i < limit; i++)
        {
            new Promise(resolve => setTimeout(resolve, initialGap * i))
                .then(() =>
                {
                    doNextOperation().catch(console.error)
                })
        }
    })

}
