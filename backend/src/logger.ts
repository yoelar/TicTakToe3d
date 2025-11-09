import pino from 'pino';
import path from 'path';
import fs from 'fs';

const LOG_DIR = path.resolve(__dirname, '../../logs');

// Ensure logs directory exists (for prod)
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

const isDev = process.env.NODE_ENV !== 'production';
const logLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();

// Prepare silent logger (for LOG_LEVEL=none)
const silentLogger = pino({ enabled: false });

// --- Build transport config ---
let transport: pino.TransportMultiOptions | undefined;

if (isDev) {
    transport = {
        targets: [
            {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'HH:MM:ss.l',
                    ignore: 'pid,hostname',
                },
            },
        ],
    };
} else {
    transport = {
        targets: [
            {
                target: 'pino/file',
                options: {
                    destination: path.join(LOG_DIR, `app-${new Date().toISOString().slice(0, 10)}.log`),
                    mkdir: true,
                },
            },
        ],
    };
}

// --- Build root logger ---
export const rootLogger =
    logLevel === 'none'
        ? silentLogger
        : pino({
            level: logLevel,
            transport,
            base: undefined,
            timestamp: pino.stdTimeFunctions.isoTime,
        });

// --- Named loggers (for modules/components) ---
export const getLogger = (component: string) =>
    rootLogger.child({ component });
