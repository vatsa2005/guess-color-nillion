# Nillion Guess the Color 🎨

- Welcome to the Nillion Guess the Color project! This repository contains the implementation of a simple yet fun game where a player tries to guess a color chosen by the computer. The game is built using Nillion's secure multi-party computation (MPC) platform, ensuring that the player's guess and the computer's choice remain private throughout the computation.

## 🎮 Game Overview
Game Mechanics: The player is presented with a choice of six colors: Red, Blue, Green, Yellow, Orange, and Purple.
Objective: The player selects a color, and the game checks if the selected color matches the computer's secret color.
Outcome: The game returns whether the player's guess was correct or incorrect, all while maintaining the privacy of both the player's guess and the computer's secret choice.
## 🔒 Why Nillion?
Nillion's platform leverages advanced cryptographic techniques to ensure that all computations are performed securely without revealing the underlying data to any of the parties involved. This makes it an ideal platform for building privacy-preserving games and applications.

## 🛠️ Tech Stack
Frontend: React with Material-UI for a modern, responsive user interface.
Backend: Powered by Nillion's client SDK, which facilitates secure MPC operations.
Programming Language: Python and TypeScript for implementing the game logic and UI.

## 🚀 Features
Secure Guessing: Both the player's guess and the computer's color are kept secret using Nillion's secure MPC.
- Dynamic UI: Interactive and responsive interface using React and Material-UI.
Randomized Computer Choices: The computer's color is selected randomly, ensuring fairness in the game.
- 📦 Repository Structure
/src: Contains the React components and logic for the game interface.
/nada: Includes the Nillion DSL (Domain-Specific Language) code for handling secure computations.
/helpers: Utility functions for handling operations like storing secrets, retrieving quotes, and more.

## Run nillion-devnet

First, [install the Nillion SDK and nilup](https://docs.nillion.com/nillion-sdk-and-tools#installation) if you haven't

```
curl https://nilup.nilogy.xyz/install.sh | bash
```

Install the `latest` version of nillion-devnet to pull the latest updated versions SDK tools including the latest nillion-devnet, and optionally enable telemetry

```
nilup install latest
nilup use latest
nilup instrumentation enable --wallet <your-eth-wallet-address>
```

Run the devnet using any seed (the example uses "my-seed") so the cluster id, websockets, and other environment variables stay constant even when you restart nillion-devnet.

```shell
nillion-devnet --seed my-seed
```

You will see an output like this:

```
nillion-devnet --seed my-seed
ℹ️ cluster id is 222257f5-f3ce-4b80-bdbc-0a51f6050996
ℹ️ using 256 bit prime
ℹ️ storing state in /var/folders/1_/2yw8krkx5q5dn2jbhx69s4_r0000gn/T/.tmpU00Jbm (62.14Gbs available)
🏃 starting nilchain node in: /var/folders/1_/2yw8krkx5q5dn2jbhx69s4_r0000gn/T/.tmpU00Jbm/nillion-chain
⛓  nilchain JSON RPC available at http://127.0.0.1:48102
⛓  nilchain gRPC available at localhost:26649
🏃 starting node 12D3KooWMGxv3uv4QrGFF7bbzxmTJThbtiZkHXAgo3nVrMutz6QN
⏳ waiting until bootnode is up...
🏃 starting node 12D3KooWKkbCcG2ujvJhHe5AiXznS9iFmzzy1jRgUTJEhk4vjF7q
🏃 starting node 12D3KooWMgLTrRAtP9HcUYTtsZNf27z5uKt3xJKXsSS2ohhPGnAm
👛 funding nilchain keys
📝 nillion CLI configuration written to /Users/steph/Library/Application Support/nillion.nillion/config.yaml
🌄 environment file written to /Users/steph/Library/Application Support/nillion.nillion/nillion-devnet.env
```

Copy the path printed after "🌄 environment file written to" and open the file

```
vim "/Users/steph/Library/Application Support/nillion.nillion/nillion-devnet.env"
```

This file has the nillion-devnet generated values for cluster id, websocket, json rpc, and private key. You'll need to put these in your local .env in one of the next steps so that your cra-nillion demo app connects to the nillion-devnet.

## Connect to the Nillion Testnet

To connect your blind app to the Nillion Testnet, replace .env values with the [Testnet Config](https://docs.nillion.com/network-configuration)

## Clone this repo

```
git clone https://github.com/pranav2564/Blind-Computation-Game-Nillion.git
cd cra-nillion
```

Copy the up the .env.example file to a new .env and set up these variables to match the nillion environment file

```shell
cp .env.example .env
```

Update your newly created .env with environment variables outout in your terminal by nillion-devnet

```
REACT_APP_API_BASE_PATH=/nilchain-proxy

# replace with values from nillion-devnet or for Nillion Testnet

REACT_APP_NILLION_CLUSTER_ID=
REACT_APP_NILLION_BOOTNODE_WEBSOCKET=
REACT_APP_NILLION_NILCHAIN_JSON_RPC=
REACT_APP_NILLION_NILCHAIN_PRIVATE_KEY=
```

Install dependencies and start the demo project.

```shell
npm install
npm start
```