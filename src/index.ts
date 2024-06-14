import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { verifyJwt } from "@fortanetwork/forta-bot";
import Redis from "ioredis";
import dotenv from "dotenv";

// Initialize environment variables
dotenv.config();

const app = express();
const router = express.Router();
app.use(express.json()); // For parsing application/json

// Initialize Redis client
const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT!),
    password: process.env.REDIS_PASSWORD,
});

// Middleware to validate JWT
const validateJwtMiddleware = async (request: Request, response: Response, next: NextFunction) => {
    const token = request.headers["x-access-token"] as string;

    if (!token) {
        return response.status(401).json({ error: "No token provided" });
    }

    try {
        if (process.env.NODE_ENV === 'production') {
            // In production, use the verifyJwt function from Forta bot
            const isValidJwt = await verifyJwt(token);

            if (!isValidJwt) {
                return response.status(401).json({ error: "Invalid token" });
            }
        } else {
            // In development, just check if the token is a valid JWT format
            jwt.verify(token, "dummySecretForDev", (err) => {
                if (err) {
                    return response.status(401).json({ error: "Invalid token" });
                }
            });
        }
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        return response.status(500).json({ error: "Failed to authenticate token" });
    }
};

// Apply the JWT validation middleware to all routes
app.use(validateJwtMiddleware);

// Get a secret from environment variables
router.get('/secret', async (request: Request, response: Response) => {
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

// Get something from the store given a key
router.get('/store', async (request: Request, response: Response) => {
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

// Update the store given a key
router.post('/store', async (request: Request, response: Response) => {
    try {
        const key = request.body.key;
        const value = request.body.value;

        if (!key || !value) {
            return response.status(400).json({ error: "Key and value are required" });
        }

        await redis.set(key, value);
        response.json({ data: `Key ${key} updated successfully` });
    } catch (error) {
        response.status(500).json({ error: "Server error" });
    }
});

// Apply routes
app.use("/", router);

app.listen(8080, () => {
    console.log(`Server started on port 8080`);
});

