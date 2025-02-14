import Ajv from 'ajv';
import eventBus from '../eventBus.js';
import { globalStore } from '../stateManager.js';

export async function validateJson(json) {
    try {
        const response = await fetch(
            `/schema/workout_schema_v${json.schema_version}.json`
        );
        if (!response.ok) {
            throw new Error(`Error loading JSON file: ${response.statusText}`);
        }
        const schema = await response.json();
        const ajv = new Ajv();
        const validate = ajv.compile(schema);
        const valid = validate(json);
        eventBus.put('loaded', null);
        if (!valid) {
            throw new Error(
                'Invalid Workout file, please upload a valid Workout file.'
            );
        } else {
            setWorkout(json);
        }
    } catch (error) {
        eventBus.put('toast', ['warning', error.message]);
    }
}

export function setWorkout(json) {
    globalStore.set('excercises', json.excercises);
    globalStore.set('workout_name', json.name);
    globalStore.set('workout_description', json.description);
    globalStore.set('schema_version', json.schema_version);
    globalStore.set('show_summary', true);
    globalStore.set('finished', false);
}

export function handleFileUpload(event) {
    const file = event.target.files[0];
    eventBus.put('loading');
    if (file.type !== 'application/json') {
        eventBus.put('toast', [
            'warning',
            'Not a JSON file, please upload a valid WorkoutJSON file.',
        ]);
        return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', async (event) => {
        const workout = JSON.parse(event.target.result);
        await validateJson(workout);
    });
    reader.readAsText(file);
}
