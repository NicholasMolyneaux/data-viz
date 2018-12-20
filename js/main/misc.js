/*********************************************************/
/*                                                       */
/*   File with some misc functions. (Didn't know where   */
/*   to put them =P)                                     */
/*                                                       */
/*   By Nicholas Molyneaux, Gael Lederrey & Semin Kwak   */
/*                                                       */
/*********************************************************/

/**
 * Get the size of the visualization based on the window size
 *
 * 56 corresponds to the size of the navbar
 */
function getVizHeight() {

    return window.innerHeight - 56;

}

/**
 * Fade in and then fade out
 *
 * @param: id - string of the id of an HTML element
 * @param: time - The time between the fade in and the fade out
 * @param: flashTime - the duration of the fading
 */
function fadeInFadeOut(id, time=1000, flashTime=1000) {

    $.when($("#" + id).fadeIn(flashTime)).then(() => {
        setTimeout(function() {
            $("#" + id).fadeOut(flashTime);
        }, time);
    });
}

/**
 * Fade in
 *
 * @param: id - string of the id of an HTML element
 * @param: flashTime - the duration of the fading
 */
function fadeIn(id, flashTime=1000){

    $.when($("#" + id).fadeIn(flashTime));
}

/**
 * Fade out
 *
 * @param: id - string of the id of an HTML element
 * @param: flashTime - the duration of the fading
 */
function fadeOut(id, flashTime=1000){

    $.when($("#" + id).fadeOut(flashTime));
}

/**
 * Fade in and fade out continuously
 *
 * We do this for the loading screen when the data are being loaded
 *
 * @param: obj - HTML object
 */
function keepFading($obj) {
    if (!trajDataLoaded) {
        $obj.fadeToggle(1000, function () {
            keepFading($obj)
        });
    }
}

/**
 * Transform seconds in HH:mm:ss
 *
 * @param: d - number of seconds since midnight
 */
function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    let hDisplay = h;
    if (h < 10) {
        hDisplay = "0" + hDisplay;
    }

    let mDisplay = m;
    if (m < 10) {
        mDisplay = "0" + mDisplay;
    }

    let sDisplay = s;
    if (s < 10) {
        sDisplay = "0" + sDisplay;
    }
    return hDisplay + ":" + mDisplay + ":" + sDisplay;
}

/**
 * Transform seconds in HH:mm:ss.sss (milliseconds)
 *
 * @param: d - number of seconds since midnight
 */
function secondsToHmss(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    var ss = Math.round(10*(d - Math.floor(d)));

    let hDisplay = h;
    if (h < 10) {
        hDisplay = "0" + hDisplay;
    }

    let mDisplay = m;
    if (m < 10) {
        mDisplay = "0" + mDisplay;
    }

    let sDisplay = s;
    if (s < 10) {
        sDisplay = "0" + sDisplay;
    }
    return hDisplay + ":" + mDisplay + ":" + sDisplay + "." + ss;
}

/**
 * Intersection of keys between two objects
 */
function intersection(o1, o2) {
    return Object.keys(o1).filter({}.hasOwnProperty.bind(o2));
}