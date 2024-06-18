import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "@fortanetwork/forta-bot";

export const validateJwtMiddleware = async (request: Request, response: Response, next: NextFunction) => {
    // Only enable authentication for production builds
    if (process.env.NODE_ENV === "production") {
        const token = request.headers["authorization"]?.split(' ')[1] as string;

        if (!token) {
            return response.status(401).json({ error: "No token provided" });
        }

        try {

            const isValidJwt = await verifyJwt(token);

            if (!isValidJwt) {
                return response.status(401).json({ error: "Invalid token" });
            }
        } catch (error) {
            return response.status(500).json({ error: "Failed to authenticate token" });
        }
    } else {
        console.warn(`No JWT validation for environment ${process.env.NODE_ENV} for request URL ${request.url}`)
    }
    next();
};