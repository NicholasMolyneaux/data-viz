async function customStreaming(urlList, f, firstDataChunk) {

    async function getDataAndPlot(url, currentData) {
        fetch(url).then(r => {return r.json()}).then(d => {
            dataChunk = d;
            fullData.push(d);
        });
        return f(currentData);
    }

    let dataChunk = firstDataChunk;
    let fullData = [];
    for (url of urlList) {
        await getDataAndPlot(url, dataChunk);
    }

    return fullData;
}




