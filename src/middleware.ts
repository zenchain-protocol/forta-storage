import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "@fortanetwork/forta-bot";

export const validateJwtMiddleware = async (request: Request, response: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === "production") {
        const token = request.headers["authorization"]?.split(' ')[1] as string;

        if (!token) {
            console.error(`No token provided for request URL ${request.url}`);
            return response.status(401).json({ error: "Unauthorized access" });
        }

        try {
            const isValidJwt = await verifyJwt(token);
            if (!isValidJwt) {
                console.error(`Invalid token for request URL ${request.url}`);
                return response.status(401).json({ error: "Unauthorized access" });
            }
        } catch (error) {
            console.error(`Token validation failed for request URL ${request.url}: ${error}`);
            return response.status(500).json({ error: "Internal server error" });
        }
    } else {
        console.warn(`No JWT validation for environment ${process.env.NODE_ENV} for request URL ${request.url}`);
    }
    next();
};
