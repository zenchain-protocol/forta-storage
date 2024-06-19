# forta-storage

An API providing key-value storage for Forta bots using JWT.

## Running Locally

### Using Docker Compose

To run the application locally with Docker Compose, follow these steps:

1. **Build the Docker images**:
    ```bash
    docker-compose build --build-arg INSTALL_DEV=true
    ```

2. **Start the services**:
    ```bash
    docker-compose up -d api
    ``

3. **Run the test runner**:
    ```bash
    docker-compose run --rm test-runner
    ```

### Using Node.js and Local Redis

To run the application directly on your local machine using Node.js and a local Redis instance, follow these steps:

1. **Install Node.js**:
    Ensure you are using the correct version of Node.js specified in the `.nvmrc` file:
    ```bash
    nvm use
    ```

2. **Set Up Environment Variables**:
    Create a `.env` file from the `.env.example` in the main directory with the following content. Modify the values as needed:

    ```bash
    # Application environment variables
    NODE_ENV=development
    NODE_PORT=8080
    REDIS_HOST=localhost
    REDIS_PORT=6379
    REDIS_PASSWORD=undefined

    ## API KEYS

    # Required
    VALUE_ZETTABLOCK_API_KEY=
    VALUE_ZENCHAIN_API_KEY=

    # Optional, to support all chains
    VALUE_ETHERSCAN_API_KEY=
    VALUE_OPTIMISTIC_API_KEY=
    VALUE_BSCSCAN_API_KEY=
    VALUE_POLYGONSCAN_API_KEY=
    VALUE_FANTOMSCAN_API_KEY=
    VALUE_ARBISCAN_API_KEY=
    VALUE_SNOWTRACE_API_KEY=
    ```

3. **Install dependencies**:
    ```bash
    npm install
    ```

4. **Start the application**:
    ```bash
    npm start
    ```

Make sure you have a local Redis instance running with the same configurations as specified in the `.env` file.

### Swagger Documentation

Swagger documentation is available at `http://localhost:NODE_PORT` after starting the application. You can use this documentation to explore and test the API endpoints interactively.