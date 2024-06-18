import swaggerJsDoc from "swagger-jsdoc";

// Swagger definition
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "forta-storage",
            version: "0.0.1",
            description: "An API providing secure secrets management and key-value storage for Forta bots using JWT.",
        },
    },
    apis: ["./dist/*.js"],
};

export const swaggerDocs = swaggerJsDoc(swaggerOptions);
