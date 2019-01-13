// Polyfill for Number.isNaN().
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN
Number.isNaN = Number.isNaN || function(value) {
    return typeof value === 'number' && isNaN(value);
};
// Or
// Number.isNaN = Number.isNaN || function(value) {
//     return value !== value;
// }