import * as sounds from "./sounds.js";
import $ from "jquery";
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import Ajv from "ajv"
import './style.css'
import EventEmitter from "events";


const url_params = new URLSearchParams(location.search);
const json_url = url_params.get("workout_url");

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
    if (valid) {
        update_workout(workout);
    } else {
        console.log("Invalid Workout file, please upload a valid Workout file.");
        $(".warning").html("Invalid Workout file, please upload a valid Workout file.");
    }
});

function main() { 
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
        add_overlay_content(
            `<p><button class="w3-button w3-round w3-theme-l2" id="upload">Upload workout</button></p>
             <p class="warning"></p>`
        )
        $("#upload").on("click", () => { $("#file-upload").trigger("click"); })
    }
}

function update_excercise_number(param) {
    if (!param) {
        $("#excercise-number").empty();
        console.log(`Updating excercise repetition/countdown with empty string`);
        return;
    }
    $("#excercise-number").html(DOMPurify.sanitize(param));
    console.log(`Updating excercise repetition/countdown with ${param}`);
}

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

function activate_excercise(index) {
    $(".excercise-name").removeClass("active");
    $(`#excercise-${index}`).addClass("active");
    console.log(`Activating item at index ${index}`);
}

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

function restart() {
    start();
}

function start() {
    fill_excercise_list();
    jump_to_excercise_index(0);
    $(".overlay").fadeOut();
}

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

function previous() {
    if (current_index > 0) {
        jump_to_excercise_index(current_index - 1);
    }
}

function next() {
    if (current_index < list.length - 1) {
        jump_to_excercise_index(current_index + 1);
    }
}

function handle_file_upload(event) {
    const file = event.target.files[0];

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

function add_overlay_content(content) {
    $(".overlay-content").html(DOMPurify.sanitize(content));
    $(".overlay").fadeIn()
}

function validate_json(json) {
    console.log(`Validating JSON file ${json}`)
    read_schema_file(function(schema) {
        const ajv = new Ajv();
        const validate = ajv.compile(schema);
        const valid = validate(json);
        if (!valid) {
            console.log(validate.errors);
        }
        ee.emit("json_validated", valid, json)
    });
}


function read_schema_file(callback) {
    $.ajax({
        type: "GET",
        url: schemaUrl,
        dataType: "json",
        success: function(response) {
            callback(response);
        }
    });
}

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

main();
