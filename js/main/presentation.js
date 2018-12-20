/*********************************************************/
/*                                                       */
/*   File with the functions for the presentation on     */
/*   the homepage. It's pretty messy, sorry...           */
/*                                                       */
/*   By Nicholas Molyneaux, Gael Lederrey & Semin Kwak   */
/*                                                       */
/*********************************************************/

/**
 * Main function that will run the presentation using timeouts
 */
function presentation() {

    // The functions fadeIn, fadeOut, and fadeInFadeOut are defined in the file js/main/misc.js

    // ID of the timeout. (in case we need to delete them)
    let idTO;

    // Transition time
    const animTime = 1000;

    // Web page title The Walking Data
    let titleDiv = document.createElement("div");
    titleDiv.innerHTML = "<h1 id='titleForPres' style='display: none'>The walking data</h1>";
    titleDiv.classList.add("presentation");
    titleDiv.classList.add("presentation-title");
    document.getElementById("mainViz").appendChild(titleDiv);

    // Main text container 1
    let firstTextLine = document.createElement("div");
    firstTextLine.innerHTML = "<h2 id='textLine1' style='display: none'>Welcome to the train station of Lausanne, Switzerland</h2>";
    firstTextLine.classList.add("presentation");
    firstTextLine.classList.add("presentation-text");
    document.getElementById("mainViz").appendChild(firstTextLine);

    // Main text container 2
    let secondTextLine = document.createElement("div");
    secondTextLine.innerHTML = "<h2 id='textLine2' style='display: none'>You are here to explore the movements of pedestrians during the morning peak hour.</h2>";
    secondTextLine.classList.add("presentation");
    secondTextLine.classList.add("presentation-text");
    document.getElementById("mainViz").appendChild(secondTextLine);

    // Padding to push the lines of text upwards
    let paddingDiv = document.createElement("div");
    paddingDiv.innerHTML = "<h2> </h2>";
    paddingDiv.classList.add("presentation");
    paddingDiv.classList.add("presentation-padding");
    document.getElementById("mainViz").appendChild(paddingDiv);


    // skip button
    var button = document.createElement("a");
    button.innerHTML = "<i class=\"fas fa-fast-forward fa-2x\"></i>";
    button.title = "Skip";
    button.setAttribute("role", "button");
    button.setAttribute("onclick", "skipPresentation()");
    button.id = "skipPresentation";
    button.style.display = "none";
    document.getElementById("mainViz").appendChild(button);

    // Shows the title
    let time = 0;
    fadeIn("titleForPres", animTime);
    time += 0 + 2*animTime;

    // Shows the first line of text
    idTO = setTimeout(function() {fadeInFadeOut("textLine1", 5000, animTime);}, time);
    time += 0 + 2*animTime;
    timeOutPres.push(idTO);

    // Shows the second line of text
    idTO = setTimeout(function() {fadeInFadeOut("textLine2", 3000, animTime);}, time);
    time += 3000 + 2*animTime;
    timeOutPres.push(idTO);

    // After the first two lines have disappeard, show the new first line again
    idTO = setTimeout(function() {
            firstTextLine.innerHTML = "<h2 id='textLine1' style='display: none'>This is the western underpass of the station,</h2>";
            fadeIn("textLine1", animTime);}
        , time);
    time += 0 + 1*animTime;
    timeOutPres.push(idTO);

    // Shows the infrastructure. The texts must be re-built over the animation, hence first we delete the old ones
    // before creating them again.
    idTO = setTimeout(function() {

        // Deletes all the first presentation objects
        $(".presentation").remove();
        $(".presentation-text").remove();
        $(".presentation-title").remove();
        $(".presentation-padding").remove();
        $("#skipPresentation").remove();

        // Shows the title again. No transition here as we do not want the reader to notice it changes.
        let titleDiv2Phase = document.createElement("div");
        titleDiv2Phase.innerHTML = "<h1 id='titleForPres' style='display: none'>The walking data</h1>";
        titleDiv2Phase.classList.add("presentationOn3D");
        titleDiv2Phase.classList.add("presentationOn3D-title");

        // Same as title, just replaces the first line of text without the reader noticing
        let firstTextLine = document.createElement("div");
        firstTextLine.innerHTML = "<h2 id='textLine1' style='display: none'>This is the western underpass of the station,</h2>";
        firstTextLine.classList.add("presentationOn3D");
        firstTextLine.classList.add("presentationOn3D-text1");

        document.getElementById("mainViz").appendChild(titleDiv2Phase);
        document.getElementById("mainViz").appendChild(firstTextLine);
        document.getElementById("mainViz").appendChild(button);

        // Sets the viz to 3D and adds the infrastucture in pretty mode.
        viz3D = true;
        prepViz();

        // do not rotate !
        controls.autoRotate = false;

        // Actually shows the title and first line of text.
        fadeIn("titleForPres", 0);
        fadeIn("textLine1", 0);
    }, time);
    time += 0 + 2*animTime;
    timeOutPres.push(idTO);


    // Shows the second line of text
    idTO = setTimeout(function() {
            // Main text container 2
            let secondTextLine = document.createElement("div");
            secondTextLine.innerHTML = "<h2 id='textLine2' style='display: none'>which is used by thousands of humans every morning.</h2>";
            secondTextLine.classList.add("presentationOn3D");
            secondTextLine.classList.add("presentationOn3D-text2");

            document.getElementById("mainViz").appendChild(secondTextLine);
            fadeIn("textLine2", 1000);
        }
        , time);
    time += 0 + 2*animTime;
    timeOutPres.push(idTO);

    // Shows the third line of text
    idTO = setTimeout(function() {
            // Main text container 2
            let thirdTextLine = document.createElement("div");
            thirdTextLine.innerHTML = "<h2 id='textLine3' style='display: none'>Nevertheless, before these commuters have woken up...</h2>";
            thirdTextLine.classList.add("presentationOn3D");
            thirdTextLine.classList.add("presentationOn3D-text3");

            document.getElementById("mainViz").appendChild(thirdTextLine);
            fadeIn("textLine3", 1000);
        }
        , time);
    time += 0 + 2*animTime;
    timeOutPres.push(idTO);


    // transition to TWD theme by first adding a black background.
    idTO = setTimeout(function() {

        // div for the black transition covers entire mainViz object
        let transition = document.createElement("div");
        transition.classList.add("presentationOn3D");
        transition.id = "transition2D3D";
        transition.style.backgroundColor = "black";
        transition.style.display = "none";
        transition.style.height ="100%";

        document.getElementById("mainViz").insertBefore(transition, document.getElementsByClassName("presentationOn3D-title")[0]);

        // make the transition happen
        fadeIn("transition2D3D", 1500);
        fadeOut("titleForPres", 250);
        fadeOut("textLine1",250);
        fadeOut("textLine2",250);
        fadeOut("textLine3",250);


    }, time);
    time += 250;
    timeOutPres.push(idTO);

    // Change color of the text and fade them in again
    idTO = setTimeout(function() {

        document.getElementById("titleForPres").style.color = "#F7F4EA";
        document.getElementById("textLine1").style.color = "#F7F4EA";
        document.getElementById("textLine2").style.color = "#F7F4EA";
        document.getElementById("textLine3").style.color = "#F7F4EA";
        fadeIn("titleForPres",250);
        fadeIn("textLine1",250);
        fadeIn("textLine2",250);
        fadeIn("textLine3",250);

    }, time);
    time += 2000;
    timeOutPres.push(idTO);

    // Add another line of text
    idTO = setTimeout(function() {

        // Text container 4
        let fourthTextLine = document.createElement("div");
        fourthTextLine .innerHTML = "<h2 id='textLine4' style='display: none'>the environment looks more like this !</h2>";
        fourthTextLine .classList.add("presentationOn3D");
        fourthTextLine .classList.add("presentationOn3D-text4");
        fourthTextLine.style.color = "#F7F4EA";

        document.getElementById("mainViz").appendChild(fourthTextLine );

        fadeIn("textLine4",1000);
        fadeOut("transition2D3D");

        document.getElementById("changeStyle").checked = true;
        changeStyle3D();

    }, time);
    time += 1000+animTime;
    timeOutPres.push(idTO);

    // Actually sets the TWD theme.
    idTO = setTimeout(function() {
        fadeOut("titleForPres");
        fadeOut("textLine1");
        fadeOut("textLine2");
        fadeOut("textLine3");
        fadeOut("textLine4");
    }, time);
    time += 2000;
    timeOutPres.push(idTO);

    // Starts the animation to make the zombies appear.
    idTO = setTimeout(function() {
        // remove all div used for showing the texts
        $(".presentationOn3D").remove();

        currentTimeShownIdx = 300;
        runViz();
        controls.autoRotate = false;

        // Move the camera to a given position
        // Defined in visualization/3D/main.js
        moveCameraToDesiredPosition(cameraPresPos);

    }, time);
    time += 10500 + 2*animTime;
    timeOutPres.push(idTO);

    // Becomes serious.
    idTO = setTimeout(function() {

        // Same as title, just replaces the first line of text without the reader noticing
        let firstTextLine = document.createElement("div");
        firstTextLine.innerHTML = "<h2 id='textLine1' style='display: none'>Although this situation seems unrealistic, this work is still serious science.</h2>";
        firstTextLine.style.color = "white";
        firstTextLine.classList.add("presentationOn3D");
        firstTextLine.classList.add("presentationOn3D-title");

        document.getElementById("mainViz").appendChild(firstTextLine);
        fadeIn("textLine1",1000);

    }, time);
    time += 2000;
    timeOutPres.push(idTO);

    // Prepare the transition between 2D and 3D
    idTO = setTimeout(function() {
        let transition = document.createElement("div");
        transition.classList.add("presentationOn3D");
        transition.id = "transition3D2D";
        transition.style.backgroundColor = "#F7F4EA";
        transition.style.display = "none";
        transition.style.height ="100%";

        document.getElementById("mainViz").insertBefore(transition, document.getElementsByClassName("presentationOn3D-title")[0]);

        // make the transition happen
        fadeIn("transition3D2D", 1500);
        fadeOut("textLine1",250);

    }, time);
    time += 250;
    timeOutPres.push(idTO);

    idTO = setTimeout(function() {
        document.getElementById("textLine1").style.color = "#1D1B0D";
        fadeIn("textLine1",250);

    }, time);
    time += 1000;
    timeOutPres.push(idTO);

    idTO = setTimeout(function(){
        transitionBetween2D3D();

    }, time);
    timeOutPres.push(idTO);
    time +=1000;

    // Becomes serious.
    idTO = setTimeout(function() {
        d3.select("#control_checkbox").property("checked", true);
        d3.select("#voronoi_checkbox").property("checked", true);
        checkControl();

        // Same as title, just replaces the first line of text without the reader noticing
        let secondTextLine = document.createElement("div");
        secondTextLine .innerHTML = "<h2 id='textLine1' style='display: none'>The 2D analytics mode allows you to explore some of the specifities of pedestrian dynamics.</h2>";
        secondTextLine .style.color = "#1D1B0D";
        secondTextLine .classList.add("presentationOn3D");
        secondTextLine .classList.add("presentationOn3D-text1");

        document.getElementById("mainViz").appendChild(secondTextLine );
        fadeIn("textLine1",1000);
        fadeOut("transition3D2D",1000);

    }, time);
    time += 2000;
    timeOutPres.push(idTO);

    // Becomes serious.
    idTO = setTimeout(function() {

        // Same as title, just replaces the first line of text without the reader noticing
        let thirdTextLine = document.createElement("div");
        thirdTextLine  .innerHTML = "<h2 id='textLine4' style='display: none'>You can now freely explore The walking data visualization !</h2>";
        thirdTextLine  .style.color = "#1D1B0D";
        thirdTextLine.style.top = "75%";
        thirdTextLine  .classList.add("presentationOn3D");
        thirdTextLine  .classList.add("presentationOn3D-text4");

        document.getElementById("mainViz").appendChild(thirdTextLine);
        fadeIn("textLine4",1000);

    }, time);
    time += 5000;
    timeOutPres.push(idTO);

    idTO = setTimeout(function(){
        fadeOut("textLine1",1000);
        fadeOut("textLine4",1000);
    }, time);
    timeOutPres.push(idTO);
    time +=1000;

    idTO = setTimeout(function(){
        endOfPresentation();
    }, time);
    timeOutPres.push(idTO);
}

