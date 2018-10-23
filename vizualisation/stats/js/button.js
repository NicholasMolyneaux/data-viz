function handleChange(input) {
    if (input.value < initTime) input.value = initTime;
    if (input.value > finalTime) input.value = finalTime;
}

const addGraph = "                <div class=\"col-4 align-self-center text-center\" id=\"btnAddGraph\">\n" +
    "                    <input class=\"btn btn-primary\" type=\"button\" id=\"add_graph\" value=\"Add new Graph\" onclick=\"addNewGraph()\">\n" +
    "                </div>";

function addNewGraph() {

    nbrGraphs += 1;

    graphId += 1;

    $('#btnAddGraph').remove();

    $.get('./templates/choice.mst', function(choice) {
        var rendered = Mustache.render(choice, {id: graphId});

        if (nbrGraphs < 3) {
            rendered += addGraph;
        }

        $('#graphs_options').append(rendered);
    });

    $.get('./templates/graph.mst', function(graph) {
        var rendered = Mustache.render(graph, {id: 'graph' + graphId});
        $('#graphContainer').append(rendered);
    });

    graphDivs.push("graph"+graphId);
}

function delGraph(event) {
    nbrGraphs -= 1;

    console.log(event.value);

    $('#' + event.value).remove();

    if (nbrGraphs == 2) {

        $('#graphs_options').append(addGraph);
    }

    const nameDiv = "div_" + event.value.split("_")[1];

    $('#' + nameDiv).remove();

    graphDivs = graphDivs.filter(function(item) {
        return item !== event.value.split("_")[1];
    })
}