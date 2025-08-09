import pino from "pino";
import pretty from "pino-pretty";

const stream = pretty({ colorize: true, ignore: "pid,hostname" });

// Pino configuration
const logger = pino(
	{
		level: process.env.NODE_ENV === "production" ? "info" : "debug",
		formatters: {
			level: (label) => {
				return { level: label };
			},
		},
		timestamp: pino.stdTimeFunctions.isoTime,
		...(process.env.NODE_ENV === "production" && {
			// Prod
			serializers: pino.stdSerializers,
		}),
	},
	process.env.NODE_ENV === "production" ? undefined : stream,
);

export default logger;
