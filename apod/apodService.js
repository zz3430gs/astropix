/**
 * Created by zz3430gs on 10/17/2017.
 */
var request = require('request');
var moment = require('moment');

/* Makes requests to NASA's APOD service using request.
 A callback checks for errors and then calls a method to
 process the JSON and return a page to the client.
 If today is specified, fetch today's image,
 otherwise, fetch a random image. */

var baseURL = 'https://api.nasa.gov/planetary/apod';

function apodRequest(callback, random) {

    // callback({message: 'Not really an error'});
    // Uncomment the line above to force the error page to display.

    var queryParam = {};
    var APIKEY = process.env.APOD_API_KEY;  // Make sure an environment variable is set, containing a valid APOD key

    if (random) {
        queryParam = { 'api_key' : APIKEY,  "date" :randomDateString()  };
    }
    else {
        queryParam = { "api_key" : APIKEY };
    }

    //Use request module to request picture from APOD service.
    //Must handle result in callback.
    request( {uri :baseURL, qs: queryParam} , function(error, apod_response, body){

        if (!error && apod_response.statusCode == 200){
            //No error, and there is a response from APOD. Expect the response to be a string.
            console.log("NASA SAYS \n" + JSON.stringify(body));
            var apodJSON = JSON.parse(body);   //Convert JSON text to a JavaScript object
            var jsonForTemplate = processAPODresponse(random, apodJSON);  // Rearrange JSON into a more useful format for display in the template
            callback(null, jsonForTemplate);
        }

        else {
            //Log error info to console and return error with message.
            console.log("Error in JSON request: " + error);
            console.log(apod_response);
            console.log(body);
            callback(Error("Error fetching data from the APOD service"));
        }
    });
}


/* Reformat the response for use in the template.
 * Generates an appropriate credit message,
 * attempts to detect if the response actually is an image (sometimes it's a video)
 * Creates a link back to the image detail page as NASA's site
 * and generates a formatted date for display.  */

function processAPODresponse(isRandom, apodJSON){

    /* APOD includes a copyright attribute, but only if the image is under copyright.
     Add a parameter for copyright or image credit, depending if there is a copyright holder
     NASA's images are in the public domain so no copyright. Instead, provide an image credit.*/

    if (apodJSON.hasOwnProperty("copyright")) {
        apodJSON.credit = "Image credit and copyright: " + apodJSON.copyright;
    } else {
        apodJSON.credit = "Image credit: NASA";
    }

    /* Some of the images are videos, which we can't display (at least, in this version of this app)
     Add a flag so can differentiate between images and other media
     Some responses are missing the media_type attribute, so also
     check for image file extensions in the URL  */

    if (apodJSON.media_type == 'image') {
        apodJSON.is_image = true;
    } else {
        var image_extensions = ['.jpg', '.gif', '.jpeg', '.png'];  //others?
        for (var ex = 0 ; ex < image_extensions.length ; ex++) {
            if (apodJSON.url.endsWith(image_extensions[ex])) {
                apodJSON.is_image = true;
            }
        }
    }

    //Create the NASA link to the image's page

    /* The url provided is just for the image resource itself.
     Would also like to provide a link to the NASA page about the image.
     For today's image, the link is http://apod.nasa.gov/apod/
     For another day's image (e.g Feb 1 2016), the link includes
     the date, in the format http://apod.nasa.gov/apod/ap160201.html  */

    var baseURL = "http://apod.nasa.gov/apod/";

    if (isRandom) {
        var imgDate = moment(apodJSON.date);
        var filenameDate = imgDate.format("YYMMDD");
        var filename = "ap" + filenameDate + ".html";
        var url = baseURL + filename;
        apodJSON.nasa_url = url;
    }

    else {
        apodJSON.nasa_url = baseURL;
    }

    console.log("AFTER PROCESSING \n" + JSON.stringify(apodJSON));  //for debugging

    return apodJSON;

}


//APOD started on June 16th, 1995. Select a random date between
//then and yesterday.  Convert to a string in YYYY-MM-DD format.
function randomDateString(){

    //Create data objects for yesterday, and APOD start date
    var today = moment().subtract(1, 'days');
    var APODstart = moment('1995-06-16');

    //Convert to Unix time in milliseconds since Jan 1, 1970
    var todayUnix = today.valueOf();

    var APODstartUnix = APODstart.valueOf();

    //How many milliseconds between APOD start and now?
    var delta = todayUnix - APODstartUnix;

    //Generate a random number between 0 and (number of milliseconds between APOD start and now)
    var offset = Math.floor((Math.random() * delta));

    //Add random number to APOD start
    var randomUnix = APODstartUnix + offset;

    //And then turn this number of seconds back into a date
    var randomDate = moment(randomUnix);

    //And format this date as "YYYY-MM-DD", the format required in the
    //APOD API calls.
    return randomDate.format('YYYY-MM-DD');


}

module.exports = apodRequest;
