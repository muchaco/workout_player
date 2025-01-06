import Ajv from "ajv";
import EventEmitter from "events";
import DOMPurify from 'isomorphic-dompurify';
import $ from "jquery";
import { marked } from 'marked';
import * as sounds from "./sounds.js";
import './style.css';

let list = null;
let current_index = null;
let countdown_interval = null;
let is_paused = false;
let progressbar_interval = null;
let ee = new EventEmitter();

// event listeners

$("#excercise-list").on("click", "li", function () { // Click on excercise name in list
    const index = $(this).index();
    jump_to_excercise_index(index);
});

$("#file-upload").on("change", handle_file_upload);
$("#menu-pause").on("click", () => {
    if (!$("#menu-pause").hasClass("w3-disabled")) {
        pause();
    }
});
$("#menu-play").on("click", () => {
    if (!$("#menu-play").hasClass("w3-disabled")) {
        pause();
    }
});
$("#menu-previous").on("click", previous);
$("#menu-next").on("click", next);
$("#menu-restart").on("click", restart);
$("#menu-finish").on("click", finish);
ee.on('json_validated', (valid, workout) => {
    toggle_spinner();
    if (valid) {
        update_workout(workout);
    } else {
        console.log("Invalid Workout file, please upload a valid Workout file.");
        $(".warning").html("Invalid Workout file, please upload a valid Workout file.");
    }
});

/**
 * Main function to initialize the workout timer application.
 *
 * This function performs the following tasks:
 * - Removes the 'w3-hide' class from elements with the 'container' class.
 * - Logs a message indicating the start of the workout timer.
 * - If a JSON URL is provided, it makes an AJAX GET request to fetch the JSON data.
 * - If the AJAX request is successful, it calls the `validate_json` function.
 * - If the AJAX request fails, it logs an error message.
 * - If no JSON URL is provided, it toggles the spinner and adds overlay content
 *   with an upload button for the user to upload a workout file.
 * - Sets up an event listener on the upload button to trigger the file upload input.
 */
function main() {
    const url_params = new URLSearchParams(location.search);
    const json_url = url_params.get("workout_url");

    $('.container').removeClass('w3-hide');
    console.log("Starting Workout Timer");
    if (json_url) {
        $.ajax({
            type: "GET",
            url: json_url,
            dataType: "json",
            success: validate_json,
            error: function (xhr, status, error) {
                console.log(`Error loading JSON file: ${error}`);
            }
        });
    } else {
        toggle_spinner();
        add_overlay_content(
            `<p><button class="w3-button w3-round w3-theme-l2" id="upload">Upload workout</button></p>
             <p class="warning"></p>`
        )
        $("#upload").on("click", () => { $("#file-upload").trigger("click"); })
    }
}

/**
 * Updates the exercise number displayed on the page.
 *
 * This function updates the HTML content of the element with the ID "excercise-number".
 * If the provided parameter is falsy, it clears the content of the element.
 * Otherwise, it sanitizes the parameter using DOMPurify and sets it as the HTML content of the element.
 *
 * @param {string} param - The new exercise number to display. If falsy, the content will be cleared.
 */
function update_excercise_number(param) {
    if (!param) {
        $("#excercise-number").empty();
        console.log(`Updating excercise repetition/countdown with empty string`);
        return;
    }
    $("#excercise-number").html(DOMPurify.sanitize(param));
    console.log(`Updating excercise repetition/countdown with ${param}`);
}

/**
 * Updates the exercise media content in the DOM.
 *
 * @param {string} param - The media content to be updated. If the parameter is an empty string or null, the media content will be cleared. If the parameter is a URL starting with "http", it will be treated as an image source. Otherwise, it will be treated as HTML content.
 */
function update_excercise_media(param) {
    if (!param) {
        $("#excercise-media").empty();
        console.log(`Updating excercise media with empty string`);
        return;
    }
    if (param.startsWith("http")) {
        $("#excercise-media").html(DOMPurify.sanitize(`<img src="${param}" alt="media">`));
        console.log(`Updating excercise media with image from ${param}`);
    } else {
        $("#excercise-media").html(DOMPurify.sanitize(param));
        console.log(`Updating excercise media with ${param}`);
    }
}

