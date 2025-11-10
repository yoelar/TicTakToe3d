import '@testing-library/jest-dom';
// Polyfill structuredClone for Jest (jsdom)
if (typeof global.structuredClone === 'undefined') {
    global.structuredClone = (obj) => {
        return JSON.parse(JSON.stringify(obj));
    };
}

