import pino from 'pino';

const transport = pino.transport({
    targets: [
        {
            target: 'pino/file',
            options: { destination: process.env.LOG_FILE_PATH },
        },
        {
            target: 'pino-pretty',
        },
    ],
});

const logger = pino(
    {
        level: process.env.PINO_LOG_LEVEL || 'info',
        timestamp: pino.stdTimeFunctions.isoTime,
    },
    transport
);

export default logger;