/**
 * Updates the exercise description by converting the provided markdown text to sanitized HTML
 * and inserting it into the element with the ID "excercise-description".
 *
 * @param {string} markdown_text - The markdown text to be converted and inserted. If empty or null,
 * the description will be cleared.
 */
function update_excercise_description(markdown_text) {
    if (!markdown_text) {
        $("#excercise-description").empty();
        console.log(`Updating excercise description with empty string`);
        return;
    }
    const html_text = marked.parse(markdown_text);
    $("#excercise-description").html(DOMPurify.sanitize(html_text));
    console.log(`Updating excercise description with markdown text: ${markdown_text}`);
}

/**
 * Fills the exercise details based on the provided exercise object.
 *
 * @param {Object} excercise - The exercise object containing details to be filled.
 * @param {string} [excercise.type] - The type of exercise, either "rest" or "exercise".
 * @param {number} [excercise.countdown] - The countdown time for the exercise or rest period.
 * @param {string} [excercise.description] - The description of the exercise.
 * @param {string} [excercise.media] - The media associated with the exercise.
 * @param {string} [excercise.name] - The name of the exercise.
 * @param {number} [excercise.repetition] - The number of repetitions for the exercise.
 */
function fill_excercise(excercise) {
    if (!excercise) {
        update_excercise_number();
        update_excercise_description();
        update_excercise_media();
        update_progressbar(0);
    } else if (excercise.type === "rest") {
        update_excercise_number(excercise.countdown);
        update_excercise_description("# Rest period")
        update_excercise_media();
        update_progressbar(excercise.countdown);
    } else if (excercise.type === "excercise") {
        update_excercise_description(excercise.description);
        update_excercise_media(excercise.media);
        if (excercise.countdown) {
            update_excercise_number(excercise.countdown);
            update_progressbar(excercise.countdown);
        } else {
            console.log(`Excercise ${excercise.name} has no countdown, setting progressbar to 0`);
            update_excercise_number(excercise.repetition);
            update_progressbar(0);
        }
    }
}

/**
 * Populates the exercise list in the HTML with the provided list of exercises.
 * The list items are sanitized using DOMPurify before being added to the DOM.
 *
 * The function iterates over the global `list` array and generates HTML content
 * based on the type of each item (exercise or rest). It handles exercises with
 * countdowns or repetitions and logs a message if an exercise has neither.
 *
 * If an item has an unknown type, it logs an error message.
 *
 * The generated HTML is then inserted into the element with the ID `excercise-list`.
 *
 * @global {Array} list - The array of exercise objects to be displayed.
 * @property {string} list[].type - The type of the item, either "excercise" or "rest".
 * @property {string} list[].name - The name of the exercise.
 * @property {number} [list[].countdown] - The countdown time in seconds for the exercise or rest.
 * @property {number} [list[].repetition] - The number of repetitions for the exercise.
 */
function fill_excercise_list() {
    let content = '<ul class="w3-ul w3-hoverable">';
    for (let i = 0; i < list.length; i++) {
        content += `<li class="excercise-name" id="excercise-${i}">`;
        if (list[i].type === "excercise") {
            if (list[i].countdown) {
                content += `${list[i].name} (${list[i].countdown} sec)`;
            } else if (list[i].repetition) {
                content += `${list[i].name} (${list[i].repetition} reps)`;
            } else {
                console.log(`Excercise ${list[i].name} has no repetition or countdown`);
            }
        } else if (list[i].type === "rest") {
            content += `Rest (${list[i].countdown} sec)`;
        } else { // Unknown type of excercise
            console.log(`Unknown type of excercise: ${list[i].type})`);
        }
        content += "</li>";
    }
    content += "</ul>";
    $("#excercise-list").html(DOMPurify.sanitize(content));
    console.log(`Updating left pane with new list items`);
}

/**
 * Jumps to the specified exercise index, updates the current exercise, and starts the countdown if not paused.
 *
 * @param {number} index - The index of the exercise to jump to.
 */
function jump_to_excercise_index(index) {
    current_index = index;
    fill_excercise(list[index]);
    activate_excercise(index);
    if (!is_paused) {
        clearInterval(countdown_interval);
        countdown_interval = setInterval(countdown, 1000);
        console.log(`Starting countdown for item at index ${index}`);
    }
}

