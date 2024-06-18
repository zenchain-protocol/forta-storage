import express, { Request, Response } from "express";
import Redis from "ioredis";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { validateJwtMiddleware } from "./middleware";
import { swaggerDocs } from "./swagger";

dotenv.config();

const app = express();
app.use(express.json());

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT!, 10),
    password: process.env.REDIS_PASSWORD,
});

// Apply JWT validation middleware to all routes
app.use(validateJwtMiddleware);

// Routes
/**
 * @swagger
 * /secret:
 *   get:
 *     summary: Retrieve a secret from environment variables
 *     tags: [Secrets]
 *     parameters:
 *       - in: query
 *         name: key
 *         required: true
 *         description: The key for the secret
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved secret
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
 *         description: Secret not found
 *       500:
 *         description: Server error
 */
app.get(`/secret`, async (request: Request, response: Response) => {
    try {
        const secretKey = request.query.key as string;
        if (!secretKey) {
            return response.status(400).json({ error: "No key provided" });
        }

        const secret = process.env[`SECRET_${secretKey.toUpperCase()}`];
        if (secret) {
            response.json({ data: secret });
        } else {
            response.status(404).json({ error: "Secret not found" });
        }
    } catch (error) {
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
            return response.status(400).json({ error: "No key provided" });
        }

        const value = await redis.get(key);
        if (value) {
            response.json({ data: value });
        } else {
            response.status(404).json({ error: "Key not found" });
        }
    } catch (error) {
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
    try {
        const { key, value } = request.body;

        if (!key || !value) {
            return response.status(400).json({ error: "Key and value are required" });
        }

        await redis.set(key, value);
        response.json({ data: `Key ${key} updated successfully` });
    } catch (error) {
        response.status(500).json({ error: "Server error" });
    }
});

// Serve Swagger docs
app.use(swaggerUi.serve);
app.get('/', (_req, res) => {
  res.send(swaggerUi.generateHTML(swaggerDocs));
});

app.listen(8080, () => {
    console.log(`Server started on port 8080`);
});
