# API

This repository contains a simple API built with Node.js and Express. The API provides endpoints for retrieving data about Ethereum addresses and NFT collections.

## Table of Contents

- [Getting Started](#getting-started)
- [Endpoints](#endpoints)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

1. Clone the repository.
2. Run npm install to install the necessary dependencies.
3. Create a .env file in the root directory of the project and add the following environment variables:

```env
PORT=<port-number>
API_KEY=<api-key>
```

Replace <port-number> with the port number you want to use for the server, and <api-key> with your Ethereum API key.

4. Run npm start to start the server.

## Endpoints

The API provides the following endpoints:

### /age

- GET /age/:address - Returns the age in years of the provided Ethereum address.
- GET /age/collection/:contract - Returns the average age in years of all the addresses that own NFTs from the specified collection.
- GET /age/collection/:address/each - Returns the ages in years of all the addresses that own NFTs from the specified collection.

### /nft

- GET /nft/:address - Returns all the NFTs owned by the specified Ethereum address.
- GET /nft/collection/:address - Returns all the NFTs owned by all the addresses that own NFTs from the specified collection.
- GET /nft/collection/:address/common - Returns a count of how many times each NFT contract address appears in the collections of the addresses that own NFTs from the specified collection.
