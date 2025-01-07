# workout_player

A workout player application written in javascript.

The player works like a media player, but you can upload a workout program that then shows you the exercises to be done, complete with timers, descriptions, progressbar, pictures and videos.

## Dependencies

-   [Ajv](https://github.com/ajv-validator/ajv) - JSON schema validator
-   [Events](https://github.com/browserify/eventsv) - Event emitter
-   [Howler](https://github.com/goldfire/howler.js) - Audio library
-   [Isomorphic DOMPurify](https://github.com/kkomelin/isomorphic-dompurify) - XSS sanitizer
-   [jQuery](https://github.com/jquery/jquery) - HTML DOM manipulation
-   [Marked](https://github.com/markedjs/marked) - Markdown parser

## Demo

https://workout-player.onrender.com/?workout_url=https://raw.githubusercontent.com/muchaco/workout_player/main/example/example.json

## Coming updates

-   QR code for opening in mobile
-   Responsive layout for mobile
-   Store recent workouts in local storage
-   Add unit tests
-   Workout json creator

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/muchaco/workout_player/tags).

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT) - see the [LICENSE.md](https://github.com/muchaco/workout_player/blob/main/LICENSE.md) file for details.