/**
 * Activates the exercise at the given index by adding the 'active' class to the corresponding element
 * and removing the 'active' class from all other exercise elements.
 *
 * @param {number} index - The index of the exercise to activate.
 */
function activate_excercise(index) {
    $(".excercise-name").removeClass("active");
    $(`#excercise-${index}`).addClass("active");
    console.log(`Activating item at index ${index}`);
}

/**
 * Handles the countdown for the current exercise.
 *
 * This function retrieves the current countdown value from the DOM, decrements it,
 * and updates the display. It also plays sounds based on the countdown value and
 * transitions to the next exercise or finishes the workout when appropriate.
 */
function countdown() {
    let actual_countdown = $("#excercise-number").text();
    console.log(`Countdown value: ${actual_countdown}`)
    if (list[current_index].countdown === undefined) {
        clearInterval(countdown_interval);
        return
    }
    var next_value = parseInt(actual_countdown) - 1;
    if (next_value > 0) {
        if (next_value < 4) {
            sounds.click.play();
        }
        update_excercise_number(next_value);
    } else {
        if (current_index < list.length - 1) {
            sounds.gong.play();
            jump_to_excercise_index(current_index + 1);
        } else {
            finish();
        }
    }
}

/**
 * Completes the workout routine by performing the following actions:
 * - Plays a whistle sound to indicate the end of the workout.
 * - Clears the intervals for the progress bar and countdown timers.
 * - Fills in the exercise and exercise list elements.
 * - Removes the "active" class from the exercise name elements.
 * - Adds an overlay content with options to restart the workout or upload another workout.
 * - Sets up event listeners for the "Restart workout" and "Upload another workout" buttons.
 * - Logs a message to the console indicating that the countdown has finished.
 */
function finish() {
    sounds.whistle.play();
    clearInterval(progressbar_interval);
    clearInterval(countdown_interval);
    fill_excercise();
    fill_excercise_list();
    $(".excercise-name").removeClass("active");
    add_overlay_content(
        `<p>Workout finished</p>
         <p>
           <button class="w3-button w3-round w3-theme-l2" id="restart">Restart workout</button>
           <button class="w3-button w3-round w3-theme-l2" id="upload">Upload another workout</button>
         <p>
         <p class="warning"></p>`
    );
    $("#restart").on("click", restart);
    $("#upload").on("click", () => { $("#file-upload").trigger("click"); })

    console.log(`Countdown finished, displaying "Finished" message`);
}

/**
 * Restarts the application by calling the start function.
 */
function restart() {
    start();
}

/**
 * Initializes the workout player by populating the exercise list,
 * jumping to the first exercise, and fading out the overlay.
 */
function start() {
    fill_excercise_list();
    jump_to_excercise_index(0);
    $(".overlay").fadeOut();
}

/**
 * Toggles the pause state of the workout player.
 *
 * When the player is paused, it stops the countdown and progress bar intervals,
 * and updates the UI to reflect the paused state.
 * When the player is resumed, it restarts the countdown and progress bar intervals,
 * and updates the UI to reflect the playing state.
 *
 * @global
 * @function pause
 */
function pause() {
    if (is_paused) {
        countdown_interval = setInterval(countdown, 1000);
        progressbar_interval = setInterval(frame, 10);
        is_paused = false;
        $("#menu-play").addClass("w3-disabled");
        $("#menu-pause").removeClass("w3-disabled");
    } else {
        clearInterval(countdown_interval);
        clearInterval(progressbar_interval);
        is_paused = true;
        $("#menu-pause").addClass("w3-disabled");
        $("#menu-play").removeClass("w3-disabled");
    }
}

/**
 * Navigates to the previous exercise in the workout sequence.
 * If the current exercise is not the first one, it decreases the current index by one
 * and jumps to the corresponding exercise.
 */
function previous() {
    if (current_index > 0) {
        jump_to_excercise_index(current_index - 1);
    }
}

/**
 * Advances to the next exercise in the list if there is one.
 * Calls the `jump_to_excercise_index` function with the next index.
 */
function next() {
    if (current_index < list.length - 1) {
        jump_to_excercise_index(current_index + 1);
    }
}

