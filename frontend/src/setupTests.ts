// src/setupTests.ts
// ✅ Import polyfills FIRST, before anything else
import 'whatwg-fetch';  // adds global fetch, Response, Request, Headers
import '@testing-library/jest-dom';

// Polyfill TextEncoder/TextDecoder for jsdom
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Polyfill MessageChannel for jsdom
import { MessageChannel } from 'worker_threads';
global.MessageChannel = MessageChannel as any;

// Polyfill BroadcastChannel (must come AFTER MessageChannel)
import 'broadcastchannel-polyfill';

// Polyfill Web Streams API (ReadableStream, WritableStream, TransformStream, etc.)
import { ReadableStream, WritableStream, TransformStream } from 'stream/web';
global.ReadableStream = ReadableStream as any;
global.WritableStream = WritableStream as any;
global.TransformStream = TransformStream as any;

// Polyfill structuredClone for Jest (jsdom)
if (typeof global.structuredClone === 'undefined') {
    global.structuredClone = (obj) => {
        return JSON.parse(JSON.stringify(obj));
    };
}

// ✅ NOW import server after polyfills are loaded
import { server } from './mocks/server';

// Establish API mocking before all tests.
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Reset any request handlers that are declared as part of our tests (so they don't affect others)
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => {
    server.close();
    // Give MSW time to clean up
    return new Promise(resolve => setTimeout(resolve, 100));
});