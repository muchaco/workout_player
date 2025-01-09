const sounds = new Map([
    ['gong', new Audio('/audio/gong.mp3')],
    ['click', new Audio('/audio/click.mp3')],
    ['whistle', new Audio('/audio/whistle.mp3')],
]);

export default function playSound(sound) {
    const audio = sounds.get(sound);
    if (audio) {
        audio.play();
    }
}
