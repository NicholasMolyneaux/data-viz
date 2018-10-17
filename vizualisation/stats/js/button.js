function handleChange(input) {
    if (input.value < initTime) input.value = initTime;
    if (input.value > finalTime) input.value = finalTime;
}

function addNewGraph() {

    nbrGraphs += 1;

    $('#btnAddGraph').remove();

    let toBeAdded = "                <div class=\"col-4 text-center\" id=\"div_graph" + nbrGraphs + "\">\n" +
        "                    <label for=\"graph1_type\">Graph" + nbrGraphs + " - type:</label> <br>\n" +
        "                    <select class=\"form-control\" id=\"graph1_type\" name=\"origin\">\n" +
        "                        <option>Travel Time</option>\n" +
        "                        <option>Speed</option>\n" +
        "                        <option>OD chord diagram</option>\n" +
        "                    </select>\n" +
        "                    <br>\n" +
        "                    <button class=\"btn btn-primary\" onclick=\"delGraph(this)\" value=\"div_graph" + nbrGraphs + "\" id=\"del_graph" + nbrGraphs + "\">Delete Graph " + nbrGraphs + "</button>\n" +
        "                </div>\n";

    if (nbrGraphs < 3) {
        toBeAdded +="                <div class=\"col-4 align-self-center text-center\" id=\"btnAddGraph\">\n" +
            "                    <input class=\"btn btn-primary\" type=\"button\" id=\"add_graph\" value=\"Add a new Graph\" onclick=\"addNewGraph()\">\n" +
            "                </div>";
    }


    $('#graphs_options').append(toBeAdded);
}

function delGraph(event) {
    nbrGraphs -= 1;

    $('#' + event.value).remove();

    if (nbrGraphs == 2) {

        let toBeAdded ="                <div class=\"col-4 align-self-center\" id=\"btnAddGraph\">\n" +
            "                    <input class=\"btn btn-primary\" type=\"button\" id=\"add_graph\" value=\"Add a new Graph\" onclick=\"addNewGraph()\">\n" +
            "                </div>";

        $('#graphs_options').append(toBeAdded);
    }


    // Update all the other
}