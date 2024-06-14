import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { verifyJwt } from "@fortanetwork/forta-bot";

const app = express();
const router = express.Router();

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

// Example endpoint
router.get('/example-endpoint', async (request: Request, response: Response) => {
    // Assuming token is valid at this point
    // Fetch data from the database and return it in the response
    response.json({ data: "This is a protected resource" });
});

app.use("/", router);

app.listen(8080, () => {
    console.log(`Server started on port 8080`);
});
