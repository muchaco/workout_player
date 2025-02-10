# workout_player

A workout player application written in javascript.

The player functions like a media player, allowing you to upload a workout program that displays exercises with timers, descriptions, progress bars, pictures, and videos.

## Dependencies

-   [Ajv](https://github.com/ajv-validator/ajv) - JSON schema validator
-   [Isomorphic DOMPurify](https://github.com/kkomelin/isomorphic-dompurify) - XSS sanitizer
-   [Marked](https://github.com/markedjs/marked) - Markdown parser
-   [PostCSS](https://github.com/postcss/postcss) - Transforming styles with JS plugins
-   [PostCSS-nested](https://github.com/postcss/postcss-nested) - Nested CSS support for PostCSS

## Demo

https://workout-player.onrender.com/?workout_url=https://raw.githubusercontent.com/muchaco/workout_player/main/example/example.json

## Coming updates

-   QR code for opening in mobile
-   Responsive layout for mobile
-   Add unit tests
-   Workout json creator

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/muchaco/workout_player/tags).

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT) - see the [LICENSE.md](https://github.com/muchaco/workout_player/blob/main/LICENSE.md) file for details.
