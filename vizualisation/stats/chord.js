let request = new XMLHttpRequest();

fetch('http://transporsrv2.epfl.ch/api/summary/lausannwpiw/test2').then(response => {
    return response.json();
}).then(data => {
    const groupedData = d3.nest()
        .key(function(d) {return d.O;})
        .key(function(d) {return d.D;})
        .rollup(function(d) {return d.length;})
        .entries(data);
    console.log(data);
}).catch(err => {
    console.log(err)
});