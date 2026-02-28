# 🌊 SolWink: The Ultimate Solana Blink Generator

SolWink is a lightning-fast, interactive CLI that scaffolds production-ready Solana Actions & Blinks in seconds. 

## 🌟 The Problem
Building a Solana Action was a manual, error-prone process that often led to hours of debugging Blank Link unfurls. 
The CORS Trap as Blinks are cross-origin by nature and the Next.js Bloat: Most tutorials force you into a heavy Next.js App Router setup just to serve a simple JSON response. This leads to slow cold starts and unnecessary complexity for a backend-only task. 

## 💡The Solution
SolWink automates the boring stuff so you can focus on the blockchain logic. It provides a pre-validated architecture that has passed the Dialect/Solana validator tests, ensuring your Blink "just works" the moment it hits X (Twitter).
Also it is the most pivotal project for Web2 Devs who want to become Web3 developers without going deep into Solana Action and Blinks.

## ⚡ Quick Start

You don't need to install anything globally. Scaffold your first Blink instantly using `npx` or traditional `npm`:

```bash
npx solwink-cli@latest
#or
npm i solwink-cli
```
## ✨ Why SolWink?
Building Solana Blinks should be fun, not frustrating. SolWink focuses on Developer Velocity:

Zero-Config Express Backend: We ditched the heavy frontend frameworks. SolWink generates pure, lightweight Express servers designed exclusively for API route handling.

Bulletproof CORS & Headers: Pre-configured with the exact X-Action-Version and Access-Control-Allow-Origin headers required by the Dialect validator.

Dynamic Network Selection: Choose between Mainnet or Devnet via interactive CLI dropdowns. SolWink automatically maps and injects the correct Chain ID into your project.

Smart Variable Injection: The CLI prompts you for your Treasury Wallet or Candy Machine ID and securely injects them directly into the generated codebase.

SolWink currently ships with the two most highly requested use cases in the Solana ecosystem:
Templates 

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