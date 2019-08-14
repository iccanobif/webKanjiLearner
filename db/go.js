module.exports.go = function (elements, limit, initialGap, operation)
{
    return new Promise(resolve =>
    {
        let countStarted = 0
        let countDone = 0

        const doNextOperation = async () =>
        {
            if (countDone >= elements.length)
            {
                resolve()
            }
            else
            {
                countStarted++
                try
                {
                    await operation(elements[countStarted - 1])
                }
                catch (err)
                {
                    console.error(err)
                }
                countDone++
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
                    if (countDone >= elements.length)
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
