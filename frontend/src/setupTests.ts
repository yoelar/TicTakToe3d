// src/setupTests.ts
import { server } from './mocks/server';
import '@testing-library/jest-dom';

// Some jsdom environments don't have global Response/Request
import 'whatwg-fetch';  // ✅ adds global fetch, Response, Request, Headers


// Polyfill structuredClone for Jest (jsdom)
if (typeof global.structuredClone === 'undefined') {
    global.structuredClone = (obj) => {
        return JSON.parse(JSON.stringify(obj));
    };
}

// Establish API mocking before all tests.
beforeAll(() => server.listen());

// Reset any request handlers that are declared as part of our tests (so they don’t affect others)
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());
