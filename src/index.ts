import express, { Request, Response } from "express";
import Redis from "ioredis";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { validateJwtMiddleware } from "./middleware";
import { swaggerDocs } from "./swagger";

dotenv.config();

export const app = express();
app.use(express.json());

export const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT!),
    password: process.env.REDIS_PASSWORD,
});

// Apply JWT validation middleware to all routes
app.use(validateJwtMiddleware);

// Routes
/**
 * @swagger
 * /value:
 *   get:
 *     summary: Retrieve a value from the environment
 *     tags: [Values]
 *     parameters:
 *       - in: query
 *         name: key
 *         required: true
 *         description: The key for the value
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved value
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: string
 *       400:
 *         description: No key provided
 *       404:
 *         description: Value not found
 *       500:
 *         description: Server error
 */
app.get(`/value`, async (request: Request, response: Response) => {
    try {
        const key = request.query.key as string;
        if (!key) {
            return response.status(400).json({ error: "Invalid key" });
        }

        const secret = process.env[`VALUE_${key.toUpperCase().trim()}`];
        if (secret) {
            response.json({ data: secret });
        } else {
            response.status(404).json({ error: "Not found" });
        }
    } catch (error) {
        console.error(error)
        response.status(500).json({ error: "Server error" });
    }
});

/**
 * @swagger
 * /store:
 *   get:
 *     summary: Retrieve a value from the store
 *     tags: [Store]
 *     parameters:
 *       - in: query
 *         name: key
 *         required: true
 *         description: The key for the store value
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved value
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: string
 *       400:
 *         description: No key provided
 *       404:
 *         description: Key not found
 *       500:
 *         description: Server error
 */
app.get('/store', async (request: Request, response: Response) => {
    try {
        const key = request.query.key as string;
        if (!key) {
            return response.status(400).json({ error: "Invalid key" });
        }

        const value = await redis.get(key.toLowerCase().trim());
        if (value) {
            response.json({ data: value });
        } else {
            response.status(404).json({ error: "Not found" });
        }
    } catch (error) {
        console.error(`Error retrieving key ${request.query.key}: ${error}`);
        response.status(500).json({ error: "Server error" });
    }
});

/**
 * @swagger
 * /store:
 *   post:
 *     summary: Update the store with a new key-value pair
 *     tags: [Store]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *               value:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully updated key
 *       400:
 *         description: Key and value are required
 *       500:
 *         description: Server error
 */
app.post('/store', async (request: Request, response: Response) => {
    const { key, value } = request.body;

    if (!key || !value) {
        return response.status(400).json({ error: "Invalid key" });
    }

    try {
        // Validate JSON format and limit size
        if (typeof value !== 'object') {
            return response.status(400).json({ error: "Value must be a JSON object" });
        }

        // Note: Express has a default POST request body limit size of 100kb
        // This is what's currently limiting the storage size
        const jsonString = JSON.stringify(value);
        await redis.set(String(key).toLowerCase().trim(), jsonString);
        response.json({ data: `Key ${key} updated successfully` });
    } catch (error) {
        console.error(`Error storing key ${JSON.stringify(key)} value ${JSON.stringify(value)}: ${error}`);
        response.status(500).json({ error: "Server error" });
    }
});

// Serve Swagger docs
app.use(swaggerUi.serve);
app.get('/', (_req, res) => {
    res.send(swaggerUi.generateHTML(swaggerDocs));
});

export const server = app.listen(process.env.NODE_PORT, () => {
    console.log(`Server started on port ${process.env.NODE_PORT}`);
});

app.listen(process.env.NODE_PORT, () => {
    console.log(`Server started on port ${process.env.NODE_PORT}`);
});
module.exports = app;