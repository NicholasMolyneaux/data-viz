async function customStreaming(urlList, f) {

    async function getDataAndPlot(url, currentData) {
        fetch(url).then(r => {return r.json()}).then(d => {
            dataChunk = d;
            fullData.push(d);
        });
        return f(currentData);
    }

    let dataChunk;
    let fullData = [];
    for (url of urlList) {
        dataChunk = await getDataAndPlot(url, dataChunk);
    }

    return fullData;
}




