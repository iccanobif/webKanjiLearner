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

        const handles = []
        for (let i = 0; i < limit; i++)
        {
            new Promise(resolve => 
            {
                handles.push(setTimeout(resolve, initialGap * i))
            })
                .then(() =>
                {
                    // Sometimes the execution of the entire task is quicker
                    // than initialGap * limit milliseconds, so in this case
                    // it's good to clear the event loop from setTimeout() tasks
                    // that have become useless
                    if (count >= elements.length)
                    {
                        handles.forEach(element =>
                        {
                            clearTimeout(element)
                        });
                        return;
                    }
                    doNextOperation().catch(console.error)
                })
        }
    })

}
