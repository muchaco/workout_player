import postcss from 'postcss';
import nested from 'postcss-nested';

export default function flattenNestedCSS(cssInput) {
    // Run PostCSS synchronously
    const result = postcss([nested]).process(cssInput, { from: undefined });

    // Return the transformed CSS
    return result.css;
}
