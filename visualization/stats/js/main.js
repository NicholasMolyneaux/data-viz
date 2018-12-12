function showStatistics() {

    let viz = document.getElementById("viz");
    let mainViz = document.getElementById("mainViz");

    if (statsShown) {
        statsShown = false;

        document.getElementById("showStats").innerHTML = "Show Statistics";

        viz.classList.add("col");
        viz.classList.remove("col-xl-8");

        $('#statDiv').remove();


    } else {
        statsShown = true;

        viz.classList.remove("col");
        viz.classList.add("col-xl-8");

        let statDiv = document.createElement("div");
        //statDiv.style.overflowY = "scroll";
        //statDiv.style.height = getVizHeight();

        statDiv.classList.add("col");
        statDiv.classList.add("col-xl-4");

        statDiv.setAttribute("id", "statDiv");
        mainViz.appendChild(statDiv);

        $.get('./assets/templates/stats.html', function(opts) {
            var rendered = Mustache.render(opts);

            $('#statDiv').append(rendered);
            prepareChord();
            addHistograms();
        });



        document.getElementById("showStats").innerHTML = "Hide Statistics";

    }

}

function reDrawHistTT() {
    prepareHistTT();
    graphOptions['tt']['data'] = histTT;
    hist('tt', 'start');
}