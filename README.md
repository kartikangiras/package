# 🌊 SolWink: The Ultimate Solana Blink Generator

SolWink is a lightning-fast, interactive CLI that scaffolds production-ready Solana Actions & Blinks in seconds. 

## 🌟 The Problem
A Solana Action (or Blink) is fundamentally just a simple API—it receives a GET or POST request and returns a JSON response.
However, the current developer ecosystem has a massive problem:

- The Next.js Bloat: Most standard tutorials force developers to spin up an entire Next.js application just to host this tiny API. This brings unnecessary frontend baggage, complex routing, and "cold start" delays when deployed to serverless environments.

- The CORS Trap: If a developer decides to build their own lightweight backend instead, they immediately hit a wall with CORS (Cross-Origin Resource Sharing). Solana wallets and the Dialect validator require extremely specific headers (like X-Action-Version and Access-Control-Allow-Origin). One typo, and the Blink fails to render on Twitter.


## 💡The Solution
When a developer runs npx solwink-cli, the tool:

- Ditches the Frontend: It generates a pure, "headless" Node.js/Express server. No React, no Next.js—just pure, fast API routes.

- Pre-configures Middleware: It automatically injects the exact, strictly-typed CORS headers required by the Solana ecosystem so the Blink is trusted instantly.

- Automates the Mapping: It creates the actions.json file and wires up the routing rules automatically, so the developer only has to write their smart contract logic.

- Dynamic Network Selection: Choose between Mainnet or Devnet. SolWink automatically maps and injects the correct Chain ID into your project.

- Smart Variable Injection: The CLI prompts you for your Treasury Wallet or Candy Machine ID and securely injects them directly into the generated codebase.


 In short: This CLI is turning a 2-hour frustrating configuration process into a 10-second command.

## ⚡ Quick Start

You don't need to install anything globally. Scaffold your first Blink instantly using `npx` or traditional `npm`:

```bash
npx solwink-cli@latest
#or
npm i solwink-cli
#then 
solwink (only for npm command)
```

## 💻 Use Cases
SolWink currently ships with the two most highly requested use cases in the Solana ecosystem:
Templates 

**1. SOL Donation (Crowdfund)**

A dynamic Blink that allows users to send SOL to a specific treasury wallet.

**2. NFT Mint (Metaplex Candy Machine)**

A fully integrated NFT minting Blink.

Features: Direct integration with Candy Machine v2/v3, pre-configured Umi instance, and optimized image rendering for Twitter unfurls.

Templates (under development)

We are actively expanding the SolWink template library to become the standard scaffolding tool for Solana Actions:

**3. SPL Token Transfer**

 Support for sending USDC, BONK, and other custom tokens.

**4. Jupiter Swaps**

 Direct token-to-token swaps right inside the Blink.

**5. DAO Governance**

 On-chain voting for Realms/Snapshot.

**6. Token Gating**

 A Blink that checks if you own a specific NFT. If you do, it reveals a "Claim" button for a discount code or secret link.


## 📁 Generated Architecture

SolWink generates a clean, Headless backend structure that is easy to deploy to Render, Railway, or Heroku:


Developed by Kartik Angiras with ♥️ for Solana community.