/**
 * Handles the file upload event, reads the uploaded file, and processes it if it is a valid JSON file.
 *
 * @param {Event} event - The file upload event triggered by the input element.
 * @returns {void}
 */
function handle_file_upload(event) {
    const file = event.target.files[0];

    toggle_spinner();
    if (file.type !== "application/json") {
        console.log("Not a JSON file, please upload a valid WorkoutJSON file.");
        $(".warning").html("Not a JSON file, please upload a valid WorkoutJSON file.");
        return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", (event) => {
        const workout = JSON.parse(event.target.result);
        validate_json(workout);
    });
    reader.readAsText(file);
}

/**
 * Updates the workout display with the provided workout details.
 *
 * This function clears any existing countdown interval, updates the workout
 * name and description, and adds overlay content with options to start the
 * workout or upload another workout. It also sets up event listeners for
 * the start and upload buttons.
 *
 * @param {Object} workout - The workout object containing details to update.
 * @param {string} workout.name - The name of the workout.
 * @param {string} workout.description - The description of the workout in Markdown format.
 * @param {Array} workout.excercises - The list of exercises in the workout.
 */
function update_workout(workout) {
    list = workout.excercises;
    clearInterval(countdown_interval);
    let workout_name = workout.name;
    let workout_description = marked.parse(workout.description);
    add_overlay_content(
        `<p>${workout_name}</p>
         <div>${workout_description}</div>
         <p>
           <button class="w3-button w3-round w3-theme-l2" id="start">Start workout</button>
           <button class="w3-button w3-round w3-theme-l2" id="upload">Upload another workout</button>
         <p>
         <p class="warning"></p>`
    );
    $("#start").on("click", start);
    $("#upload").on("click", () => { $("#file-upload").trigger('click'); });
}

/**
 * Adds sanitized content to the overlay and displays the overlay.
 *
 * @param {string} content - The HTML content to be added to the overlay.
 */
function add_overlay_content(content) {
    $(".overlay-content").html(DOMPurify.sanitize(content));
    $(".overlay").fadeIn()
}

/**
 * Validates a JSON object against a schema.
 *
 * @param {Object} json - The JSON object to be validated.
 * @fires json_validated - Emits an event indicating whether the JSON is valid or not.
 */
function validate_json(json) {
    console.log(`Validating JSON file ${json}`)
    read_schema_file(function (schema) {
        const ajv = new Ajv();
        const validate = ajv.compile(schema);
        const valid = validate(json);
        if (!valid) {
            console.log(validate.errors);
        }
        ee.emit("json_validated", valid, json)
    });
}

/**
 * Reads the workout schema file and executes the callback with the response.
 *
 * @param {function(Object): void} callback - The function to call with the JSON response.
 */
function read_schema_file(callback) {
    $.ajax({
        type: "GET",
        url: "/schema/workout_schema_v1.json",
        dataType: "json",
        success: function (response) {
            callback(response);
        }
    });
}

/**
 * Updates the progress bar based on the given duration.
 * Clears any existing interval for the progress bar and resets its width to 0%.
 * If the duration is 0, the function returns immediately.
 * If the progress bar is not paused, it sets a new interval to update the progress bar.
 *
 * @param {number} duration - The duration for which the progress bar should run.
 */
function update_progressbar(duration) {
    clearInterval(progressbar_interval);
    $("#progressbar").width("0%");
    if (duration === 0) {
        return;
    }
    if (!is_paused) {
        progressbar_interval = setInterval(frame, 10);
    }
}

/**
 * Updates the width of the progress bar based on the countdown interval.
 * If the width reaches or exceeds 100%, the interval is cleared.
 */
function frame() {
    let interval = 1 / list[current_index].countdown;
    let width = parseFloat($("#progressbar").width()) / parseFloat($("#progressbar").parent().width()) * 100;
    if (width >= 100) {
        clearInterval(progressbar_interval);
    } else {
        width += interval;
        $("#progressbar").width(Math.min(width, 100) + '%');
    }
}

/**
 * Toggles the visibility of the spinner element with the class "loading".
 * Logs a message to the console when toggling.
 */
function toggle_spinner() {
    console.log("Toggling spinner")
    $(".loading").fadeToggle();
}

main();
