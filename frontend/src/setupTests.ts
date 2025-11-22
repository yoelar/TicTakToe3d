// src/setupTests.ts
// ---------------------------------------------------------------------------
// ✅ TextEncoder/TextDecoder/TransformStream Polyfills (Required for MSW)
// ---------------------------------------------------------------------------
import { TextEncoder, TextDecoder } from 'util';
import { ReadableStream, WritableStream, TransformStream } from 'stream/web';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
global.ReadableStream = ReadableStream as any;
global.WritableStream = WritableStream as any;
global.TransformStream = TransformStream as any;
// Source - https://stackoverflow.com/a/79504374
// Posted by Francesco Borzi
// Retrieved 2025-11-17, License - CC BY-SA 4.0

global.structuredClone = jest.fn((val): unknown =>
    JSON.parse(JSON.stringify(val)),
);


// ---------------------------------------------------------------------------
// ✅ BroadcastChannel Polyfill (Required for MSW)
// ---------------------------------------------------------------------------
if (!global.BroadcastChannel) {
    global.BroadcastChannel = class BroadcastChannel {
        name: string;
        onmessage: ((event: any) => void) | null = null;
        onmessageerror: ((event: any) => void) | null = null;

        constructor(name: string) {
            this.name = name;
        }

        postMessage(_message: any) { }
        close() { }
        addEventListener(_type: string, _listener: any) { }
        removeEventListener(_type: string, _listener: any) { }
        dispatchEvent(_event: Event): boolean { return true; }
    } as any;
}

// ---------------------------------------------------------------------------
// ✅ Basic Polyfills
// ---------------------------------------------------------------------------
import 'whatwg-fetch';
import '@testing-library/jest-dom';

// ---------------------------------------------------------------------------
// ✅ Crypto.randomUUID Polyfill
// ---------------------------------------------------------------------------
if (!global.crypto) {
    (global as any).crypto = {};
}
if (!global.crypto.randomUUID) {
    global.crypto.randomUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    };
}

// ---------------------------------------------------------------------------
// ✅ IntersectionObserver Polyfill (if needed)
// ---------------------------------------------------------------------------
if (!global.IntersectionObserver) {
    global.IntersectionObserver = class IntersectionObserver {
        constructor() { }
        disconnect() { }
        observe() { }
        takeRecords() { return []; }
        unobserve() { }
    } as any;
}

// ---------------------------------------------------------------------------
// ✅ matchMedia Polyfill (if needed)
// ---------------------------------------------------------------------------
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// ❌ REMOVED: WebSocket mock (no longer needed)
// jest.mock('./services/WebSocketService', ...);

// ---------------------------------------------------------------------------
// ✅ Setup Mock Service Worker (MSW)
// ---------------------------------------------------------------------------
import { server } from './mocks/server';

beforeAll(() => {
    // Start MSW server
    server.listen({ onUnhandledRequest: 'bypass' });

    // Quiet down console logs during tests
    jest.spyOn(console, 'log').mockImplementation(() => { });
    jest.spyOn(console, 'warn').mockImplementation(() => { });
    jest.spyOn(console, 'error').mockImplementation(() => { });
});

afterEach(() => {
    // Reset MSW handlers after each test
    server.resetHandlers();

    // Clear all mocks
    jest.clearAllMocks();

    // Clear localStorage
    localStorage.clear();

    // Clear all timers
    jest.clearAllTimers();
});

afterAll(() => {
    // Close MSW server
    server.close();

    // Restore all mocks
    jest.restoreAllMocks();

    // Final timer cleanup
    jest.clearAllTimers();
});