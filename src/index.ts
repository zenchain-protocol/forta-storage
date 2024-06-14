import express, { Request, Response } from "express";
import { verifyJwt } from "@fortanetwork/forta-bot";

const app = express();
const router = express.Router();

router.get('/example-endpoint', async (request: Request, response: Response) => {
    // Assuming the JWT token is passed in the "x-access-token" header
    const token = request.headers["x-access-token"];

    const isValidJwt: boolean = await verifyJwt(`${token}`);

    // If you add additional claims you can verify those as well
    if (isValidJwt) {
        // Fetch data from database and return it in response
    } else {
        // return 401 error for invalid JWT
    }
})

app.use("/", router)

app.listen(8080, () => {
    console.log(`Server started`)
})