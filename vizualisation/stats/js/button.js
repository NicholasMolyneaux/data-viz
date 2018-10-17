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

    let toBeAdded = "                <div class=\"col-4 text-center\" id=\"div_graph" + graphId + "\">\n" +
        "                    <label for=\"graph1_type\">Graph" + graphId + " - type:</label> <br>\n" +
        "                    <select class=\"form-control\" id=\"graph" + graphId + "_type\" name=\"origin\">\n" +
        "                        <option value='TT' selected>Travel Time</option>\n" +
        "                        <option value='speed'>Speed</option>\n" +
        "                        <option value='OD'>OD chord</option>\n" +
        "                    </select>\n" +
        "                    <br>\n" +
        "                        <button class=\"btn btn-primary\" onclick=\"delGraph(this)\" value=\"div_graph" + graphId + "\" id=\"del_graph" + graphId + "\">Delete Graph" + graphId + "</button>\n" +
        "                    </div>" +
        "                </div>\n";

    if (nbrGraphs < 3) {
        toBeAdded += addGraph;
    }

    $('#graphs_options').append(toBeAdded);

    toBeAdded = "    <div style=\"display: none;\" class=\"container\" id=\"graph" + graphId + "\">\n" +
        "        <div class=\"row\">\n" +
        "            <div class=\"graph col\" id=\"vizGraph" + graphId +  "\">\n" +
        "            </div>\n" +
        "        </div>\n" +
        "        <div class=\"row\" id=\"optionsGraph" + graphId + "\">\n" +
        "            <div class=\"col text-center\" id=\"optionGraph" + graphId + "\">\n" +
        "                <p>SAVE</p>\n" +
        "            </div>\n" +
        "        </div>\n" +
        "    </div>"

    $('#graphContainer').append(toBeAdded);

    graphDivs.push("graph"+graphId);
}

function delGraph(event) {
    nbrGraphs -= 1;

    $('#' + event.value).remove();

    if (nbrGraphs == 2) {

        $('#graphs_options').append(addGraph);
    }

    const nameDiv = event.value.split("_")[1];

    $('#' + nameDiv).remove();

    graphDivs = graphDivs.filter(function(item) {
        return item !== nameDiv
    })
}