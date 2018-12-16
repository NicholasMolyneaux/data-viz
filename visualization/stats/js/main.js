function showStatistics() {

    let viz = document.getElementById("viz");
    let mainViz = document.getElementById("mainViz");

    if (statsShown) {
        statsShown = false;

        let showStats = document.getElementById("showStats");

        showStats.innerHTML = "Show Statistics";
        //showStats.classList.remove("col-12");
        //showStats.classList.add("col");

        document.getElementById("divOptStats").style.display = "none";

        viz.classList.add("col");
        viz.classList.remove("col-xl-8");

        $('#statDiv').remove();

        $('body').css("overflow-y", "hidden");

    } else {
        statsShown = true;

        document.getElementById("divOptStats").style.display = "";

        let showStats = document.getElementById("showStats");

        //showStats.classList.remove("col");
        //showStats.classList.add("col-12");

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

        document.getElementById("showStats").innerHTML = "Hide Stats";

        if (window.innerWidth >= 1200) {
            $('body').css("overflow-y", "hidden");
            document.getElementById("statDiv").style.overflowY = 'auto';
        } else {
            $('body').css("overflow-y", "auto");
            document.getElementById("statDiv").style.overflowY = 'hidden';
        }

    }

}

function reDrawHist() {
    reDrawHistTT();
    reDrawHistDensity();
}

function reDrawHistTT() {
    prepareHistTT();
    graphOptions['tt']['data'] = histTT;
    hist('tt', 'start');

    prepareHistDensity();
    graphOptions['density']['data'] = histDensity;
    hist('density', 'start');
}

function reDrawHistDensity() {
    prepareHistDensity();
    graphOptions['density']['data'] = histDensity;
    hist('density', 'start');
}