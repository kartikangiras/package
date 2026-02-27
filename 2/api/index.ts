import express from "express";
import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
} from "@solana/actions";
import { clusterApiUrl } from "@solana/web3.js";

// Metaplex imports
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fetchCandyMachine, mintV2, mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
import { createNoopSigner, generateSigner, publicKey, transactionBuilder } from "@metaplex-foundation/umi";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import { toWeb3JsTransaction } from "@metaplex-foundation/umi-web3js-adapters";

const app = express();
app.use(express.json());

// --- THE BULLETPROOF CORS MIDDLEWARE ---
const ACTION_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Content-Encoding, Accept-Encoding",
  "Access-Control-Expose-Headers": "X-Action-Version, X-Blockchain-Ids", // The fix!
  "X-Action-Version": "2.1.3",
  "X-Blockchain-Ids": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
};

app.use((req, res, next) => {
  res.set(ACTION_HEADERS);
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// --- ACTION.JSON MAPPING ---
app.get("/actions.json", (req, res) => {
  res.json({
    rules: [
      { pathPattern: "/*", apiPath: "/api/mint" },
      { pathPattern: "/api/mint", apiPath: "/api/mint" }
    ]
  });
});

// --- GET: UI METADATA ---
app.get("/api/mint", (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  const payload: ActionGetResponse = {
    type: "action",
    // Professional 3D Digital Asset Placeholder
    icon: "https://ucarecdn.com/49ae4405-b0f3-4eab-93aa-97f259cebfba/-/preview/880x880/-/quality/smart/-/format/auto/", 
    title: "Mint Your Exclusive NFT",
    description: "Mint a digital collectible directly from this Blink using Metaplex Candy Machine.",
    label: "Mint NFT",
    links: {
      actions: [
        { 
          type: "transaction", 
          label: "Mint NFT", 
          href: `${baseUrl}/api/mint` 
        }
      ],
    },
  };

  res.json(payload);
});

// --- POST: BUILD TRANSACTION ---
app.post("/api/mint", async (req, res) => {
  try {
    const body: ActionPostRequest = req.body;
    
    const umi = createUmi(clusterApiUrl("devnet")).use(mplCandyMachine());
    const minterPubkey = publicKey(body.account);
    const cmPubkey = publicKey("7xKXtg2CW87d8V6zXKBq7cM8Y2FPHwzaAkxqEqD7x4rH"); 
    
    umi.use({
      install(umi) {
        umi.payer = createNoopSigner(minterPubkey);
      }
    });

    const candyMachine = await fetchCandyMachine(umi, cmPubkey);
    const nftSigner = generateSigner(umi);

    const builder = transactionBuilder()
      .add(setComputeUnitLimit(umi, { units: 800_000 })) 
      .add(
        mintV2(umi, {
          candyMachine: candyMachine.publicKey,
          nftMint: nftSigner,
          collectionMint: candyMachine.collectionMint,
          collectionUpdateAuthority: candyMachine.authority,
        })
      );

    const umiTransaction = await builder.buildAndSign(umi);
    const web3Transaction = toWeb3JsTransaction(umiTransaction);
    const serializedTransaction = Buffer.from(web3Transaction.serialize()).toString("base64");

    const payload: ActionPostResponse = {
      type: "transaction",
      transaction: serializedTransaction,
      message: `Successfully minted NFT! Address: ${nftSigner.publicKey.toString().slice(0, 8)}...`,
    };

    res.json(payload);
  } catch (err) {
    console.error("Minting Error:", err);
    res.status(500).json({ error: "Failed to build mint transaction." });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 SolWink NFT Server running on port ${PORT}`);
});