/**
 * Skip the presentation (kind of boring after watching it 1000 times...)
 *
 * Takes care of everything to switch from the presentationPlaying state to a "Have fun" state
 */
function skipPresentation() {

    // TODO: careful when the data is not entirely loaded!

    // clears away all the timeouts
    for(let i=0; i<timeOutPres.length; i++) { clearTimeout(timeOutPres[i]) }

    // prepares the viz if skip is called very early on.
    if (!vizPrepared) {
        viz3D = false;

        document.getElementById("changeVizButton").innerHTML = "<i class=\"fas fa-cube fa-lg\"></i>";
        document.getElementById("changeVizButton").title = "3D viz";

        document.getElementById("help").title = "Scroll for zoom/dezoom; Click + Mouse to move around; Click on a zone to select it as an origin and ctrl+click to select it as a destination."

        // Prepare the viz and run it.
        // Both functions defined in js/main/viz.js
        prepViz();
        runViz();
    }

    // Check if the viz was paused and restart it.
    if (vizPaused) {
        // Defined in js/main/viz.js
        runViz()
    }

    // Remove some stuff and say that the presentation is finished
    endOfPresentation();
}

/**
 * Finish the presentation by deleting some divs
 */
function endOfPresentation() {
    presentationPlaying = false;

    // Remove some divs
    $(".presentation").remove();
    $(".presentationOn3D").remove();
    $("#skipPresentation").remove();

    // Show the buttons, the slider, and the timer
    document.getElementById("buttons").style.display = "";
    document.getElementById("slider").style.display = "";
    document.getElementById("timer").style.display = "";
}